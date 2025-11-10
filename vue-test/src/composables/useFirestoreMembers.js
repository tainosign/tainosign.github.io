// src/composables/useFirestoreMembers.js
import { useFirebase } from "@/composables/useFirebase.js";
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

export function useFirestoreMembers() {
  const basePath = "artifacts/setapanmarketcounter/public/data/members";

  const initColRef = async () => {
    const { db } = await useFirebase();
    return collection(db, basePath);
  };

  const addMember = async (data) => {
    const colRef = await initColRef();
    await setDoc(doc(colRef, data.id), data);
  };

  const getMembers = async () => {
    const colRef = await initColRef();
    const snap = await getDocs(colRef);
    if (snap.empty) return [];
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
