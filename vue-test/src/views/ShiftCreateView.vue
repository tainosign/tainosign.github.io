<template>
  <div class="p-4">
    <!-- 日付選択ドロップダウン -->
    <div class="mb-4 flex items-center space-x-2">
      <select v-model="selectedDate" class="border rounded px-2 py-1">
        <option v-for="date in availableDates" :key="date" :value="date">
          {{ date }}
        </option>
      </select>
      <button @click="addDateFromDropdown" class="bg-green-500 text-white px-3 py-1 rounded">
        日付追加
      </button>
    </div>

    <!-- 日付コンポーネント一覧 -->
    <div class="flex space-x-2 overflow-x-auto mb-2">
      <ShiftDate
        v-for="date in shiftDates"
        :key="date.id"
        :date="date.id"
        :timeRange="date.timeRange"
        :teams="date.teams"
        @copy-date="copyDate"
        @delete-date="deleteDate"
        @add-team="addTeam"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import ShiftDate from "@/components/shift/ShiftDate.vue";
import { getJSTDateString, nowJST } from "@/composables/useJST.js";
import { nanoid } from "nanoid";

// 初期は日付コンポーネントを空にしておく
const shiftDates = reactive([]);

// 日付追加用のドロップダウン選択
const selectedDate = ref("");

// JST を基準に、過去1日～未来7日程度を候補にする例
const availableDates = computed(() => {
  const today = new Date(getJSTDateString());
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${day}`;
    // 既に shiftDates に存在する日付は除外
    if (!shiftDates.some(sd => sd.id === dateStr)) {
      dates.push(dateStr);
    }
  }
  return dates;
}));

// ドロップダウンで選択した日付を追加
function addDateFromDropdown() {
  if (!selectedDate.value) return;
  shiftDates.push({
    id: selectedDate.value,
    timeRange: { start: "06:00", end: "20:00" },
    teams: [] // 最初はチームなし
  });
  selectedDate.value = "";
}

// ダミーのイベントハンドラ（ShiftDate 側で emit）
function copyDate(dateId) {}
function deleteDate(dateId) {}
function addTeam(dateId) {}
</script>
