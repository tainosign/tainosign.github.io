// JST (Asia/Tokyo) の日付・時刻関連のユーティリティ関数を集約

/**
 * 現在のJSTの日付を 'YYYY-MM-DD' 形式で取得する。
 * @returns {string} YYYY-MM-DD 形式の日付文字列
 */
export const getJSTDateYMD = () => {
  const now = new Date();
  // JSTでの現在時刻を取得
  const jst = new Date(now.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }));
  const y = jst.getFullYear();
  const m = String(jst.getMonth() + 1).padStart(2, "0");
  const d = String(jst.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * Firebase Timestamp または Dateオブジェクトを 'YYYY-MM-DD' 形式のJST日付文字列に変換する。
 * @param {import('firebase/firestore').Timestamp | Date | string} ts - タイムスタンプまたは日付
 * @returns {string} YYYY-MM-DD 形式の日付文字列
 */
export const toYMD_JST = (ts) => {
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  const jst = new Date(date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }));
  const y = jst.getFullYear();
  const m = String(jst.getMonth() + 1).padStart(2, "0");
  const d = String(jst.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * Firebase Timestamp または Dateオブジェクトを '[MM/DD]' 形式のJST日付文字列に変換する。
 * @param {import('firebase/firestore').Timestamp | Date | string} ts - タイムスタンプまたは日付
 * @returns {string} [MM/DD] 形式の日付文字列
 */
export const toMD_JST = (ts) => {
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  const md = date.toLocaleDateString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo"
  }).replace(/\//g, '/'); // 例: 10/25
  return `[${md}]`;
};
