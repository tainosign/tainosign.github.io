<!-- src/views/ShiftCreateView.vue -->
<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-3">シフト作成（複数日対応）</h2>

    <!-- 日付選択 -->
    <div class="mb-3">
      <label class="block mb-1 font-semibold">📅 日付を選択（複数選択可）</label>
      <div class="flex flex-wrap gap-2">
        <input
          type="date"
          v-for="(d, index) in selectedDates"
          :key="index"
          v-model="selectedDates[index]"
          class="border p-1 rounded"
        />
        <button
          @click="addDateField"
          class="bg-gray-300 px-2 py-1 rounded"
        >＋日付追加</button>
      </div>
    </div>

    <!-- 読み込み・保存ボタン -->
    <div class="mb-3">
      <button
        @click="loadShifts"
        class="bg-blue-500 text-white px-3 py-1 rounded mr-2"
        :disabled="store.isLoading"
      >選択日付のシフトを読み込み</button>

      <button
        @click="saveShifts"
        class="bg-green-500 text-white px-3 py-1 rounded"
        :disabled="store.isLoading || loadedShifts.length === 0"
      >選択日付のシフトを保存</button>
    </div>

    <!-- 読み込んだシフト表示 -->
    <div v-if="loadedShifts.length > 0">
      <h3 class="font-semibold mb-2">📋 読み込んだシフト</h3>
      <ScrollableRow>
        <ShiftDate
          v-for="shift in loadedShifts"
          :key="shift.id"
          :shift="shift"
        />
      </ScrollableRow>
    </div>

    <div v-else class="text-gray-500">まだシフトは読み込まれていません。</div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useShiftStore } from "@/stores/shiftStore";
import ShiftDate from "@/components/shift/ShiftDate.vue";
import ScrollableRow from "@/components/common/ScrollableRow.vue";

const store = useShiftStore();
const selectedDates = ref([new Date().toISOString().slice(0, 10)]);
const loadedShifts = ref([]);

// 日付フィールド追加
const addDateField = () => {
  selectedDates.value.push("");
};

// シフト読み込み
const loadShifts = async () => {
  store.isLoading = true;
  try {
    const data = await store.getShiftsByDates(selectedDates.value);
    loadedShifts.value = data;
  } catch (e) {
    console.error("シフト読み込みエラー:", e);
  } finally {
    store.isLoading = false;
  }
};

// シフト保存
const saveShifts = async () => {
  store.isLoading = true;
  try {
    await store.saveShiftsByDates(loadedShifts.value);
    alert("✅ 選択日付のシフトを保存しました");
  } catch (e) {
    console.error("シフト保存エラー:", e);
  } finally {
    store.isLoading = false;
  }
};

// 初期化
store.init();
</script>
