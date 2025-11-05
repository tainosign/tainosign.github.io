import { initializeFirebase } from "/js/firebase-config.js";
import { getFirestore, doc, onSnapshot, collection } 
  from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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

const toYMD_JST = (ts) => {
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const jstString = date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const jst = new Date(jstString);
  const y = jst.getFullYear();
  const m = String(jst.getMonth() + 1).padStart(2, "0");
  const d = String(jst.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
  
const toMD_JST = (ts) => {
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString("ja-JP", { month: "2-digit", day: "2-digit", timeZone: "Asia/Tokyo" });
};

const getTodayYMD = () => {
  const now = new Date();
  const jst = new Date(now.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }));
  const y = jst.getFullYear();
  const m = String(jst.getMonth() + 1).padStart(2, "0");
  const d = String(jst.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

  let dayMap = {};
  let todayYMD = getTodayYMD();

  // === イベント日取得 ===
  onSnapshot(doc(db, `artifacts/${appId}/public/data/static/day`), (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    dayMap.day1 = toYMD_JST(data.day1);
    dayMap.day2 = toYMD_JST(data.day2);
    el.date1.textContent = `[${toMD_JST(data.day1)}]`;
    el.date2.textContent = `[${toMD_JST(data.day2)}]`;
  });

  // === カウント監視 ===
  onSnapshot(collection(db, `artifacts/${appId}/public/data/log`), (snapshot) => {
    let todayIn = 0, todayOut = 0, todayLocal = 0, todayExit = 0;
    let day1Count = 0, day2Count = 0;

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const count = Number(data.count) || 0;
      const type = data.type;
      const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
      const jst = new Date(timestamp.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
      const logDate = toYMD_JST(timestamp);

      // === 今日のリアルタイム ===
      if (logDate === todayYMD) {
        if (type === "in") todayIn += count;
        if (type === "out") todayOut += count;
        if (type === "localin") todayLocal += count;
        if (type === "exitin") todayExit += count;
      }

      // === 各日カウント ===
      if (logDate === dayMap.day1 && ["in","localin","exitin"].includes(type)) day1Count += count;
      if (logDate === dayMap.day2 && ["in","localin","exitin"].includes(type)) day2Count += count;
    });

    // === 表示 ===
    const currentInside = todayIn + todayLocal + todayExit - todayOut;
    el.current.textContent = currentInside;
    el.localin.textContent = todayLocal;
    el.exitin.textContent = todayExit;
    el.day1.textContent = `：${day1Count}人`;
    el.day2.textContent = `：${day2Count}人`;
    el.total.textContent = `：${day1Count + day2Count}人`;

    // === 待ち時間例 ===
    const waitPer100 = (currentInside / 100 * 5).toFixed(1);
    el.wait.textContent = isNaN(waitPer100) ? "--" : waitPer100;
  });
}
