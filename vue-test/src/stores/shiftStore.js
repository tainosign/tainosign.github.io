// src/stores/shiftStore.js
import { defineStore } from "pinia";
import { ref, onUnmounted } from "vue";
import { useFirestoreShifts } from "@/composables/useFirestoreShifts.js";
import { useFirestoreMembers } from "@/composables/useFirestoreMembers.js";

export const useShiftStore = defineStore("shiftStore", () => {
  const shifts = ref([]);
  const members = ref([]);
  const isLoading = ref(true);

  let unsubscribeShifts = null;
  let unsubscribeMembers = null;

  const {
    addShift,
    getShifts,
    updateShift,
    addSlotToShift,
    syncShifts,
  } = useFirestoreShifts();

  const {
    addMember,
    getMembers,
    updateMember,
    deleteMember,
    syncMembers,
  } = useFirestoreMembers();

  // =========================
  // 初期化処理
  // =========================
  const init = async () => {
    try {
      console.log("🌀 shiftStore 初期化開始...");
      isLoading.value = true;

      // Firestoreから初期データ取得
      shifts.value = await getShifts();
      members.value = await getMembers();

      // リアルタイム同期開始
      unsubscribeShifts = await syncShifts((data) => {
        shifts.value = data;
      });
      unsubscribeMembers = await syncMembers((data) => {
        members.value = data;
      });

      console.log("✅ shiftStore: 初期化完了");
    } catch (err) {
      console.error("❌ shiftStore 初期化エラー:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // =========================
  // クリーンアップ
  // =========================
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
    addShift,
    updateShift,
    addSlotToShift,
    addMember,
    updateMember,
    deleteMember,
    init,
  };
});
