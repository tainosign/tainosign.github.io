// ✅ 現在の日本時間を取得
export function nowJST() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000);
}

// ✅ 日本時間の日付文字列 (YYYY-MM-DD)
export function getJSTDateString() {
  return nowJST().toISOString().slice(0, 10);
}

// ✅ 日本時間の時刻文字列 (HH:mm:ss)
export function getJSTTimeString() {
  const jst = nowJST();
  return jst.toTimeString().slice(0, 8);
}

// ✅ Firestore の Timestamp を日本時間でフォーマット
export function toJSTStringFromFirestore(ts) {
  if (!ts) return "--";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
}

// ✅ JST基準で「日付が変わったか」をチェック（集計リセットなどに利用）
export function isNewJSTDay(prevTimestamp) {
  const prev = new Date(prevTimestamp);
  const prevDate = prev.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });
  const nowDate = nowJST().toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });
  return prevDate !== nowDate;
}

// ✅ JSTの「時・分・秒」を個別に取得
export function getJSTParts() {
  const jst = nowJST();
  return {
    year: jst.getFullYear(),
    month: jst.getMonth() + 1,
    day: jst.getDate(),
    hour: jst.getHours(),
    minute: jst.getMinutes(),
    second: jst.getSeconds()
  };
}

// ✅ JSTの10分単位インデックス（来場者推移グラフなどで使用）
export function getJSTTenMinuteIndex() {
  const { hour, minute } = getJSTParts();
  const index = hour * 6 + Math.floor(minute / 10);
  return index; // 1日144区分 (0〜143)
}

// ✅ JST基準の「日付と10分区分」をセットで返す
export function getJSTTimeSlotId() {
  const date = getJSTDateString();
  const index = getJSTTenMinuteIndex();
  return `${date}_${index.toString().padStart(3, "0")}`;
}

// ✅ JST基準の「シフト」時刻判定（勤務中かどうか）
export function isWithinShift(startTime, endTime) {
  const now = nowJST().getTime();
  return now >= new Date(startTime).getTime() && now <= new Date(endTime).getTime();
}

// ✅ JST基準で「今日・明日・昨日」などの相対関係を返す
export function compareJSTDate(targetDate) {
  const today = getJSTDateString();
  if (targetDate === today) return "today";

  const target = new Date(targetDate);
  const jst = nowJST();
  const diff = (target - jst) / (1000 * 60 * 60 * 24);

  if (diff > 0 && diff < 1) return "tomorrow";
  if (diff < 0 && diff > -1) return "yesterday";
  return diff > 0 ? "future" : "past";
}

// ✅ Firestore用：JST基準のTimestamp生成
export function firestoreTimestampJST() {
  return new Date(nowJST());
}
