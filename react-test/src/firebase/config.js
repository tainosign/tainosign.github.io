import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { getFirestore, setLogLevel } from "firebase/firestore";

// グローバル変数から設定を取得し、ない場合はユーザー提供のフォールバックを使用
// アプリケーションID
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'setapanmarketcounter'; // プロジェクトIDに合わせる

// Firebase設定
const firebaseConfig = typeof __firebase_config !== 'undefined'
    ? JSON.parse(__firebase_config)
    : {
        // ユーザー提供のフォールバック設定
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
 * Firebaseを初期化し、認証を行う
 * @returns {Promise<{db: import('firebase/firestore').Firestore, auth: import('firebase/auth').Auth}>}
 */
export async function initializeFirebase() {
    try {
        // デバッグログを有効化
        setLogLevel('debug');

        // 既存アプリがあれば再利用し、なければ初期化
        const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        // 認証状態の確認とサインイン
        if (!auth.currentUser) {
            if (customToken) {
                // カスタムトークンでサインイン
                await signInWithCustomToken(auth, customToken);
                console.log("🟢 Firebase: Signed in with custom token.");
            } else {
                // 匿名サインイン
                await signInAnonymously(auth);
                console.log("🟢 Firebase: Signed in anonymously.");
            }
        } else {
            console.log("🟢 Firebase: User already authenticated.");
        }

        return { db, auth };

    } catch (error) {
        console.error("🔴 Fatal Firebase Initialization Error:", error);
        throw error; // 呼び出し元でエラーを処理させる
    }
}
