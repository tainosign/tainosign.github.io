<template>
  <div class="shift-create-page p-2">
    <div class="header-bar flex items-center gap-4 mb-3">
      <h2 class="title">🗓 シフト作成</h2>
      <div class="button-group flex gap-2">
        <button @click="toggleCreateMode" class="btn btn-gray">＋</button>
        <button @click="loadShifts" class="btn btn-blue">🔄</button>
        <button @click="openSaveDialog" class="btn btn-green">💾</button>
      </div>
    </div>

    <div v-if="isCreating" class="create-panel mb-3 p-2 bg-gray-50 rounded">
      <label class="label">📅 日付を選択（複数可）</label>
      <div class="date-input-row flex gap-2 items-center">
        <input type="date" v-model="tempDate" class="date-input" />
        <button @click="addDate" class="btn btn-light">＋追加</button>
      </div>

      <div v-if="selectedDates.length" class="selected-dates mt-2">
        <span v-for="(d, index) in selectedDates" :key="index" class="selected-date mr-2 cursor-pointer" @click="removeDate(index)">{{ d }}</span>
      </div>

      <div class="actions mt-2">
        <button @click="confirmCreate" class="btn btn-blue">作成</button>
      </div>
    </div>

    <div v-if="loadedShifts.length > 0" class="shift-list-wrapper overflow-x-auto">
      <div class="shift-wrapper flex gap-3">
        <div v-for="shift in loadedShifts" :key="shift.id" class="shift-column">
          <ShiftDate :shift="shift" @update-shift="reloadLocal" :unitPer10Min="unitPer10Min" />
        </div>
      </div>
    </div>

    <div v-else class="empty-message">まだシフトは作成または読み込まれていません。</div>

    <div v-if="showSaveDialog" class="modal-backdrop fixed inset-0 flex items-center justify-center bg-black/40">
      <div class="modal bg-white p-4 rounded">
        <h3 class="modal-title">💾 シフトを保存</h3>
        <input type="text" v-model="fileName" placeholder="保存ファイル名" class="modal-input mb-2" />
        <div class="modal-actions flex gap-2 justify-end">
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

const store = useShiftStore();

const selectedDates = ref([]);
const tempDate = ref("");
const loadedShifts = ref([]);
const fileName = ref("");
const showSaveDialog = ref(false);
const isCreating = ref(false);
const isProcessing = ref(false);

// timeline unit (10min -> px)
const unitPer10Min = 6;

const toggleCreateMode = () => {
  isCreating.value = !isCreating.value;
  if (isCreating.value) {
    selectedDates.value = [];
    tempDate.value = "";
  }
};

const addDate = () => {
  if (!tempDate.value) return;
  const jstDate = toYMD_JST(new Date(tempDate.value));
  if (!selectedDates.value.includes(jstDate)) selectedDates.value.push(jstDate);
  tempDate.value = "";
};

const removeDate = (i) => selectedDates.value.splice(i, 1);

const confirmCreate = async () => {
  if (selectedDates.value.length === 0) {
    alert("日付を1つ以上選択してください");
    return;
  }
  isProcessing.value = true;
  try {
    // create shifts in store
    store.createNewShift(selectedDates.value);

    // for each created date, create one team, one position, one slot so UI shows something
    for (const d of selectedDates.value) {
      // add team
      store.addTeam(d);
      // find team id (last)
      const shift = store.shifts.find((s) => s.date === d);
      if (!shift) continue;
      const team = shift.teams[shift.teams.length - 1];
      // add position
      store.addPosition(d, team.id);
      const position = team.positions[team.positions.length - 1];
      // add one slot (slot object in store)
      store.addSlot(d, team.id, position.positionId);
      // The addSlot stores a slot object with members:[], but our ShiftSlot expects blocks; fine for now.
    }

    // reflect to local
    loadedShifts.value = store.shifts;
  } catch (err) {
    console.error(err);
    alert("作成失敗");
  } finally {
    isProcessing.value = false;
    isCreating.value = false;
    selectedDates.value = [];
  }
};

const loadShifts = async () => {
  if (selectedDates.value.length === 0) {
    alert("日付を選択してください（読み込み）");
    return;
  }
  store.isLoading = true;
  try {
    const result = await store.getShiftsByDates(selectedDates.value);
    loadedShifts.value = result;
  } catch (err) {
    console.error(err);
    alert("読み込み失敗");
  } finally {
    store.isLoading = false;
  }
};

const openSaveDialog = () => {
  if (!loadedShifts.value.length) {
    alert("保存するシフトがありません");
    return;
  }
  showSaveDialog.value = true;
};

const saveShifts = async () => {
  if (!fileName.value) {
    alert("ファイル名を入力してください");
    return;
  }
  try {
    await store.saveShiftsByDates(loadedShifts.value, fileName.value);
    alert("保存しました");
  } catch (err) {
    console.error(err);
    alert("保存失敗");
  } finally {
    showSaveDialog.value = false;
  }
};

const reloadLocal = () => {
  // quick refresh reference
  loadedShifts.value = store.shifts;
};

// init view with store.shifts reference if any
loadedShifts.value = store.shifts;
</script>

<style scoped>
/* ShiftCreateView.vue の style セクション、またはグローバル CSS に追加 */
.shift-wrapper {
  display: flex;
  gap: 16px; /* 日付間の間隔を確保 */
  align-items: flex-start;
}
.shift-column {
  flex: 0 0 auto;
  margin-right: 16px; /* 右余白も明示 */
}
.btn { padding: 6px 8px; border-radius: 6px; border: none; cursor: pointer; }
.btn-gray { background:#666; color:#fff; }
.btn-blue { background:#007bff; color:#fff; }
.btn-green { background:#28a745; color:#fff; }
.btn-light { background:#eee; color:#333; }
</style>
