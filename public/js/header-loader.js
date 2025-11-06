// /js/header-loader.js
import { initializeFirebase } from "/js/firebase-config.js";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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

  // === JST日付を取得 ===
  const getJSTDateYMD = () => {
    const now = new Date();
    const jst = new Date(now.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }));
    const y = jst.getFullYear();
    const m = String(jst.getMonth() + 1).padStart(2, "0");
    const d = String(jst.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // === summaryドキュメントがなければ初期化 ===
  async function ensureSummaryDoc(path) {
    const ref = doc(db, path);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { in: 0, out: 0, localin: 0, exitin: 0, createdAt: new Date() });
      console.log(`🟢 Summaryを初期化: ${path}`);
    }
    return ref;
  }

  // === イベント日付の取得 (static/day) ===
  const dayDoc = doc(db, `artifacts/${appId}/public/data/static/day`);
  let day1YMD = null;
  let day2YMD = null;

  const toYMD_JST = (ts) => {
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    const jst = new Date(date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }));
    const y = jst.getFullYear();
    const m = String(jst.getMonth() + 1).padStart(2, "0");
    const d = String(jst.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const toMD_JST = (ts) => {
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString("ja-JP", {
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Tokyo"
    });
  };

  const daySnap = await getDoc(dayDoc);
  if (daySnap.exists()) {
    const data = daySnap.data();
    el.date1.textContent = `[${toMD_JST(data.day1)}]`;
    el.date2.textContent = `[${toMD_JST(data.day2)}]`;
    day1YMD = toYMD_JST(data.day1);
    day2YMD = toYMD_JST(data.day2);
  }

  // === 今日のsummary監視（リアルタイム）===
  const todayYMD = getJSTDateYMD();
  const todayPath = `artifacts/${appId}/public/data/summary/${todayYMD}`;
  const todayRef = await ensureSummaryDoc(todayPath);

  onSnapshot(todayRef, (snap) => {
    if (!snap.exists()) return;
    const d = snap.data();
    const inCount = d.in || 0;
    const outCount = d.out || 0;
    const localIn = d.localin || 0;
    const exitIn = d.exitin || 0;
    const current = inCount + localIn + exitIn - outCount;

    el.current.textContent = current;
    el.localin.textContent = localIn;
    el.exitin.textContent = exitIn;

    const wait = (current / 100 * 5).toFixed(1);
    el.wait.textContent = isNaN(wait) ? "--" : wait;
  });

  // === day1/day2 summaryを表示 ===
  let day1Total = 0, day2Total = 0;

  if (day1YMD) {
    const ref1 = await ensureSummaryDoc(`artifacts/${appId}/public/data/summary/${day1YMD}`);
    onSnapshot(ref1, (snap) => {
      if (!snap.exists()) return;
      const d = snap.data();
      day1Total = (d.in || 0) + (d.localin || 0) + (d.exitin || 0);
      el.day1.textContent = `：${day1Total}人`;
      el.total.textContent = `：${day1Total + day2Total}人`;
    });
  }

  if (day2YMD) {
    const ref2 = await ensureSummaryDoc(`artifacts/${appId}/public/data/summary/${day2YMD}`);
    onSnapshot(ref2, (snap) => {
      if (!snap.exists()) return;
      const d = snap.data();
      day2Total = (d.in || 0) + (d.localin || 0) + (d.exitin || 0);
      el.day2.textContent = `：${day2Total}人`;
      el.total.textContent = `：${day1Total + day2Total}人`;
    });
  }
}
