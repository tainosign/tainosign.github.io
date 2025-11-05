// /js/counter-logic.js
import { initializeFirebase } from "/js/firebase-config.js";
import { getFirestore, collection, addDoc } 
  from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

/**
 * カウンターロジック初期化
 * @param {string} appId - Firebaseのアプリ識別ID
 */
export async function setupCounter(appId) {
  const { db } = await initializeFirebase();

  /**
   * ボタン押下で人数を記録
   * @param {string} type - in / out / localin / exitin など
   * @param {number} count - 変動人数
   */
  window.logCount = async (type, count) => {
    const now = new Date();
    const jstOffset = 9 * 60 * 60 * 1000; // UTC→JST
    const jstDate = new Date(now.getTime() + jstOffset);
    const event_day = jstDate.toISOString().split("T")[0]; // "2025-11-02"

    const log = {
      type,
      count,
      timestamp: jstDate,
      event_day,
    };

    try {
      await addDoc(collection(db, `artifacts/${appId}/public/data/log`), log);
      flashButton(); // ✅ 視覚フィードバック
    } catch (err) {
      console.error("ログ記録エラー:", err);
    }
  };
}

/**
 * ボタンを短時間点滅させるフィードバック
 */
function flashButton() {
  const active = document.activeElement;
  if (active && active.classList.contains("counter-button")) {
    active.classList.add("animate-pulse");
    setTimeout(() => active.classList.remove("animate-pulse"), 300);
  }
}
