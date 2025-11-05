// /js/header-loader.js
import { initializeFirebase } from "/js/firebase-config.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

export async function loadHeader(appId = "setapanmarketcounter") {
  // === ヘッダーHTML読み込み ===
  const headerHTML = await fetch("/components/header.html").then(res => res.text());
  document.body.insertAdjacentHTML("afterbegin", headerHTML);

  // === Firebase初期化 ===
  const { db } = await initializeFirebase();

  // === 要素参照 ===
  const el = {
    current: document.getElementById("current-count-value"),
    localin: document.getElementById("localin-count"),
    exitin: document.getElementById("exitin-count"),
    wait: document.getElementById("wait-time-value"),
    day1: document.getElementById("day1-visitors"),
    day2: document.getElementById("day2-visitors"),
    total: document.getElementById("total-visitors"),
    date1: document.getElementById("event-day1-date"),
    date2: document.getElementById("event-day2-date"),
  };

  // === イベント日（固定情報）取得 ===
  const dayDoc = doc(db, `artifacts/${appId}/public/data/static/day`);
  onSnapshot(dayDoc, (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();

    const toMD_JST = (ts) => {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleDateString("ja-JP", {
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Tokyo"
      });
    };

    el.date1.textContent = `[${toMD_JST(data.day1)}]`;
    el.date2.textContent = `[${toMD_JST(data.day2)}]`;
  });

  // === summary/todayをリアルタイム監視（超軽量・最適）===
  const summaryDoc = doc(db, `artifacts/${appId}/public/data/summary/today`);
  onSnapshot(summaryDoc, (snap) => {
    if (!snap.exists()) {
      console.warn("summary/today が存在しません。初期化してください。");
      return;
    }

    const data = snap.data();
    const todayIn = data.in || 0;
    const todayOut = data.out || 0;
    const todayLocal = data.localin || 0;
    const todayExit = data.exitin || 0;

    const currentInside = todayIn + todayLocal + todayExit - todayOut;

    // === 表示更新 ===
    el.current.textContent = currentInside;
    el.localin.textContent = todayLocal;
    el.exitin.textContent = todayExit;

    // === 日別・合計表示（オプション）
    // イベント開催2日間分の集計を別summaryから取る場合はここに追加可
    el.day1.textContent = `：${todayIn + todayLocal + todayExit}人`;
    el.day2.textContent = `：--人`; // 必要なら day2 用summaryを監視
    el.total.textContent = `：${todayIn + todayLocal + todayExit}人`;

    // === 待ち時間目安 ===
    const waitPer100 = (currentInside / 100 * 5).toFixed(1);
    el.wait.textContent = isNaN(waitPer100) ? "--" : waitPer100;
  });
}
