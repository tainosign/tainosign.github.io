import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAgLH9FWBCJy-X11vu0r3YS-VZC-B9M2xA",
  authDomain: "setapanmarketcounter.firebaseapp.com",
  projectId: "setapanmarketcounter",
  storageBucket: "setapanmarketcounter.firebasestorage.app",
  messagingSenderId: "546423839721",
  appId: "1:546423839721:web:70d5c12129fe6cc1594978",
  measurementId: "G-70KHJ0P1P1",
};

export async function useFirebase() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  await new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) await signInAnonymously(auth);
      unsub();
      resolve();
    });
  });

  return { db, auth };
}
