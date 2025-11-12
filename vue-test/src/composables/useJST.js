// vue-test/src/composables/useJST.js

/** ---------- 基本ユーティリティ ---------- **/

// ✅ 現在の日本時間（Dateオブジェクト）
export function nowJST() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000);
}

// ✅ JSTのISO文字列（YYYY-MM-DDTHH:mm:ss）
export function getJSTISOString() {
  return nowJST().toISOString().replace("Z", "+09:00");
}

// ✅ JSTの「日付のみ」文字列
export function getJSTDateString() {
  return nowJST().toISOString().slice(0, 10);
}

// ✅ JSTの「時刻のみ」文字列
export function getJSTTimeString() {
  return nowJST().toTimeString().slice(0, 8);
}

// ✅ MM/DD形式
export function toMD_JST(ts) {
if (!ts) return "--/--";
const date = ts.toDate ? ts.toDate() : new Date(ts);
return date.toLocaleDateString("ja-JP", {
month: "2-digit",
day: "2-digit",
timeZone: "Asia/Tokyo",
});
}


/** ---------- 入力・変換 ---------- **/

// ✅ 任意の入力（日付文字列やtimestamp）をJST Dateに変換
export function parseToJSTDate(input) {
  if (!input) return null;
  const date = input.toDate ? input.toDate() : new Date(input);
  // UTC→JST補正
  return new Date(date.getTime() + 9 * 60 * 60 * 1000);
}

// ✅ フォーム入力の date/time 値を JST ISO形式に変換
export function toJSTISOStringFromInput(dateStr, timeStr) {
  const base = new Date(`${dateStr}T${timeStr}:00`);
  return new Date(base.getTime() + 9 * 60 * 60 * 1000).toISOString().replace("Z", "+09:00");
}

/** ---------- Firestore用 ---------- **/

// ✅ Firestore保存用 JST Timestamp（Dateオブジェクトとして保存OK）
export function firestoreTimestampJST() {
  return new Date(nowJST());
}

// ✅ Firestore Timestamp を JST文字列に変換（読み込み時）
export function toJSTStringFromFirestore(ts, withTime = true) {
  if (!ts) return "--";
  const date = parseToJSTDate(ts);
  return date.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    ...(withTime ? {} : { year: "numeric", month: "2-digit", day: "2-digit" }),
  });
}

/** ---------- 表示整形 ---------- **/

// ✅ YYYY-MM-DD
export function toYMD_JST(ts) {
  const date = parseToJSTDate(ts);
  if (!date) return "--/--/--";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ✅ HH:mm:ss
export function toHMS_JST(ts) {
  const date = parseToJSTDate(ts);
  if (!date) return "--:--:--";
  return date.toTimeString().slice(0, 8);
}

/** ---------- 動的制御系 ---------- **/

// ✅ JST基準で現在が指定シフト時間内か判定
export function isWithinShift(startTime, endTime) {
  const now = nowJST().getTime();
  return now >= new Date(startTime).getTime() && now <= new Date(endTime).getTime();
}

// ✅ JST基準で「日付が変わったか」
export function isNewJSTDay(prevTimestamp) {
  if (!prevTimestamp) return false;
  const prev = parseToJSTDate(prevTimestamp);
  const prevDate = prev.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });
  const nowDate = nowJST().toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });
  return prevDate !== nowDate;
}
