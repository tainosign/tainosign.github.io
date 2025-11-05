// /js/counter-logic.js
import { initializeFirebase } from "/js/firebase-config.js";
import { collection, addDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let db, auth, userId;

// === カウンター初期化 ===
export async function setupCounter(appId) {
  const result = await initializeFirebase();
  db = result.db;
  auth = result.auth;

  // 認証後処理
  userId = auth.currentUser?.uid || null;

  // Firestoreリアルタイム監視
  setupRealtimeListener(appId);

  // ✅ logCount関数を登録
  window.logCount = async (type, count) => {
    if (!db) return;
    const logEntry = {
      type,
      count,
      timestamp: serverTimestamp(),
      user_id: userId,
    };
    await addDoc(collection(db, `/artifacts/${appId}/public/data/log`), logEntry);
  };
}

// === localin対応のリアルタイム更新 ===
function setupRealtimeListener(appId) {
  const logRef = collection(db, `/artifacts/${appId}/public/data/log`);
  onSnapshot(logRef, (snapshot) => {
    let current = 0;
    let localIn = 0;
    snapshot.forEach(doc => {
      const d = doc.data();
      if (["in", "exitin", "localin"].includes(d.type)) current += d.count;
      if (d.type === "out") current -= d.count;
      if (d.type === "localin") localIn += d.count;
    });

    const display = document.getElementById("current-count-value");
    if (display) {
      display.innerHTML = `${current} <span class="text-sm text-gray-200">(内、優先入場:${localIn} 出口0)</span>`;
    }
  });
}
