import { initializeApp } from "firebase/app";

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

export const app = initializeApp(firebaseConfig);
