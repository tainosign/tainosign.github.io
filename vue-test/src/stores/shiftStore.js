import { defineStore } from "pinia";
import { createShift } from "@/models/shiftModel";

export const useShiftStore = defineStore("shift", {
  state: () => ({
    shifts: [],
  }),
  actions: {
    addShift(dateStr) {
      this.shifts.push(createShift(dateStr));
    },
    removeShift(index) {
      this.shifts.splice(index, 1);
    },
    saveToLocal() {
      localStorage.setItem("shifts", JSON.stringify(this.shifts));
    },
    loadFromLocal() {
      const data = localStorage.getItem("shifts");
      if (data) this.shifts = JSON.parse(data);
    },
  },
});
