import { collection, query, getDocs } from "firebase/firestore"; // 💡 firestoreからインポート
import { toMD_JST } from '../hooks/useHeaderData'; // toMD_JSTを再利用

export function getPublicCollectionPath(appId, name) {
  return `artifacts/${appId}/public/data/${name}`; // 先頭のスラッシュを削除 (doc/collectionパスの慣習)
}

/**
 * ログコレクションから記録された日付のリストを取得し、JSTで処理します。
 * @param {import('firebase/firestore').Firestore} db Firestoreインスタンス
 * @param {string} appId アプリケーションID
 * @returns {Promise<string[]>} 重複のない日付文字列（MM/DD形式）の配列
 */
export async function fetchRecordedDates(db, appId) {
  const logRef = collection(db, getPublicCollectionPath(appId, "log"));
  // 🚨 orderBy()を削除し、インデックスの不足によるエラーを回避。
  // データ取得後にJavaScript側でソートと重複除去を行います。
  const q = query(logRef);
  
  try {
    const snapshot = await getDocs(q);
    const dates = {}; // オブジェクトで日付の重複を管理し、タイムスタンプを保持

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.timestamp) {
        // Firestore Timestamp または Date オブジェクトからDateインスタンスを取得
        const ts = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
        // JSTのMM/DD形式に変換 (toMD_JSTを使用)
        const dateStr = toMD_JST(ts);
        
        // タイムスタンプを比較し、最新のものだけを保持（ただし、ここでは重複除去が主目的）
        dates[dateStr] = ts.getTime(); 
      }
    });
    
    // 1. 日付文字列の配列を取得
    const dateArray = Object.keys(dates);
    
    // 2. 日付を元のタイムスタンプに基づいてソートし、新しいものから並べる
    return dateArray.sort((a, b) => dates[b] - dates[a]);
    
  } catch(error) {
    console.error("Error fetching recorded dates from Firestore:", error);
    return [];
  }
}
