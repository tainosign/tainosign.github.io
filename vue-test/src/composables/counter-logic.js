import { useFirebase } from "./useFirebase.js";
// import { collection, addDoc, doc, setDoc, updateDoc, increment, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { collection, addDoc, doc, setDoc, updateDoc, increment, onSnapshot } from "firebase/firestore";

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
  const result = await useFirebase();
  db = result.db;
  auth = result.auth;
  userId = auth.currentUser?.uid || null;

  setupRealtimeListener(appId);

  // グローバル登録はしない
}

export async function logCount(type, count, appId) {
  if (!db) return; // db 未初期化なら無視

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
  if (["in","out","localin","exitin"].includes(type)) updateData[type] = increment(count);

  await updateDoc(summaryRef, updateData).catch(async () => {
    await setDoc(summaryRef, {
      in:0, out:0, localin:0, exitin:0,
      [type]: count,
      updatedAt: new Date(timestamp),
    });
  });
}

function setupRealtimeListener(appId) {
  if (!db) return;
  const jstYMD = getJSTDateYMD();
  const summaryRef = doc(db, `/artifacts/${appId}/public/data/summary/${jstYMD}`);

  onSnapshot(summaryRef, (snap) => {
    if (!snap.exists()) return;
    const d = snap.data();
    const currentEl = document.getElementById("current-count-value");
    const localEl = document.getElementById("localin-count");
    const exitEl = document.getElementById("exitin-count");

    const current = (d.in||0) + (d.localin||0) + (d.exitin||0) - (d.out||0);
    if (currentEl) currentEl.textContent = current;
    if (localEl) localEl.textContent = d.localin||0;
    if (exitEl) exitEl.textContent = d.exitin||0;
  });
}
