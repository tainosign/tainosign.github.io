// utils.js
import { toMD_JST } from "../utils/time";

/**
 * コレクションのパスを取得
 */
export function getPublicCollectionPath(appId, name) {
  return `artifacts/${appId}/public/data/${name}`;
}

/**
 * Firestore の snapshot から日付を取得
 * @param {firebase.firestore.Firestore} db
 * @param {string} appId
 * @returns {Promise<string[]>} 重複のない日付文字列（[MM/DD]形式）
 */
export async function fetchRecordedDates(db, appId) {
  const logRef = db.collection(getPublicCollectionPath(appId, "log"));

  try {
    const snapshot = await logRef.get();
    const dates = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.timestamp) {
        const ts = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
        const dateStr = toMD_JST(ts);
        dates[dateStr] = ts.getTime();
      }
    });

    return Object.keys(dates).sort((a, b) => dates[b] - dates[a]);
  } catch (error) {
    console.error("Error fetching recorded dates from Firestore:", error);
    return [];
  }
}
