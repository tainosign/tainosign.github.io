// js/header-loader.js
import { initializeFirebase } from "/js/firebase-config.js";
import { getFirestore, doc, onSnapshot, collection } 
  from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

export async function loadHeader(appId = "setapanmarketcounter") {
  // ヘッダーHTMLの読み込み
  const headerHTML = await fetch("/components/header.html").then(res => res.text());
  document.body.insertAdjacentHTML("afterbegin", headerHTML);

  // Firebase 初期化
  const { db } = await initializeFirebase();

  // 要素参照
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

  const toYMD = (ts) => {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toISOString().split("T")[0];
  };
  const toMD = (ts) => {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("ja-JP", { month: "2-digit", day: "2-digit", timeZone: "Asia/Tokyo" });
  };

  let dayMap = {};

  // === イベント日取得 ===
  onSnapshot(doc(db, `artifacts/${appId}/public/data/static/day`), (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    dayMap.day1 = toYMD(data.day1);
    dayMap.day2 = toYMD(data.day2);
    el.date1.textContent = toMD(data.day1);
    el.date2.textContent = toMD(data.day2);
  });

  // === カウント情報の監視 ===
  onSnapshot(collection(db, `artifacts/${appId}/public/data/log`), (snapshot) => {
    let totalIn = 0, totalOut = 0, totalLocal = 0, totalExit = 0;
    let day1Count = 0, day2Count = 0;

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const count = Number(data.count) || 0;
      const type = data.type;
      const day = data.event_day;

      if (type === "in") totalIn += count;
      if (type === "out") totalOut += count;
      if (type === "localin") totalLocal += count;
      if (type === "exitin") totalExit += count;

      if (day === dayMap.day1) day1Count += count;
      if (day === dayMap.day2) day2Count += count;
    });

    const currentInside = totalIn + totalLocal + totalExit - totalOut;

    el.current.textContent = currentInside;
    el.localin.textContent = totalLocal;
    el.exitin.textContent = totalExit;
    el.day1.textContent = day1Count;
    el.day2.textContent = day2Count;
    el.total.textContent = day1Count + day2Count;
  });
}
