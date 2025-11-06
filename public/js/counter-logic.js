// /js/counter-logic.js
import { initializeFirebase } from "/js/firebase-config.js";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  increment,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let db, auth, userId;

function getJSTDateYMD() {
  const now = new Date();
  const jst = new Date(now.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }));
  const y = jst.getFullYear();
  const m = String(jst.getMonth() + 1).padStart(2, "0");
  const d = String(jst.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`; // 例: 2025-11-01
}

/**
 * カウンター初期化
 */
export async function setupCounter(appId) {
  const result = await initializeFirebase();
  db = result.db;
  auth = result.auth;
  userId = auth.currentUser?.uid || null;

  // ✅ リアルタイム反映（現場表示用）
  setupRealtimeListener(appId);

  // ✅ グローバル関数登録（ボタンから呼ばれる）
window.logCount = async (type, count) => {
  if (!db) return;
  const jstYMD = getJSTDateYMD();
  const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" });

  // === ① 履歴ログを追加（完全履歴） ===
  const logRef = collection(db, `/artifacts/${appId}/public/data/log`);
  await addDoc(logRef, {
    type,
    count,
    timestamp: new Date(timestamp),
    event_day: jstYMD,
    user_id: userId,
  });

  // === ② summary を「JST日付」で管理 ===
  const summaryRef = doc(db, `/artifacts/${appId}/public/data/summary/${jstYMD}`);
  const updateData = { updatedAt: new Date(timestamp) };

  if (["in", "out", "localin", "exitin"].includes(type)) {
    updateData[type] = increment(count);
  }

  await updateDoc(summaryRef, updateData).catch(async () => {
    // ドキュメントが存在しない場合は作成
    await setDoc(summaryRef, {
      in: 0, out: 0, localin: 0, exitin: 0,
      [type]: count,
      updatedAt: new Date(timestamp),
    });
  });
};
}



/**
 * リアルタイム表示（画面内場内人数カウント）
 * summary方式でも従来方式でも動作
 */
function setupRealtimeListener(appId) {
  const jstYMD = getJSTDateYMD();
  const summaryRef = doc(db, `/artifacts/${appId}/public/data/summary/${jstYMD}`);

  onSnapshot(summaryRef, (snap) => {
    if (!snap.exists()) return;
    const d = snap.data();
    const inCount = d.in || 0;
    const outCount = d.out || 0;
    const localIn = d.localin || 0;
    const exitIn = d.exitin || 0;
    const current = inCount + localIn + exitIn - outCount;

    const display = document.getElementById("current-count-value");
    if (display) {
      display.innerHTML = `${current} <span class="text-sm text-gray-200">(内、優先入場:${localIn} 出口:${exitIn})</span>`;
    }
  });
}

