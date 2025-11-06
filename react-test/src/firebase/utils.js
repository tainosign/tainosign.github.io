// js/firebase-utils.js
import { collection, doc, query, where, orderBy, getDocs } 
  from "firebase/app";

export function getPublicCollectionPath(appId, name) {
  return `/artifacts/${appId}/public/data/${name}`;
}

export async function fetchRecordedDates(db, appId) {
  const logRef = collection(db, getPublicCollectionPath(appId, "log"));
  const q = query(logRef, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  const dates = new Set();

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.timestamp) {
      const ts = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
      const dateStr = ts.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });
      dates.add(dateStr);
    }
  });

  return Array.from(dates).sort().reverse();
}
