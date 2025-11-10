// src/stores/shiftStore.js
import { defineStore } from "pinia";
import { ref, onUnmounted } from "vue";
import { useFirestoreShifts } from "@/composables/useFirestoreShifts.js";
import { useFirestoreMembers } from "@/composables/useFirestoreMembers.js";

export const useShiftStore = defineStore("shiftStore", () => {
  const shifts = ref([]); // 全シフト
  const members = ref([]);
  const isLoading = ref(false);

  let unsubscribeShifts = null;
  let unsubscribeMembers = null;

  const {
    addShift,
    getShifts,
    updateShift,
    addSlotToShift,
  } = useFirestoreShifts();

  const {
    getMembers,
    syncMembers,
  } = useFirestoreMembers();

  // -------------------------
  // 初期化（1回のみ）
  // -------------------------
  const init = async () => {
    try {
      console.log("🌀 shiftStore 初期化開始...");
      isLoading.value = true;

      members.value = await getMembers();

      if (!unsubscribeMembers) {
        unsubscribeMembers = await syncMembers((data) => {
          members.value = data;
        });
      }

      console.log("✅ shiftStore: 初期化完了");
    } catch (err) {
      console.error("❌ shiftStore 初期化エラー:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // -------------------------
  // 指定された日付配列でシフトを取得
  // -------------------------
  const getShiftsByDates = async (dateArray) => {
    if (!Array.isArray(dateArray) || dateArray.length === 0) return [];
    const allShifts = await getShifts();
    return allShifts.filter(s => dateArray.includes(s.date));
  };

  // -------------------------
  // 指定された日付配列のシフトを保存
  // -------------------------
  const saveShiftsByDates = async (shiftList) => {
    if (!Array.isArray(shiftList) || shiftList.length === 0) return;

    for (const shift of shiftList) {
      if (!shift.date) continue;
      await addShift(shift); // Firestoreに保存（上書き）
    }
  };

  // -------------------------
  // クリーンアップ
  // -------------------------
  const cleanup = () => {
    if (unsubscribeShifts) unsubscribeShifts();
    if (unsubscribeMembers) unsubscribeMembers();
    console.log("🧹 shiftStore: Firestoreリスナー解除");
  };

  onUnmounted(cleanup);

  return {
    shifts,
    members,
    isLoading,
    init,
    getShiftsByDates,
    saveShiftsByDates,
  };
});
