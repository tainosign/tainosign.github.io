<!-- src/views/ShiftCreateView.vue -->
<template>
  <div class="shift-create-page">
    <!-- ヘッダー部分 -->
    <div class="header-bar">
      <h2 class="title">🗓 シフト作成</h2>

      <div class="button-group">
        <button
          @click="toggleCreateMode"
          :disabled="isProcessing"
          class="btn btn-gray"
          title="新規シフト作成"
        >
          ＋
        </button>
        <button
          @click="loadShifts"
          class="btn btn-blue"
          title="読み込み"
        >
          🔄
        </button>
        <button
          @click="openSaveDialog"
          class="btn btn-green"
          title="保存"
        >
          💾
        </button>
      </div>
    </div>

    <!-- ✅ 新規作成モード -->
    <div v-if="isCreating" class="create-panel">
      <label class="label">📅 日付を選択（複数可）</label>
      <div class="date-input-row">
        <input
          type="date"
          v-model="tempDate"
          class="date-input"
        />
        <button @click="addDate" class="btn btn-light">＋追加</button>
      </div>

      <div v-if="selectedDates.length" class="selected-dates">
        <span
          v-for="(d, index) in selectedDates"
          :key="index"
          class="selected-date"
          @click="removeDate(index)"
        >
          {{ d }}
        </span>
      </div>

      <div class="actions">
        <button
          @click="confirmCreate"
          :disabled="isProcessing"
          class="btn btn-blue"
        >
          作成
        </button>
      </div>
    </div>

    <!-- 📋 シフト一覧 -->
    <div v-if="loadedShifts.length > 0" class="shift-list-wrapper">
      <div class="shift-wrapper">
        <div
          v-for="shift in loadedShifts"
          :key="shift.id"
          class="shift-container"
        >
          <ShiftDate :shift="shift" />
        </div>
      </div>
    </div>

    <!-- ❗ まだ何もないとき -->
    <div v-else class="empty-message">
      まだシフトは作成または読み込まれていません。
    </div>

    <!-- 💾 保存モーダル -->
    <div
      v-if="showSaveDialog"
      class="modal-backdrop"
    >
      <div class="modal">
        <h3 class="modal-title">💾 シフトを保存</h3>
        <input
          type="text"
          v-model="fileName"
          placeholder="保存ファイル名（例：festival-shift）"
          class="modal-input"
        />
        <div class="modal-actions">
          <button @click="showSaveDialog = false" class="btn btn-light">キャンセル</button>
          <button @click="saveShifts" class="btn btn-green">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useShiftStore } from "@/stores/shiftStore";
import ShiftDate from "@/components/shift/ShiftDate.vue";
import { toYMD_JST } from "@/composables/useJST";

// ストア
const store = useShiftStore();

// 状態管理
const selectedDates = ref([]);
const tempDate = ref("");
const loadedShifts = ref([]);
const fileName = ref("");
const showSaveDialog = ref(false);
const isCreating = ref(false);
const isProcessing = ref(false);

// ✅ 新規作成モード切替
const toggleCreateMode = () => {
  isCreating.value = !isCreating.value;
  if (isCreating.value) {
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

// ✅ 作成確定
const confirmCreate = async () => {
  if (selectedDates.value.length === 0) {
    alert("📅 日付を1つ以上選択してください。");
    return;
  }
  if (isProcessing.value) return;
  isProcessing.value = true;

  try {
    // ここで store に直接作成（重複日付はスキップ）
    store.createNewShift(selectedDates.value);

    // loadedShifts は store.shifts の参照だけにする
    loadedShifts.value = store.shifts;
  } catch (err) {
    console.error(err);
    alert("作成に失敗しました。");
  } finally {
    isProcessing.value = false;
    isCreating.value = false;
    selectedDates.value = [];
  }
};


// ✅ Firestore読み込み
const loadShifts = async () => {
  if (selectedDates.value.length === 0) {
    alert("📅 日付を選択してください。");
    return;
  }
  store.isLoading = true;
  try {
    const result = await store.getShiftsByDates(selectedDates.value);
    loadedShifts.value = result;
  } catch (e) {
    console.error(e);
    alert("読み込みに失敗しました。");
  } finally {
    store.isLoading = false;
  }
};

// ✅ 保存
const openSaveDialog = () => {
  if (loadedShifts.value.length === 0) {
    alert("⚠️ 保存するシフトがありません。");
    return;
  }
  showSaveDialog.value = true;
};

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
    console.error(e);
    alert("保存に失敗しました。");
  } finally {
    store.isLoading = false;
    showSaveDialog.value = false;
  }
};
</script>

<style scoped>
/* 全体レイアウト */
.shift-create-page {
  padding: 8px;
}

/* ヘッダー */
.header-bar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.title {
  font-weight: bold;
  font-size: 1.1rem;
}

.button-group {
  display: flex;
  gap: 6px;
}

/* ボタン共通 */
.btn {
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn:hover {
  opacity: 0.8;
}
.btn-gray { background: #666; color: white; }
.btn-blue { background: #007bff; color: white; }
.btn-green { background: #28a745; color: white; }
.btn-light { background: #e0e0e0; color: #333; }

/* 新規作成パネル */
.create-panel {
  background: #f8f9fa;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
}

.label {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 4px;
  display: block;
}

.date-input-row {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.date-input {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 4px;
  font-size: 0.85rem;
}

.selected-dates {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.selected-date {
  background: #cce5ff;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.2s;
}
.selected-date:hover {
  background: #99ccff;
}

.actions {
  text-align: right;
  margin-top: 8px;
}

/* シフト表示エリア */
.shift-list-wrapper {
  overflow-x: auto;
}

.shift-wrapper {
  display: flex;
  flex-wrap: nowrap;
  gap: 12px;
  padding: 6px;
  overflow-x: auto;
  scroll-behavior: smooth;
}

.shift-container {
  flex: 0 0 320px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

/* モーダル */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  background: white;
  padding: 16px;
  border-radius: 10px;
  width: 90%;
  max-width: 360px;
}

.modal-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.modal-input {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 6px;
  margin-bottom: 10px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.empty-message {
  color: #666;
  font-size: 0.85rem;
  margin-top: 8px;
}
</style>
