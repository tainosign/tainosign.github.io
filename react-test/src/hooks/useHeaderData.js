import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getJSTDateYMD, toYMD_JST, toMD_JST } from '../utils/time';

// Firestoreのパス生成ヘルパー
const getSummaryPath = (appId, dateYMD) => `artifacts/${appId}/public/data/summary/${dateYMD}`;
const getStaticDayPath = (appId) => `artifacts/${appId}/public/data/static/day`;

// 初期データ構造
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

/**
 * summaryドキュメントの存在を確認し、なければ初期化する
 */
async function ensureSummaryDoc(db, path) {
    const ref = doc(db, path);
    try {
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            // 初期データ (header-loader.jsのロジックに従う)
            await setDoc(ref, { in: 0, out: 0, localin: 0, exitin: 0, createdAt: new Date() }, { merge: true });
            console.log(`🟢 Summaryを初期化: ${path}`);
        }
    } catch (error) {
        console.error("Error ensuring summary document:", path, error);
    }
    return ref;
}

/**
 * Headerに表示するリアルタイムデータと過去の集計データを取得するカスタムフック
 * @param {import('firebase/firestore').Firestore | null} db - Firestoreインスタンス
 * @param {string} appId - アプリケーションID
 * @returns {[object, boolean]} [headerData, isDataLoading]
 */
export const useHeaderData = (db, appId) => {
    const [headerData, setHeaderData] = useState(initialHeaderData);
    const [isDataLoading, setIsDataLoading] = useState(true);

    useEffect(() => {
        if (!db || !appId) {
            setIsDataLoading(false);
            return;
        }

        setIsDataLoading(true);
        let unsubscribeToday, unsubscribeDay1, unsubscribeDay2;
        let day1Total = 0;
        let day2Total = 0;

        const updateState = (newValues) => {
            setHeaderData(prev => ({ ...prev, ...newValues }));
        };
        
        // ------------------------------------
        // 2. Day Summary (過去来場者数) の監視関数
        // ------------------------------------
        const startDaySummaryListener = async (dateYMD, dayIndex) => {
            const path = getSummaryPath(appId, dateYMD);
            const ref = await ensureSummaryDoc(db, path);
            
            const listener = onSnapshot(ref, (snap) => {
                if (!snap.exists()) return;
                const d = snap.data();
                // 過去の来場者数は、IN側のすべての合計
                const total = (d.in || 0) + (d.localin || 0) + (d.exitin || 0);
                
                if (dayIndex === 1) {
                    day1Total = total;
                    updateState({
                        day1Visitors: day1Total,
                        totalVisitors: day1Total + day2Total,
                    });
                } else if (dayIndex === 2) {
                    day2Total = total;
                    updateState({
                        day2Visitors: day2Total,
                        totalVisitors: day1Total + day2Total,
                    });
                }
            }, (error) => console.error(`Error listening to Day ${dayIndex} summary:`, error));

            return listener;
        };

        // ------------------------------------
        // 1. イベント日付（static/day）の取得とDay Summary監視の開始
        // ------------------------------------
        const setupDayListeners = async () => {
            const dayDocRef = doc(db, getStaticDayPath(appId));
            
            // static/dayは滅多に変わらないため、getDocで取得
            const daySnap = await getDoc(dayDocRef);
            
            if (daySnap.exists()) {
                const data = daySnap.data();
                const day1YMD = data.day1 ? toYMD_JST(data.day1) : null;
                const day2YMD = data.day2 ? toYMD_JST(data.day2) : null;
                
                updateState({
                    day1Date: data.day1 ? toMD_JST(data.day1) : initialHeaderData.day1Date,
                    day2Date: data.day2 ? toMD_JST(data.day2) : initialHeaderData.day2Date,
                });
                
                // Day1/Day2のサマリー監視を開始し、クリーンアップ関数を保存
                if (day1YMD) unsubscribeDay1 = await startDaySummaryListener(day1YMD, 1);
                if (day2YMD) unsubscribeDay2 = await startDaySummaryListener(day2YMD, 2);
            }
        };

        // ------------------------------------
        // 3. 今日の Summary（場内人数）の監視を開始
        // ------------------------------------
        const startTodaySummaryListener = async () => {
            const todayYMD = getJSTDateYMD();
            const path = getSummaryPath(appId, todayYMD);
            const todayRef = await ensureSummaryDoc(db, path);

            unsubscribeToday = onSnapshot(todayRef, (snap) => {
                if (!snap.exists()) return;
                const d = snap.data();
                const inCount = d.in || 0;
                const outCount = d.out || 0;
                const localIn = d.localin || 0;
                const exitIn = d.exitin || 0;
                
                // 場内人数 = (入場 + 優先入場 + 出口からの再入場) - 出口
                const current = inCount + localIn + exitIn - outCount;
                
                // 待ち時間計算 (current / 100 * 5)
                const wait = (current / 100 * 5);
                const waitTime = isNaN(wait) || current < 0 ? "--" : wait.toFixed(1);

                updateState({
                    currentCount: current < 0 ? 0 : current, // マイナスは0とする
                    localInCount: localIn,
                    exitInCount: exitIn,
                    waitTime: waitTime,
                });

                setIsDataLoading(false);
            }, (error) => {
                console.error("Error listening to Today summary:", error);
                setIsDataLoading(false);
            });
        };
        
        // メイン実行
        setupDayListeners();
        startTodaySummaryListener();

        // クリーンアップ関数: コンポーネントがアンマウントされる際にリスナーを停止する
        return () => {
            if (unsubscribeToday) unsubscribeToday();
            if (unsubscribeDay1) unsubscribeDay1();
            if (unsubscribeDay2) unsubscribeDay2();
        };

    }, [db, appId]); // dbとappIdが変更された場合に再実行

    return [headerData, isDataLoading];
};
