// /js/counter-logic.js
import { initializeFirebase } from "/js/firebase-config.js";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  increment,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let db, auth, userId;

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
    const timestamp = serverTimestamp();

    // === ① 履歴ログを追加（完全履歴） ===
    const logRef = collection(db, `/artifacts/${appId}/public/data/log`);
    await addDoc(logRef, {
      type,
      count,
      timestamp,
      user_id: userId,
    });

    // === ② summaryをリアルタイム更新 ===
    const summaryRef = doc(db, `/artifacts/${appId}/public/data/summary/today`);
    const updateData = { updatedAt: timestamp };

    // typeに応じてincrement処理
    if (["in", "out", "localin", "exitin"].includes(type)) {
      updateData[type] = increment(count);
    }

    await updateDoc(summaryRef, updateData);
  };
}

/**
 * リアルタイム表示（画面内場内人数カウント）
 * summary方式でも従来方式でも動作
 */
function setupRealtimeListener(appId) {
  const summaryRef = doc(db, `/artifacts/${appId}/public/data/summary/today`);

  // ✅ summaryのリアルタイム監視（最優先・軽量）
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
