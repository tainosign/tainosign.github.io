// js/header-loader.js
import { initializeFirebase } from "/js/firebase-config.js";
import { getFirestore, doc, onSnapshot, collection } 
  from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

export async function loadHeader(appId = "setapanmarketcounter") {
  // ヘッダーHTML読み込み
  const headerHTML = await fetch("/components/header.html").then(res => res.text());
  document.body.insertAdjacentHTML("afterbegin", headerHTML);

  // Firebase初期化
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

  const getTodayYMD = () => {
    const d = new Date();
    const jst = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
    return jst.toISOString().split("T")[0];
  };

  let dayMap = {};
  let todayYMD = getTodayYMD();

  // === イベント日取得 ===
  onSnapshot(doc(db, `artifacts/${appId}/public/data/static/day`), (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    dayMap.day1 = toYMD(data.day1);
    dayMap.day2 = toYMD(data.day2);
    el.date1.textContent = toMD(data.day1);
    el.date2.textContent = toMD(data.day2);
  });

  // === カウント情報監視 ===
  onSnapshot(collection(db, `artifacts/${appId}/public/data/log`), (snapshot) => {
    let todayIn = 0, todayOut = 0, todayLocal = 0, todayExit = 0;
    let day1Count = 0, day2Count = 0;

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const count = Number(data.count) || 0;
      const type = data.type;
      const eventDay = data.event_day;
      const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
      const logDate = timestamp.toISOString().split("T")[0];

      // === 今日のリアルタイムカウント ===
      if (logDate === todayYMD) {
        if (type === "in") todayIn += count;
        if (type === "out") todayOut += count;
        if (type === "localin") todayLocal += count;
        if (type === "exitin") todayExit += count;
      }

      // === イベント指定日のカウント ===
      if (eventDay === "day1") day1Count += count;
      if (eventDay === "day2") day2Count += count;
    });

    // 現在場内人数
    const currentInside = todayIn + todayLocal + todayExit - todayOut;
    el.current.textContent = currentInside;
    el.localin.textContent = todayLocal;
    el.exitin.textContent = todayExit;

    // day1, day2, total 表示
    el.day1.textContent = day1Count;
    el.day2.textContent = day2Count;
    el.total.textContent = day1Count + day2Count;

    // 100人あたり待ち時間（例: 仮定値）
    const waitPer100 = (currentInside / 100 * 5).toFixed(1);
    el.wait.textContent = isNaN(waitPer100) ? "--" : waitPer100;
  });
}
