<template>
  <div class="p-3 border rounded-lg bg-gray-50">
    <h2 class="font-semibold text-lg mb-2">シフト管理ツールバー</h2>

    <!-- 日付選択（複数） -->
    <label class="block mb-2 text-sm text-gray-600">📅 対象日付を選択</label>
    <input
      type="date"
      v-model="newDate"
      class="border p-1 rounded mr-2"
    />
    <button @click="addDate" class="px-3 py-1 bg-blue-500 text-white rounded">
      追加
    </button>

    <div class="mt-2 flex flex-wrap gap-2">
      <span
        v-for="d in store.selectedDates"
        :key="d"
        class="px-2 py-1 bg-gray-200 rounded text-sm"
      >
        {{ d }}
      </span>
    </div>

    <!-- 操作ボタン -->
    <div class="mt-4 flex gap-3">
      <button
        @click="store.loadSelectedShifts"
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        📥 選択日読み込み
      </button>
      <button
        @click="store.saveSelectedShifts"
        class="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
      >
        💾 選択日保存
      </button>
    </div>

    <!-- ロード中表示 -->
    <p v-if="store.isLoading" class="text-gray-500 mt-3">読み込み中...</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useShiftStore } from "@/stores/shiftStore";

const store = useShiftStore();
const newDate = ref("");

const addDate = () => {
  if (!newDate.value) return;
  if (!store.selectedDates.includes(newDate.value)) {
    store.selectedDates.push(newDate.value);
    store.addShift(newDate.value);
  }
  newDate.value = "";
};
</script>
