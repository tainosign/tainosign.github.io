// /js/counter-logic.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, doc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

let db, auth, userId;
let daySettings = { day1: null, day2: null };

export async function setupCounter(appId) {
  const firebaseConfig = {
    apiKey: "AIzaSyAgLH9FWBCJy-X11vu0r3YS-VZC-B9M2xA",
    authDomain: "setapanmarketcounter.firebaseapp.com",
    projectId: "setapanmarketcounter",
  };

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // 既存のアプリを再利用
}
  
  db = getFirestore(app);
  auth = getAuth(app);
  await signInAnonymously(auth);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      userId = user.uid;
      setupRealtimeListener();
    }
  });

  // ✅ logCountをグローバルに登録
  window.logCount = async (type, count) => {
    if (!db || !userId) return;
    const logEntry = {
      type,
      count,
      timestamp: serverTimestamp(),
      user_id: userId,
      event_day: "day1",
    };
    await addDoc(collection(db, `/artifacts/${appId}/public/data/log`), logEntry);
  };
}

// ✅ localinもカウント対象に追加
function setupRealtimeListener() {
  const logRef = collection(db, `/artifacts/setapanmarketcounter/public/data/log`);
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
      display.innerHTML = `${current} <span class="text-sm text-gray-200">(内、優先入場:${localIn})</span>`;
    }
  });
}
