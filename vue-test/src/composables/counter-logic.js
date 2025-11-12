// src/composables/counter-logic.js
import { useFirebase } from "./useFirebase.js";
import { collection, addDoc, doc, setDoc, updateDoc, increment, onSnapshot } from "firebase/firestore";
import { getJSTDateString, firestoreTimestampJST } from "./useJST.js";

let db, auth, userId;

export async function setupCounter(appId) {
  const result = await useFirebase();
  db = result.db;
  auth = result.auth;
  userId = auth.currentUser?.uid || null;

  setupRealtimeListener(appId);
}

export async function logCount(type, count, appId) {
  if (!db) return;

  const jstYMD = getJSTDateString();
  const timestamp = firestoreTimestampJST();

  const logRef = collection(db, `/artifacts/${appId}/public/data/log`);
  await addDoc(logRef, {
    type,
    count,
    timestamp,
    event_day: jstYMD,
    user_id: userId,
  });

  const summaryRef = doc(db, `/artifacts/${appId}/public/data/summary/${jstYMD}`);
  const updateData = { updatedAt: timestamp };
  if (["in", "out", "localin", "exitin"].includes(type)) updateData[type] = increment(count);

  await updateDoc(summaryRef, updateData).catch(async () => {
    await setDoc(summaryRef, {
      in: 0,
      out: 0,
      localin: 0,
      exitin: 0,
      [type]: count,
      updatedAt: timestamp,
    });
  });
}

function setupRealtimeListener(appId) {
  if (!db) return;
  const jstYMD = getJSTDateString();
  const summaryRef = doc(db, `/artifacts/${appId}/public/data/summary/${jstYMD}`);

  onSnapshot(summaryRef, (snap) => {
    if (!snap.exists()) return;
    const d = snap.data();
    const currentEl = document.getElementById("current-count-value");
    const localEl = document.getElementById("localin-count");
    const exitEl = document.getElementById("exitin-count");

    const current = (d.in || 0) + (d.localin || 0) + (d.exitin || 0) - (d.out || 0);
    if (currentEl) currentEl.textContent = current;
    if (localEl) localEl.textContent = d.localin || 0;
    if (exitEl) exitEl.textContent = d.exitin || 0;
  });
}
