<!-- src/views/ShiftCreateView.vue -->
<template>
  <div class="p-2">
    <div class="flex items-center justify-start mb-2">
      <h2 class="text-lg font-bold">🗓 シフト作成</h2>

      <!-- コンパクト操作ボタン群 -->
      <div class="flex gap-2">
        <button
          @click="toggleCreateMode"
          :disabled="isProcessing"
          class="bg-gray-500 text-white text-sm px-2 py-1 rounded"
          title="新規シフト作成"
        >
          ＋
        </button>
        <button
          @click="loadShifts"
          class="bg-blue-500 text-white text-sm px-2 py-1 rounded"
          title="読み込み"
        >
          🔄
        </button>
        <button
          @click="openSaveDialog"
          class="bg-green-500 text-white text-sm px-2 py-1 rounded"
          title="保存"
        >
          💾
        </button>
      </div>
    </div>

    <!-- ✅ 新規作成モードのときだけ表示 -->
    <div v-if="isCreating" class="border rounded p-2 mb-2 bg-gray-50">
      <label class="font-semibold text-sm mb-1 block">📅 日付を選択（複数可）</label>
      <div class="flex flex-wrap gap-1">
        <input
          type="date"
          v-model="tempDate"
          class="border rounded p-1 text-sm w-40"
        />
        <button
          @click="addDate"
          class="bg-gray-300 text-xs px-2 py-1 rounded"
        >
          ＋追加
        </button>
      </div>

      <!-- 選択済み日付一覧 -->
      <div v-if="selectedDates.length" class="flex flex-wrap mt-2 gap-1 text-sm">
        <span
          v-for="(d, index) in selectedDates"
          :key="index"
          class="px-2 py-1 bg-blue-100 rounded cursor-pointer hover:bg-blue-200"
          @click="removeDate(index)"
        >
          {{ d }}
        </span>
      </div>

      <div class="mt-3 text-right">
        <button
          @click="confirmCreate"
          :disabled="isProcessing"
          class="bg-blue-600 text-white text-sm px-3 py-1 rounded"
        >
          作成
        </button>
      </div>
    </div>

    <!-- 📋 作成済み or 読み込み済みシフト -->
    <div v-if="loadedShifts.length > 0">
      <h3 class="font-semibold mb-1 text-sm text-gray-700">シフト一覧</h3>
      <ScrollableRow>
        <ShiftDate
          v-for="shift in loadedShifts"
          :key="shift.id"
          :shift="shift"
        />
      </ScrollableRow>
    </div>

    <!-- ❗ まだ何もないとき -->
    <div v-else class="text-gray-500 text-sm mt-2">
      まだシフトは作成または読み込まれていません。
    </div>

    <!-- 💾 保存モーダル -->
    <div
      v-if="showSaveDialog"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
    >
      <div class="bg-white rounded-lg p-4 shadow-md w-80">
        <h3 class="text-md font-bold mb-2">💾 シフトを保存</h3>
        <input
          type="text"
          v-model="fileName"
          placeholder="保存ファイル名（例：festival-shift）"
          class="border p-1 rounded w-full mb-3"
        />
        <div class="flex justify-end gap-2">
          <button
            @click="showSaveDialog = false"
            class="bg-gray-300 px-3 py-1 rounded"
          >
            キャンセル
          </button>
          <button
            @click="saveShifts"
            class="bg-green-500 text-white px-3 py-1 rounded"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useShiftStore } from "@/stores/shiftStore";
import ShiftDate from "@/components/shift/ShiftDate.vue";
import ScrollableRow from "@/components/common/ScrollableRow.vue";
import { toYMD_JST } from "@/composables/useJST";

// ストア
const store = useShiftStore();

// 状態
const selectedDates = ref([]);
const tempDate = ref("");
const loadedShifts = ref([]);
const fileName = ref("");
const showSaveDialog = ref(false);
const isCreating = ref(false); // ✅ 追加：新規作成モード制御
  const isProcessing = ref(false); // ボタン処理中フラグ（重複防止） 

// 🔄 新規作成モード切り替え
const toggleCreateMode = () => {
  isCreating.value = !isCreating.value;
  if (isCreating.value) {
    // モードON時は初期化
    selectedDates.value = [];
    tempDate.value = "";
  }
};

// ✅ 日付追加
const addDate = () => {
  if (!tempDate.value) return;
  const jstDate = toYMD_JST(new Date(tempDate.value));
  if (!selectedDates.value.includes(jstDate)) {
    selectedDates.value.push(jstDate);
  }
  tempDate.value = "";
};

// ✅ 日付削除
const removeDate = (index) => {
  selectedDates.value.splice(index, 1);
};

// ✅ 作成確定ボタン押下
// ✅ 作成確定ボタン押下
// ✅ 作成確定ボタン押下
const confirmCreate = async () => {
  if (selectedDates.value.length === 0) {
    alert("📅 日付を1つ以上選択してください。");
    return;
  }

  if (isProcessing.value) return;
  isProcessing.value = true;

  try {
    // ---- 重複作成防止 ----
    for (const d of selectedDates.value) {
      const index = store.shifts.findIndex((s) => s.date === d);
      if (index !== -1) store.shifts.splice(index, 1);
    }

    // ---- 一括作成 ----
    await store.createNewShift(selectedDates.value);

    // ---- 表示に反映 ----
    loadedShifts.value = [...store.shifts];
    alert(`${selectedDates.value.length}日分のシフトを作成しました。`);
  } catch (err) {
    console.error("作成中エラー:", err);
    alert("作成に失敗しました。");
  } finally {
    isProcessing.value = false;
    isCreating.value = false;
    selectedDates.value = [];
  }
};


// ✅ Firestoreから読み込み
const loadShifts = async () => {
  if (selectedDates.value.length === 0) {
    alert("📅 日付を選択してください。");
    return;
  }
  store.isLoading = true;
  try {
    const result = await store.getShiftsByDates(selectedDates.value);
    loadedShifts.value = result;
    if (result.length === 0) alert("📂 Firestoreに該当するシフトはありません。");
    else alert("✅ シフトを読み込みました。");
  } catch (e) {
    console.error("❌ シフト読み込みエラー:", e);
    alert("読み込みに失敗しました。");
  } finally {
    store.isLoading = false;
  }
};

// ✅ 保存モーダル開く
const openSaveDialog = () => {
  if (loadedShifts.value.length === 0) {
    alert("⚠️ 保存するシフトがありません。");
    return;
  }
  showSaveDialog.value = true;
};

// ✅ Firestoreに保存
const saveShifts = async () => {
  if (!fileName.value) {
    alert("⚠️ ファイル名を入力してください。");
    return;
  }
  store.isLoading = true;
  try {
    await store.saveShiftsByDates(loadedShifts.value, fileName.value);
    alert("✅ シフトを保存しました。");
  } catch (e) {
    console.error("❌ シフト保存エラー:", e);
    alert("保存に失敗しました。");
  } finally {
    store.isLoading = false;
    showSaveDialog.value = false;
  }
};
</script>

<style scoped>
button {
  transition: all 0.2s;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
