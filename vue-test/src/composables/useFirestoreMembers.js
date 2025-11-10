import { useFirebase } from "./useFirebase.js";
import { collection, doc, setDoc, getDocs, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { createMemberModel } from "../models/shiftModel.js";
import { v4 as uuidv4 } from "uuid";

export async function useFirestoreMembers() {
  const { db } = await useFirebase();
  const colRef = collection(db, "members");

  const addMember = async (data) => {
    const member = createMemberModel({ ...data, token: uuidv4() });
    await setDoc(doc(colRef, member.id), member);
    return member;
  };

  const getMembers = async () => {
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => d.data());
  };

  const updateMember = async (id, updates) => {
    await updateDoc(doc(colRef, id), { ...updates, updated_at: new Date() });
  };

  const deleteMember = async (id) => {
    await deleteDoc(doc(colRef, id));
  };

  const getMemberByToken = async (token) => {
    const snap = await getDocs(colRef);
    const match = snap.docs.map((d) => d.data()).find((m) => m.token === token);
    return match || null;
  };

  return { addMember, getMembers, updateMember, deleteMember, getMemberByToken };
}
