// src/composables/useFirestoreMembers.js
import { useFirebase } from "./useFirebase.js";
import { collection, doc, setDoc, getDocs, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { createMemberModel } from "../models/shiftModel.js";

export function useFirestoreMembers() {
  const init = async () => {
    const { db } = await useFirebase();
    const colRef = collection(db, "members");
    return { db, colRef };
  };

  const addMember = async (data) => {
    const { colRef } = await init();
    const member = createMemberModel({ ...data, token: uuidv4() });
    await setDoc(doc(colRef, member.id), member);
    return member;
  };

  const getMembers = async () => {
    const { colRef } = await init();
    const snap = await getDocs(colRef);
    return snap.docs.map(d => d.data());
  };

  const updateMember = async (id, updates) => {
    const { colRef } = await init();
    await updateDoc(doc(colRef, id), { ...updates, updated_at: new Date() });
  };

  const deleteMember = async (id) => {
    const { colRef } = await init();
    await deleteDoc(doc(colRef, id));
  };

  const getMemberByToken = async (token) => {
    const all = await getMembers();
    return all.find(m => m.token === token) || null;
  };

  const syncMembers = async (callback) => {
    const { colRef } = await init();
    return onSnapshot(colRef, (snapshot) => {
      callback(snapshot.docs.map(d => d.data()));
    });
  };

  return { addMember, getMembers, updateMember, deleteMember, getMemberByToken, syncMembers };
}
