// stores/shiftStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { saveShiftsByDates, getShiftsByDates } from "@/composables/useFirestoreShifts";
import { createShiftModel } from "@/models/shiftModel";

export const useShiftStore = defineStore("shiftStore", () => {
  const shifts = ref([]);           // Firestoreから取得した全シフト
  const selectedDates = ref([]);    // 操作対象日付
  const isLoading = ref(false);

  /**
   * 指定日付の空シフトを作成
   */
  const addShift = (date) => {
    if (shifts.value.some((s) => s.day === date)) return;
    const newShift = createShiftModel({
      name: `${date}のシフト`,
      day: date,
      slots: [],
    });
    shifts.value.push(newShift);
  };

  /**
   * 指定日付のシフトをまとめて保存
   */
  const saveSelectedShifts = async () => {
    if (selectedDates.value.length === 0) return;
    const targetShifts = shifts.value.filter((s) =>
      selectedDates.value.includes(s.day)
    );
    await saveShiftsByDates(targetShifts);
  };

  /**
   * 指定日付のシフトをまとめて読み込み
   */
  const loadSelectedShifts = async () => {
    if (selectedDates.value.length === 0) return;
    isLoading.value = true;
    shifts.value = await getShiftsByDates(selectedDates.value);
    isLoading.value = false;
  };

  return {
    shifts,
    selectedDates,
    isLoading,
    addShift,
    saveSelectedShifts,
    loadSelectedShifts,
  };
});
