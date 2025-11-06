import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeFirebase, appId as globalAppId } from '../firebase/config'; 

// --- 時間操作ヘルパー（省略しない） ---
const getJSTDateYMD = () => {
    const now = new Date();
    const jstDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
    
    const year = jstDate.getFullYear();
    const month = String(jstDate.getMonth() + 1).padStart(2, '0');
    const day = String(jstDate.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

const formatJSTDate = (timestamp, format) => {
    if (!timestamp) return '--/--';
    let date;
    if (timestamp instanceof Date) {
        date = timestamp;
    } else if (timestamp.toDate) {
        date = timestamp.toDate();
    } else {
        return '--/--';
    }

    const options = {
        timeZone: "Asia/Tokyo",
        year: format === 'YMD' ? 'numeric' : undefined,
        month: '2-digit',
        day: '2-digit',
    };
    
    const parts = new Intl.DateTimeFormat('ja-JP', options).formatToParts(date);

    const month = parts.find(p => p.type === 'month')?.value || 'MM';
    const day = parts.find(p => p.type === 'day')?.value || 'DD';
    
    if (format === 'YMD') {
        const year = parts.find(p => p.type === 'year')?.value || 'YYYY';
        return `${year}${month}${day}`;
    }
    if (format === 'MD') return `${month}/${day}`;
    return `${month}/${day}`;
};

const toYMD_JST = (timestamp) => formatJSTDate(timestamp, 'YMD');
const toMD_JST = (timestamp) => formatJSTDate(timestamp, 'MD');
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
                    const day1YMD = data.day1 ? toYMD_JST(data.day1) : null;
                    const day2YMD = data.day2 ? toYMD_JST(data.day2) : null;
                    
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
            const todayYMD = getJSTDateYMD();
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
