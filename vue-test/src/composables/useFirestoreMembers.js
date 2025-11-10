// src/composables/useFirestoreMembers.js
import { useFirebase } from "./useFirebase.js";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { createMemberModel } from "../models/shiftModel.js";

export function useFirestoreMembers() {
  const initColRef = async () => {
    const { db } = await useFirebase();
    return collection(db, "artifacts/setapanmarketcounter/public/data/members");
  };

  const addMember = async (data) => {
    const colRef = await initColRef();
    const member = createMemberModel(data);
    await setDoc(doc(colRef, member.id), member);
    return member;
  };

  const getMembers = async () => {
    const colRef = await initColRef();
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => d.data());
  };

  const updateMember = async (id, updates) => {
    const colRef = await initColRef();
    await updateDoc(doc(colRef, id), { ...updates, updated_at: new Date() });
  };

  const deleteMember = async (id) => {
    const colRef = await initColRef();
    await deleteDoc(doc(colRef, id));
  };

  const syncMembers = async (callback) => {
    const colRef = await initColRef();
    return onSnapshot(colRef, (snapshot) => {
      const data = snapshot.docs.map((d) => d.data());
      callback(data);
    });
  };

  return {
    addMember,
    getMembers,
    updateMember,
    deleteMember,
    syncMembers,
  };
}
