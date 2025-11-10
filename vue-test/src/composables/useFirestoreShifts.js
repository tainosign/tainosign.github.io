// src/composables/useFirestoreShifts.js
import { useFirebase } from "./useFirebase.js";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { createShiftModel, createSlotModel } from "../models/shiftModel.js";

export function useFirestoreShifts() {
  // 初期化関数
  const init = async () => {
    const { db } = await useFirebase();
    const colRef = collection(db, "shifts");
    return { db, colRef };
  };

  // -------------------
  // データ操作
  // -------------------
  const addShift = async (data) => {
    const { colRef } = await init();
    const shift = createShiftModel(data);
    await setDoc(doc(colRef, shift.id), shift);
    return shift;
  };

  const getShifts = async () => {
    const { colRef } = await init();
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => d.data());
  };

  const updateShift = async (id, updates) => {
    const { colRef } = await init();
    await updateDoc(doc(colRef, id), { ...updates, updated_at: new Date() });
  };

  const addSlotToShift = async (shiftId, slotData) => {
    const { colRef } = await init();
    const slot = createSlotModel(slotData);
    const ref = doc(colRef, shiftId);
    const snap = await getDoc(ref);
    const shift = snap.data();
    const updatedSlots = [...(shift.slots || []), slot];
    await updateDoc(ref, { slots: updatedSlots, updated_at: new Date() });
    return slot;
  };

  // -------------------
  // リアルタイム監視
  // -------------------
  const syncShifts = async (callback) => {
    const { colRef } = await init();
    return onSnapshot(colRef, (snapshot) => {
      const data = snapshot.docs.map((d) => d.data());
      callback(data);
    });
  };

  return { addShift, getShifts, updateShift, addSlotToShift, syncShifts };
}
