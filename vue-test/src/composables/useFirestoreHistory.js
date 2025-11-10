import { useFirebase } from "./useFirebase.js";
import { collection, doc, addDoc, getDocs } from "firebase/firestore";
import { createHistoryModel } from "../models/shiftModel.js";

export async function useFirestoreHistory() {
  const { db } = await useFirebase();
  const colRef = collection(db, "history");

  const addHistory = async (type, targetId, detail) => {
    const history = createHistoryModel({ type, targetId, detail });
    await addDoc(colRef, history);
  };

  const getHistory = async () => {
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => d.data());
  };

  return { addHistory, getHistory };
}
