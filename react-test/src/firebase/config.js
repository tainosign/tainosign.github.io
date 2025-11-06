// config.js
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

// グローバル変数から設定を取得
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const firebaseConfig = typeof __firebase_config !== 'undefined'
  ? JSON.parse(__firebase_config)
  : {
      apiKey: "AIzaSyAgLH9FWBCJy-X11vu0r3YS-VZC-B9M2xA",
      authDomain: "setapanmarketcounter.firebaseapp.com",
      projectId: "setapanmarketcounter",
      storageBucket: "setapanmarketcounter.firebasestorage.app",
      messagingSenderId: "546423839721",
      appId: "1:546423839721:web:70d5c12129fe6cc1594978",
      measurementId: "G-70KHJ0P1P1"
  };

// 初期化済みアプリがあれば再利用
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Auth と Firestore をエクスポート
export const auth = firebase.auth();
export const db = firebase.firestore();
