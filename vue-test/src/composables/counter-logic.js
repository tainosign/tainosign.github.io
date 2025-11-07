import { useFirebase } from "./useFirebase.js";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  increment,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let db, auth, userId;

function getJSTDateYMD() {
  const now = new Date();
  const jst = new Date(now.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }));
  const y = jst.getFullYear();
  const m = String(jst.getMonth() + 1).padStart(2, "0");
  const d = String(jst.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function setupCounter(appId) {
  const result = await initializeFirebase();
  db = result.db;
  auth = result.auth;
  userId = auth.currentUser?.uid || null;
}

export async function logCount(type, count, appId) {
  const jstYMD = getJSTDateYMD();
  const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" });

  const logRef = collection(db, `/artifacts/${appId}/public/data/log`);
  await addDoc(logRef, {
    type,
    count,
    timestamp: new Date(timestamp),
    event_day: jstYMD,
    user_id: userId,
  });

  const summaryRef = doc(db, `/artifacts/${appId}/public/data/summary/${jstYMD}`);
  const updateData = { updatedAt: new Date(timestamp) };
  updateData[type] = increment(count);

  await updateDoc(summaryRef, updateData).catch(async () => {
    await setDoc(summaryRef, {
      in: 0, out: 0, localin: 0, exitin: 0,
      [type]: count,
      updatedAt: new Date(timestamp),
    });
  });
}
