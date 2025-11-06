import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { getFirestore, setLogLevel } from "firebase/firestore";

// グローバル変数から設定を取得
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Firebase設定
const firebaseConfig = typeof __firebase_config !== 'undefined'
    ? JSON.parse(__firebase_config)
    : {
        // Fallback configuration (If running outside of Canvas environment)
        apiKey: "AIzaSyAgLH9FWBCJy-X11vu0r3YS-VZC-B9M2xA",
        authDomain: "setapanmarketcounter.firebaseapp.com",
        projectId: "setapanmarketcounter",
        storageBucket: "setapanmarketcounter.firebasestorage.app",
        messagingSenderId: "546423839721",
        appId: "1:546423839721:web:70d5c12129fe6cc1594978",
        measurementId: "G-70KHJ0P1P1"
    };

// カスタム認証トークン
const customToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

/**
 * Initializes Firebase app, Firestore, and attempts authentication.
 * @returns {Promise<{db: import('firebase/firestore').Firestore, auth: import('firebase/auth').Auth}>}
 */
export async function initializeFirebase() {
    try {
        setLogLevel('debug');

        // Reuse existing app or initialize
        const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        // Authentication logic using custom token or anonymous sign-in
        if (!auth.currentUser) {
            if (customToken) {
                await signInWithCustomToken(auth, customToken);
                console.log("🟢 Firebase: Signed in with custom token.");
            } else {
                await signInAnonymously(auth);
                console.log("🟢 Firebase: Signed in anonymously.");
            }
        } else {
            console.log("🟢 Firebase: User already authenticated.");
        }

        return { db, auth };

    } catch (error) {
        console.error("🔴 Fatal Firebase Initialization Error:", error);
        throw error;
    }
}
