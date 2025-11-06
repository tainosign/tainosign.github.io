// useHeaderData.js
import { useState, useEffect } from "react";
import { db, auth, appId as globalAppId } from "../firebase/config";
import { getJSTDateYMD, toYMD_JST, toMD_JST } from "../utils/time";

const getSummaryPath = (appId, dateYMD) => `artifacts/${appId}/public/data/summary/${dateYMD}`;
const getStaticDayPath = (appId) => `artifacts/${appId}/public/data/static/day`;

const initialHeaderData = {
  currentCount: 0,
  localInCount: 0,
  exitInCount: 0,
  waitTime: "--",
  day1Date: "[--/--]",
  day1Visitors: 0,
  day2Date: "[--/--]",
  day2Visitors: 0,
  totalVisitors: 0,
};

// summary ドキュメントを存在させる
async function ensureSummaryDoc(db, path) {
  const ref = db.doc(path);
  try {
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({ in: 0, out: 0, localin: 0, exitin: 0, createdAt: new Date() });
    }
  } catch (error) {
    console.error("Error ensuring summary document:", path, error);
  }
  return ref;
}

export const useHeaderData = () => {
  const [headerData, setHeaderData] = useState(initialHeaderData);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // 認証
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!isMounted) return;
      setUserId(user ? user.uid : null);
      setIsAuthLoading(false);
    });

    // 匿名サインイン
    if (!auth.currentUser) {
      auth.signInAnonymously().catch(console.error);
    }

    return () => {
      isMounted = false;
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    setIsDataLoading(true);

    let unsubToday, unsubDay1, unsubDay2;
    let day1Total = 0,
      day2Total = 0;

    const updateState = (values) => setHeaderData((prev) => ({ ...prev, ...values }));

    const startDaySummaryListener = async (dateYMD, dayIndex) => {
      const path = getSummaryPath(globalAppId, dateYMD);
      const ref = await ensureSummaryDoc(db, path);

      const listener = ref.onSnapshot((snap) => {
        if (!snap.exists) return;
        const d = snap.data();
        const total = (d.in || 0) + (d.localin || 0) + (d.exitin || 0);
        if (dayIndex === 1) day1Total = total;
        else if (dayIndex === 2) day2Total = total;

        updateState({
          [`day${dayIndex}Visitors`]: total,
          totalVisitors: day1Total + day2Total,
        });
      });

      return listener;
    };

    const setupDayListeners = async () => {
      const dayRef = db.doc(getStaticDayPath(globalAppId));
      const snap = await dayRef.get();
      if (!snap.exists) return;
      const data = snap.data();

      const day1YMD = data.day1 ? toYMD_JST(data.day1).replace(/-/g, "") : null;
      const day2YMD = data.day2 ? toYMD_JST(data.day2).replace(/-/g, "") : null;

      updateState({
        day1Date: data.day1 ? toMD_JST(data.day1) : initialHeaderData.day1Date,
        day2Date: data.day2 ? toMD_JST(data.day2) : initialHeaderData.day2Date,
      });

      if (day1YMD) unsubDay1 = await startDaySummaryListener(day1YMD, 1);
      if (day2YMD) unsubDay2 = await startDaySummaryListener(day2YMD, 2);
    };

    const startTodayListener = async () => {
      const todayYMD = getJSTDateYMD().replace(/-/g, "");
      const path = getSummaryPath(globalAppId, todayYMD);
      const ref = await ensureSummaryDoc(db, path);

      unsubToday = ref.onSnapshot((snap) => {
        if (!snap.exists) return;
        const d = snap.data();
        const current = (d.in || 0) + (d.localin || 0) + (d.exitin || 0) - (d.out || 0);
        const wait = (current / 100) * 5;
        const waitTime = isNaN(wait) || current < 0 ? "--" : wait.toFixed(1);

        updateState({
          currentCount: current < 0 ? 0 : current,
          localInCount: d.localin || 0,
          exitInCount: d.exitin || 0,
          waitTime,
        });

        setIsDataLoading(false);
      });
    };

    setupDayListeners();
    startTodayListener();

    return () => {
      unsubToday?.();
      unsubDay1?.();
      unsubDay2?.();
    };
  }, [isAuthLoading]);

  return [headerData, isDataLoading, userId, isAuthLoading];
};
