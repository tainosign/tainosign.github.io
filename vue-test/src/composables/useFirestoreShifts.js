// src/composables/useFirestoreShifts.js
import { useFirebase } from "@/composables/useFirebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getJSTDateString, toYMD_JST } from "./useJST.js";

export async function useFirestoreShifts() {
  const { db } = await useFirebase();
  const appId = "setapanmarketcounter";
  const basePath = `artifacts/${appId}/public/data/shifts`;

  /**
   * Firestoreのstatic/dayから日程情報を取得
   * （pre1, pre2, day1, day2）
   */
  const getFestivalDays = async () => {
    const dayRef = doc(db, `artifacts/${appId}/public/data/static/day`);
    const daySnap = await getDoc(dayRef);
    if (!daySnap.exists()) return [];
    const data = daySnap.data();

    const days = [];
    ["pre1", "pre2", "day1", "day2"].forEach((key) => {
      if (data[key]) days.push(toYMD_JST(data[key]));
    });
    return days;
  };

  /**
   * 指定日付のシフトを取得
   */
  const getShiftByDate = async (date) => {
    const ref = doc(db, `${basePath}/${date}`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  };

  /**
   * 祭りと準備日の全シフトを取得
   */
  const getAllFestivalShifts = async () => {
    const days = await getFestivalDays();
    const results = [];
    for (const d of days) {
      const shift = await getShiftByDate(d);
      if (shift) results.push(shift);
    }
    return results;
  };

  /**
   * シフトの保存（更新も含む）
   */
  const saveShift = async (date, data) => {
    const ref = doc(db, `${basePath}/${date}`);
    await setDoc(ref, { ...data, updated_at: new Date() });
  };

  return {
    getFestivalDays,
    getShiftByDate,
    getAllFestivalShifts,
    saveShift,
  };
}
