// firebase-config.js
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// === Firebase 設定 ===
const firebaseConfig = {
  apiKey: "AIzaSyAgLH9FWBCJy-X11vu0r3YS-VZC-B9M2xA",
  authDomain: "setapanmarketcounter.firebaseapp.com",
  databaseURL: "https://setapanmarketcounter-default-rtdb.firebaseio.com",
  projectId: "setapanmarketcounter",
  storageBucket: "setapanmarketcounter.firebasestorage.app",
  messagingSenderId: "546423839721",
  appId: "1:546423839721:web:70d5c12129fe6cc1594978",
  measurementId: "G-70KHJ0P1P1"
};

// === Firebase 初期化 & 認証 ===
export async function initializeFirebase(customToken = null) {
  // ✅ 既存アプリがあれば再利用
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  await new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      try {
        if (!user) {
          if (customToken) {
            await signInWithCustomToken(auth, customToken);
          } else {
            await signInAnonymously(auth);
          }
        }
        resolve();
      } catch (e) {
        reject(e);
      }
    }, reject);
  });

  return { db, auth };
}
