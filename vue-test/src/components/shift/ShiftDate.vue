<template>
  <div>
    <!-- 日付選択複数 -->
    <div class="flex gap-2 mb-2">
      <input
        type="date"
        multiple
        v-model="selectedDates"
        class="border rounded p-1 text-sm"
      />
      <button
        @click="loadSelectedDates"
        class="bg-blue-500 text-white text-xs px-2 py-1 rounded"
      >
        読み込み
      </button>
      <button
        @click="saveSelectedDates"
        class="bg-green-500 text-white text-xs px-2 py-1 rounded"
      >
        保存
      </button>
    </div>

    <!-- 各日付のシフト -->
    <div v-for="shift in shiftStore.shifts" :key="shift.date" class="mb-4">
      <ShiftContainer :item="shift" :list="shiftStore.shifts">
        <template #header>
          <div class="flex items-center gap-2">
            <span class="font-bold">{{ shift.date }}</span>
            <button
              @click="addTeam(shift)"
              class="bg-green-500 text-white text-xs px-2 py-1 rounded"
            >
              ＋チーム
            </button>
          </div>
        </template>

        <template #body>
          <ScrollableRow>
            <ShiftTeam
              v-for="team in shift.teams"
              :key="team.id"
              :team="team"
              :teams="shift.teams"
            />
          </ScrollableRow>
        </template>
      </ShiftContainer>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useShiftStore } from "@/stores/shiftStore";
import ShiftContainer from "./ShiftContainer.vue";
import ShiftTeam from "./ShiftTeam.vue";
import ScrollableRow from "../common/ScrollableRow.vue";
import { createTeam } from "@/models/shiftModel";

const shiftStore = useShiftStore();
const selectedDates = ref([]);

const loadSelectedDates = async () => {
  for (const d of selectedDates.value) {
    await shiftStore.loadShiftByDate(d);
  }
};

const saveSelectedDates = async () => {
  for (const d of selectedDates.value) {
    await shiftStore.saveShift(d);
  }
};

const addTeam = (shift) => {
  shift.teams.push(createTeam());
};
</script>
