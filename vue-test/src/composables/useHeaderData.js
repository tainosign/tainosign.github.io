import { ref } from "vue";
import { useFirebase } from "./useFirebase.js";
import { getJSTDateString, toYMD_JST, toMD_JST } from "./useJST.js";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

export function useHeaderData() {
  const currentCount = ref(0);
  const localIn = ref(0);
  const exitIn = ref(0);
  const waitTime = ref("--");
  const date1 = ref("--/--");
  const date2 = ref("--/--");
  const day1Total = ref(0);
  const day2Total = ref(0);
  const totalVisitors = ref(0);

  async function initHeaderData(appId) {
    try {
      const { db } = await useFirebase();
      const todayYMD = getJSTDateString();

      // === イベント日付を取得 ===
      const dayDoc = doc(db, `artifacts/${appId}/public/data/static/day`);
      const daySnap = await getDoc(dayDoc);
      if (daySnap.exists()) {
        const data = daySnap.data();
        date1.value = `[${toMD_JST(data.day1)}]`;
        date2.value = `[${toMD_JST(data.day2)}]`;
      }

      // === 来場者情報を監視 ===
      const summaryRef = doc(db, `artifacts/${appId}/public/data/summary/${todayYMD}`);
      const summarySnap = await getDoc(summaryRef);
      if (!summarySnap.exists()) {
        await setDoc(summaryRef, { in: 0, out: 0, localin: 0, exitin: 0 });
      }

      onSnapshot(summaryRef, (snap) => {
        if (!snap.exists()) return;
        const d = snap.data();
        const inCount = d.in || 0;
        const outCount = d.out || 0;
        localIn.value = d.localin || 0;
        exitIn.value = d.exitin || 0;

        currentCount.value = inCount + localIn.value + exitIn.value - outCount;
        waitTime.value = ((currentCount.value / 100) * 5).toFixed(1);
      });

      // === 両日来場者合計 ===
      const day1Ref = doc(db, `artifacts/${appId}/public/data/summary/${toYMD_JST(daySnap.data()?.day1)}`);
      const day2Ref = doc(db, `artifacts/${appId}/public/data/summary/${toYMD_JST(daySnap.data()?.day2)}`);

      const [snap1, snap2] = await Promise.all([getDoc(day1Ref), getDoc(day2Ref)]);
      if (snap1.exists()) {
        const d = snap1.data();
        day1Total.value = (d.in || 0) + (d.localin || 0) + (d.exitin || 0);
      }
      if (snap2.exists()) {
        const d = snap2.data();
        day2Total.value = (d.in || 0) + (d.localin || 0) + (d.exitin || 0);
      }
      totalVisitors.value = day1Total.value + day2Total.value;
    } catch (e) {
      console.error("❌ useHeaderData/initHeaderData エラー:", e);
    }
  }

  return {
    currentCount,
    localIn,
    exitIn,
    waitTime,
    date1,
    date2,
    day1Total,
    day2Total,
    totalVisitors,
    initHeaderData,
  };
}
