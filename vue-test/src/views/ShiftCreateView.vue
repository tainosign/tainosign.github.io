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
        >
          ＋日付追加
        </button>
      </div>
    </div>

    <!-- ファイル名入力 -->
    <div class="mb-3">
      <label class="block mb-1 font-semibold">💾 保存ファイル名（任意）</label>
      <input
        type="text"
        v-model="fileName"
        placeholder="例：festival-shift"
        class="border p-1 rounded w-64"
      />
    </div>

    <!-- ボタン群 -->
    <div class="mb-3 flex flex-wrap gap-2">
      <button
        @click="createNewShift"
        class="bg-gray-500 text-white px-3 py-1 rounded"
        :disabled="store.isLoading"
      >
        ＋新規作成
      </button>

      <button
        @click="loadShifts"
        class="bg-blue-500 text-white px-3 py-1 rounded"
        :disabled="store.isLoading"
      >
        🔄 読み込み
      </button>

      <button
        @click="saveShifts"
        class="bg-green-500 text-white px-3 py-1 rounded"
        :disabled="store.isLoading || loadedShifts.length === 0"
      >
        💾 保存
      </button>
    </div>

    <!-- 読み込んだシフト表示 -->
    <div v-if="loadedShifts.length > 0">
      <h3 class="font-semibold mb-2">📋 現在のシフト一覧</h3>
      <ScrollableRow>
        <ShiftDate
          v-for="shift in loadedShifts"
          :key="shift.id"
          :shift="shift"
        />
      </ScrollableRow>
    </div>

    <div v-else class="text-gray-500">
      まだシフトは作成または読み込まれていません。
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useShiftStore } from "@/stores/shiftStore";
import ShiftDate from "@/components/shift/ShiftDate.vue";
import ScrollableRow from "@/components/common/ScrollableRow.vue";

// ストア呼び出し
const store = useShiftStore();

// 状態
const selectedDates = ref([new Date().toISOString().slice(0, 10)]);
const loadedShifts = ref([]);
const fileName = ref("shift");

// 日付フィールド追加
const addDateField = () => {
  selectedDates.value.push("");
};

// 🔹 新規作成ボタン
const createNewShift = () => {
  store.createNewShift(selectedDates.value);
  loadedShifts.value = store.shifts;
  alert("✅ 新しいシフトを作成しました。");
};

// 🔹 読み込みボタン
const loadShifts = async () => {
  if (!selectedDates.value.length) {
    alert("⚠️ 日付を1つ以上選択してください。");
    return;
  }
  store.isLoading = true;
  try {
    const data = await store.getShiftsByDates(selectedDates.value);
    if (data.length === 0) {
      alert("📂 Firestoreに該当するシフトはありません。");
    } else {
      loadedShifts.value = data;
      alert("✅ Firestoreからシフトを読み込みました。");
    }
  } catch (e) {
    console.error("シフト読み込みエラー:", e);
    alert("❌ シフト読み込みに失敗しました。");
  } finally {
    store.isLoading = false;
  }
};

// 🔹 保存ボタン
const saveShifts = async () => {
  if (loadedShifts.value.length === 0) {
    alert("⚠️ 保存するシフトがありません。");
    return;
  }
  store.isLoading = true;
  try {
    await store.saveShiftsByDates(loadedShifts.value, fileName.value);
    alert("✅ シフトをFirestoreに保存しました。");
  } catch (e) {
    console.error("シフト保存エラー:", e);
    alert("❌ シフト保存に失敗しました。");
  } finally {
    store.isLoading = false;
  }
};

// マウント時に日付情報などをロード
onMounted(() => {
  store.loadFestivalShifts();
});
</script>

<style scoped>
input[type="date"] {
  width: 180px;
}
</style>
