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
  waitTime: '--',
  day1Date: '[--/--]',
  day1Visitors: 0,
  day2Date: '[--/--]',
  day2Visitors: 0,
  totalVisitors: 0,
};

function ensureSummaryDoc(ref) {
  return ref.get().then(snap => {
    if (!snap.exists) {
      ref.set({ in: 0, out: 0, localin: 0, exitin: 0, createdAt: new Date() }, { merge: true });
      console.log("🟢 Summary initialized:", ref.path);
    }
    return ref;
  }).catch(err => {
    console.error("Error ensuring summary document:", ref.path, err);
    return ref;
  });
}

export const useHeaderData = () => {
  const [headerData, setHeaderData] = useState(initialHeaderData);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Auth状態監視
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  // データ監視
  useEffect(() => {
    const todayYMD = getJSTDateYMD().replace(/-/g, '');
    const todayRef = db.collection(getSummaryPath(globalAppId, todayYMD)).doc("summaryDoc");

    ensureSummaryDoc(todayRef).then(ref => {
      const unsubscribe = ref.onSnapshot(doc => {
        if (!doc.exists) return;
        const d = doc.data();
        const current = (d.in || 0) + (d.localin || 0) + (d.exitin || 0) - (d.out || 0);
        const wait = (current / 100 * 5);
        const waitTime = isNaN(wait) || current < 0 ? "--" : wait.toFixed(1);

        setHeaderData(prev => ({
          ...prev,
          currentCount: current < 0 ? 0 : current,
          localInCount: d.localin || 0,
          exitInCount: d.exitin || 0,
          waitTime: waitTime,
        }));
        setIsDataLoading(false);
      }, error => {
        console.error("Error listening Today summary:", error);
        setIsDataLoading(false);
      });

      return () => unsubscribe();
    });
  }, []);

  return [headerData, isDataLoading, userId];
};
