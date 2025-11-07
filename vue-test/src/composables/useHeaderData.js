import { ref } from "vue";
import { useFirebase } from "./useFirebase.js";
import { getJSTDateString } from "./useJST.js";
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
    const { db } = await useFirebase();
    const todayYMD = getJSTDateString();

    const ensureSummaryDoc = async (path) => {
      const refDoc = doc(db, path);
      const snap = await getDoc(refDoc);
      if (!snap.exists()) {
        await setDoc(refDoc, { in: 0, out: 0, localin: 0, exitin: 0 });
      }
      return refDoc;
    };

    const todayRef = await ensureSummaryDoc(`artifacts/${appId}/public/data/summary/${todayYMD}`);

    onSnapshot(todayRef, (snap) => {
      if (!snap.exists()) return;
      const d = snap.data();
      const inCount = d.in || 0;
      const outCount = d.out || 0;
      localIn.value = d.localin || 0;
      exitIn.value = d.exitin || 0;
      currentCount.value = inCount + localIn.value + exitIn.value - outCount;
      waitTime.value = ((currentCount.value / 100) * 5).toFixed(1);
    });
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
    initHeaderData
  };
}
