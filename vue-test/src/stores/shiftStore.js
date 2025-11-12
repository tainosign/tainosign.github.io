// src/stores/shiftStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { useFirestoreShifts } from "@/composables/useFirestoreShifts";

export const useShiftStore = defineStore("shiftStore", () => {
  const shifts = ref([]);
  const festivalDays = ref([]); // pre1, pre2, day1, day2
  const activeDay = ref(""); // 現在表示中の日付
  const isLoading = ref(false);

  // 🔹 祭り・準備日のシフトを読み込み
  const loadFestivalShifts = async () => {
    const { getFestivalDays, getAllFestivalShifts } = await useFirestoreShifts();
    isLoading.value = true;
    festivalDays.value = await getFestivalDays();
    shifts.value = await getAllFestivalShifts();
    if (!activeDay.value && festivalDays.value.length > 0) {
      activeDay.value = festivalDays.value[0];
    }
    isLoading.value = false;
  };

  // 🔹 アクティブな日付のシフト取得
  const getShiftForActiveDay = () =>
    shifts.value.find((s) => s.day === activeDay.value);

  const setActiveDay = (date) => {
    activeDay.value = date;
  };

  // 🔹 新規シフト作成
  const createNewShift = (dates) => {
    const newShifts = dates.map((date) => ({
      id: `${date}-${Date.now()}`,
      date,
      teams: [],
    }));
    shifts.value.push(...newShifts);
  };

  // 🔹 指定日付のシフト読み込み
  const getShiftsByDates = async (dates) => {
    const { getShiftByDate } = await useFirestoreShifts();
    const result = [];
    for (const d of dates) {
      const shift = await getShiftByDate(d);
      if (shift) result.push(shift);
    }
    return result;
  };

  // 🔹 指定日付のシフト保存（JSTファイル名）
  const saveShiftsByDates = async (shiftList, fileName = "shift") => {
    const { saveShift } = await useFirestoreShifts();

    // JST現在時刻をファイル名用に整形
    const jst = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
    const timestamp = jst.replace(/[/: ]/g, "-");

    for (const s of shiftList) {
      const saveName = `${fileName}-${s.date}-${timestamp}`;
      await saveShift(saveName, s);
    }
  };

  return {
    shifts,
    festivalDays,
    activeDay,
    isLoading,
    loadFestivalShifts,
    getShiftForActiveDay,
    setActiveDay,
    createNewShift,
    getShiftsByDates,
    saveShiftsByDates,
  };
});
