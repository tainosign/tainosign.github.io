// src/stores/shiftStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { useFirestoreShifts } from "@/composables/useFirestoreShifts";

export const useShiftStore = defineStore("shiftStore", () => {
  const shifts = ref([]);
  const festivalDays = ref([]); // pre1, pre2, day1, day2
  const activeDay = ref(""); // 現在表示中の日付
  const isLoading = ref(false);

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

  const getShiftForActiveDay = () =>
    shifts.value.find((s) => s.day === activeDay.value);

  const setActiveDay = (date) => {
    activeDay.value = date;
  };

  const { getShiftByDate, saveShift } = await useFirestoreShifts();

// 新規シフト作成
const createNewShift = (dates) => {
  const newShifts = dates.map(date => ({
    id: `${date}-${Date.now()}`,
    date,
    teams: [],
  }));
  shifts.value.push(...newShifts);
};

// 日付指定でシフト読み込み
const getShiftsByDates = async (dates) => {
  const result = [];
  for (const d of dates) {
    const shift = await getShiftByDate(d);
    if (shift) result.push(shift);
  }
  return result;
};

// 日付指定で保存（複数対応）
const saveShiftsByDates = async (shiftList, fileName = "shift") => {
  const jst = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const timestamp = jst.replace(/[:/ ]/g, "-");
  for (const s of shiftList) {
    await saveShift(`${fileName}-${s.date}-${timestamp}`, s);
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
