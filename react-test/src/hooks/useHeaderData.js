import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeFirebase, appId as globalAppId } from '../firebase/config'; 

// 💡 既存の time.js から JST ヘルパー関数をインポート
import { getJSTDateYMD, toYMD_JST, toMD_JST } from '../utils/time';

// ----------------------------------------

const getSummaryPath = (appId, dateYMD) => `artifacts/${appId}/public/data/summary/${dateYMD}`;
const getStaticDayPath = (appId) => `artifacts/${appId}/public/data/static/day`;

const initialHeaderData = {
    currentCount: 0,
    localInCount: 0,
    exitInCount: 0,
    waitTime: '--',
    day1Date: '[--/--]',
    day1Visitors: 0,
    day2Date: '[--/--]',
    day2Visitors: 0,
    totalVisitors: 0,
};

async function ensureSummaryDoc(db, path) {
    const ref = doc(db, path);
    try {
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            await setDoc(ref, { in: 0, out: 0, localin: 0, exitin: 0, createdAt: new Date() }, { merge: true });
            console.log(`🟢 Summary initialized: ${path}`);
        }
    } catch (error) {
        console.error("Error ensuring summary document:", path, error);
    }
    return ref;
}

export const useHeaderData = () => {
    const [db, setDb] = useState(null);
    const appId = globalAppId;

    const [userId, setUserId] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    const [headerData, setHeaderData] = useState(initialHeaderData);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isFirebaseReady, setIsFirebaseReady] = useState(false);

    // 1. Firebase初期化と認証処理
    useEffect(() => {
        let isMounted = true;
        let unsubscribeAuth;

        const setupFirebaseAndAuth = async () => {
            try {
                const { db, auth } = await initializeFirebase(); 
                
                if (isMounted) {
                    setDb(db);
                    setIsFirebaseReady(true);
                }
                
                unsubscribeAuth = onAuthStateChanged(auth, (user) => {
                    if (isMounted) {
                        setUserId(user ? user.uid : null);
                        setIsAuthLoading(false); // 認証状態が確定
                    }
                });

            } catch (error) {
                console.error("Failed to initialize Firebase in useHeaderData:", error);
                if (isMounted) {
                    setIsDataLoading(false);
                    setIsAuthLoading(false);
                }
            }
        };

        setupFirebaseAndAuth();
        
        return () => { 
            isMounted = false; 
            if (unsubscribeAuth) unsubscribeAuth();
        };
    }, []);

    // 2. データ監視
    useEffect(() => {
        // 認証状態が確定してからデータ取得を開始
        if (!isFirebaseReady || !db || !appId || isAuthLoading) {
            if (isFirebaseReady && !isAuthLoading) setIsDataLoading(false);
            return;
        }

        setIsDataLoading(true);
        let unsubscribeToday, unsubscribeDay1, unsubscribeDay2;
        let day1Total = 0;
        let day2Total = 0;

        const updateState = (newValues) => {
            setHeaderData(prev => ({ ...prev, ...newValues }));
        };
        
        const startDaySummaryListener = async (dateYMD, dayIndex) => {
            const path = getSummaryPath(appId, dateYMD);
            try {
                const ref = await ensureSummaryDoc(db, path);
                
                const listener = onSnapshot(ref, (snap) => {
                    if (!snap.exists()) return;
                    const d = snap.data();
                    const total = (d.in || 0) + (d.localin || 0) + (d.exitin || 0);
                    
                    if (dayIndex === 1) {
                        day1Total = total;
                    } else if (dayIndex === 2) {
                        day2Total = total;
                    }
                    
                    updateState({
                        [`day${dayIndex}Visitors`]: total,
                        totalVisitors: day1Total + day2Total,
                    });
                }, (error) => console.error(`Error listening to Day ${dayIndex} summary:`, error));

                return listener;
            } catch (e) {
                console.error(`Failed to setup listener for Day ${dayIndex}:`, e);
                return null;
            }
        };

        const setupDayListeners = async () => {
            const dayDocRef = doc(db, getStaticDayPath(appId));
            
            try {
                const daySnap = await getDoc(dayDocRef);
                
                if (daySnap.exists()) {
                    const data = daySnap.data();
                    
                    // 🚨 toYMD_JSTは 'YYYY-MM-DD' を返すため、Firestoreパス用にハイフンを除去
                    const day1YMD = data.day1 ? toYMD_JST(data.day1).replace(/-/g, '') : null;
                    const day2YMD = data.day2 ? toYMD_JST(data.day2).replace(/-/g, '') : null;
                    
                    updateState({
                        day1Date: data.day1 ? toMD_JST(data.day1) : initialHeaderData.day1Date,
                        day2Date: data.day2 ? toMD_JST(data.day2) : initialHeaderData.day2Date,
                    });
                    
                    if (day1YMD) unsubscribeDay1 = await startDaySummaryListener(day1YMD, 1);
                    if (day2YMD) unsubscribeDay2 = await startDaySummaryListener(day2YMD, 2);
                }
            } catch (e) {
                console.error("Failed to fetch day static data:", e);
            }
        };

        const startTodaySummaryListener = async () => {
            // 🚨 getJSTDateYMDは 'YYYY-MM-DD' を返すため、Firestoreパス用にハイフンを除去
            const todayYMD = getJSTDateYMD().replace(/-/g, '');
            const path = getSummaryPath(appId, todayYMD);
            
            try {
                const todayRef = await ensureSummaryDoc(db, path);

                unsubscribeToday = onSnapshot(todayRef, (snap) => {
                    if (!snap.exists()) return;
                    const d = snap.data();
                    const inCount = d.in || 0;
                    const outCount = d.out || 0;
                    const localIn = d.localin || 0;
                    const exitIn = d.exitin || 0;
                    
                    const current = inCount + localIn + exitIn - outCount;
                    
                    const wait = (current / 100 * 5);
                    const waitTime = isNaN(wait) || current < 0 ? "--" : wait.toFixed(1);

                    updateState({
                        currentCount: current < 0 ? 0 : current,
                        localInCount: localIn,
                        exitInCount: exitIn,
                        waitTime: waitTime,
                    });

                    setIsDataLoading(false);
                }, (error) => {
                    console.error("Error listening to Today summary:", error);
                    setIsDataLoading(false);
                });
            } catch (e) {
                console.error("Failed to setup today summary listener:", e);
                setIsDataLoading(false);
            }
        };
        
        setupDayListeners();
        startTodaySummaryListener();

        // クリーンアップ
        return () => {
            if (unsubscribeToday) unsubscribeToday();
            if (unsubscribeDay1) unsubscribeDay1();
            if (unsubscribeDay2) unsubscribeDay2();
        };

    }, [isFirebaseReady, db, appId, isAuthLoading]);

    return [headerData, isDataLoading, userId, isAuthLoading];
};
