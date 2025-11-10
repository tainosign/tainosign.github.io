// composables/useFirestoreShifts.js
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import { getApp } from "firebase/app";
import { createShiftModel } from "@/models/shiftModel";

const useFirebase = () => {
  const app = getApp();
  const db = getFirestore(app);
  return { db };
};

/**
 * 複数日付のシフトを保存（shiftModel準拠）
 */
export const saveShiftsByDates = async (shifts) => {
  const { db } = useFirebase();

  for (const shift of shifts) {
    if (!shift?.day) continue; // dayが無ければ保存しない
    const ref = doc(db, "artifacts/setapanmarketcounter/public/data/shifts", shift.id);
    const data = { ...shift, updated_at: new Date() };
    await setDoc(ref, data, { merge: true });
    console.log(`✅ 保存完了: ${shift.day}`);
  }
};

/**
 * 指定した日付配列からシフトを取得（shiftModel構造で返す）
 */
export const getShiftsByDates = async (dateArray) => {
  const { db } = useFirebase();
  const colRef = collection(db, "artifacts/setapanmarketcounter/public/data/shifts");
  const q = query(colRef, where("day", "in", dateArray));
  const snap = await getDocs(q);

  const result = snap.docs.map((d) => createShiftModel(d.data()));
  console.log("📥 読み込み完了:", result.map((r) => r.day));
  return result;
};
