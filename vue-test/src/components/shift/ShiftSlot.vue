       @mousedown.prevent="selectBlock(block)"
              :title="block.memberName || '未割当'"
              draggable="true"
              @dragstart.stop="onBlockDragStart(block, $event)"
            >
              <div class="label">{{ block.memberName || '未割当' }}</div>

              <div class="size-buttons">
                <button class="op-btn" @click.stop="decrease(block)" title="短くする">-</button>
                <button class="op-btn" @click.stop="increase(block)" title="長くする">+</button>
                <button class="op-btn btn-remove-block" @click.stop="removeBlock(block.id)" title="ブロック削除">✖</button>
              </div>
            </div>
          </div>

          <!-- 時間ルーラー -->
          <div class="time-ruler" aria-hidden>
            <div class="ruler-inner" :style="{ width: timelineInnerWidth + 'px' }">
              <div
                v-for="h in hourArray"
                :key="h"
                class="hour-mark"
                :style="{ left: ((h - startHour) * 60 / 10 * unitPer10Min) + 'px' }"
              >
                <div class="h-line"></div>
                <div class="h-label">{{ padHour(h) }}</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- 選択中のブロック情報 -->
    <div v-if="selectedBlock" class="selected-info">
      選択: <strong>{{ selectedBlock.memberName || '未割当' }}</strong>
      （開始: {{ minutesToHHMM(selectedBlock.start_min) }} / 長さ: {{ selectedBlock.duration_min }}分）
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useDragManager } from "@/composables/useDragManager";
import { useShiftStore } from "@/stores/shiftStore";

const props = defineProps({
  slotId: { type: String, required: false }, // parent should pass
  blocks: { type: Array, default: () => [] }, // canonical: blocks array for this slot
  startHour: { type: Number, default: 7 },
  endHour: { type: Number, default: 20 },
  unitPer10Min: { type: Number, default: 6 },
  slotHeight: { type: Number, default: 40 },
  pad: { type: String, default: "0.1vw" },
  shiftDate: { type: String, required: false },
  teamId: { type: String, required: false },
  positionId: { type: String, required: false },
  timelineWidthPx: { type: Number, default: null }, // explicit fixed width if provided
});

const emit = defineEmits(["update-slots", "remove-slot"]);
const dragManager = useDragManager();
const store = useShiftStore();

const cssPad = computed(() => props.pad || "0.1vw");
const timelineRef = ref(null);
const selectedBlock = ref(null);

// timeline width — timelineWidthPx 優先、未指定なら start/end から計算
const timelineInnerWidth = computed(() => {
  if (props.timelineWidthPx && Number.isFinite(props.timelineWidthPx)) return props.timelineWidthPx;
  const hours = Math.max(1, props.endHour - props.startHour);
  const tenMinUnits = hours * 6;
  // add small right padding so last label doesn't get clipped
  return tenMinUnits * props.unitPer10Min + 48;
});

// local copy of blocks to edit safely
const localBlocks = ref((props.blocks || []).map(b => ({ ...b })));

// hour ticks
const hourArray = computed(() => {
  const arr = [];
  for (let h = props.startHour; h <= props.endHour; h++) arr.push(h);
  return arr;
});

function padHour(h) { return String(h).padStart(2, "0"); }
function minutesToHHMM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// block style (absolute)
function blockBodyStyle(block) {
  const startMin = Number(block.start_min || 0);
  const duration = Number(block.duration_min || 0);
  const minutesFromStart = startMin - props.startHour * 60;
  const leftPx = Math.max(0, (minutesFromStart / 10) * props.unitPer10Min);
  const widthPx = Math.max(12, (duration / 10) * props.unitPer10Min);
  return {
    position: "absolute",
    left: `${leftPx}px`,
    top: `0px`,
    width: `${widthPx}px`,
    height: `${props.slotHeight}px`,
    boxSizing: "border-box",
    borderRadius: "4px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    paddingLeft: "6px",
    paddingRight: "6px",
    zIndex: 10,
    overflow: "hidden",
  };
}

// edit operations
function increase(block) {
  block.duration_min = (Number(block.duration_min) || 0) + 10;
  syncUp();
}
function decrease(block) {
  block.duration_min = Math.max(10, (Number(block.duration_min) || 0) - 10);
  syncUp();
}
function removeBlock(id) {
  localBlocks.value = localBlocks.value.filter(b => b.id !== id);
  syncUp();
}

// remove whole slot -> tell parent to delete slot object
function removeThisSlot() {
  if (props.slotId) emit("remove-slot", props.slotId);
}

// select
function selectBlock(block) {
  selectedBlock.value = block;
}

// block drag start
function onBlockDragStart(block, e) {
  if (!block) return;
  dragManager.startDrag("slotBlock", { ...block, slotId: props.slotId }, e);
  e.dataTransfer?.setData("application/json", JSON.stringify({ dragType: "slotBlock", payload: { ...block, slotId: props.slotId } }));
}

// slot-row drag (move entire slot between positions/dates if implemented)
function onSlotRowDragStart(e) {
  const payload = { slotId: props.slotId, shiftDate: props.shiftDate, teamId: props.teamId, positionId: props.positionId };
  dragManager.startDrag("slotRow", payload, e);
  e.dataTransfer?.setData("application/json", JSON.stringify({ dragType: "slotRow", payload }));
}

function onDragEnd() { dragManager.clearDrag(); }
function onDragOver(e) { if (e?.dataTransfer) e.dataTransfer.dropEffect = "move"; }

// drop (timeline): reposition existing block or add a new member block
function onDrop(e) {
  try {
    const raw = e.dataTransfer.getData("application/json") || "";
    if (!raw) return;
    const { dragType, payload } = JSON.parse(raw);
    const rect = timelineRef.value.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const tenMinUnitsFromLeft = Math.round(x / props.unitPer10Min);
    const minutesFromStart = tenMinUnitsFromLeft * 10;
    const newStart = props.startHour * 60 + minutesFromStart;

    if (dragType === "slotBlock") {
      // existing block moved: find by id (payload may include slotId)
      const idx = localBlocks.value.findIndex(b => b.id === payload.id);
      if (idx !== -1) {
        localBlocks.value[idx].start_min = newStart;
        syncUp();
      }
    } else if (dragType === "member") {
      // add new block representing dropped member
      const block = {
        id: `blk_${Date.now()}`,
        memberId: payload.id || payload.uid || null,
        memberName: payload.name_kanji || payload.name || "メンバー",
        start_min: newStart,
        duration_min: 60,
      };
      localBlocks.value.push(block);
      syncUp();

      // optionally persist to store if identifiers available
      if (props.shiftDate && props.teamId && props.positionId && props.slotId) {
        store.assignMemberToSlot?.(props.shiftDate, props.teamId, props.positionId, {
          id: block.id,
          memberId: block.memberId,
          memberName: block.memberName,
          start_min: block.start_min,
          duration_min: block.duration_min,
        });
      }
    }
  } catch (err) {
    console.error("ShiftSlot.onDrop error:", err);
  } finally {
    dragManager.clearDrag();
  }
}

// notify parent with { slotId, blocks }
function syncUp() {
  emit("update-slots", { slotId: props.slotId, blocks: localBlocks.value.map(b => ({ ...b })) });
}

// keep local in sync with incoming prop changes
watch(
  () => props.blocks,
  (v) => {
    localBlocks.value = (v || []).map(b => ({ ...b }));
  },
  { deep: true, immediate: true }
);
</script>

<style scoped>
.shift-slot-root { width: 100%; box-sizing: border-box; }

/* row: 左ツール列 + timeline */
.slot-row { display: flex; gap: 12px; align-items: flex-start; }

/* 左ツール（固定） */
.slot-left-tools {
  width: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-top: 6px;
  box-sizing: border-box;
  flex-shrink: 0;
}
.drag-handle { font-size: 18px; cursor: grab; user-select: none; }
.drag-handle:active { cursor: grabbing; }
.delete-btn {
  background: #fff;
  border: 1px solid #e6e6e6;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

/* timeline root: 横幅は timeline-inner に依存（横スクロールが必要な場合のみ出る） */
.timeline-root {
  flex: 1;
  overflow-x: auto;
  overflow-y: visible;
  position: relative;
}

/* timeline-inner holds absolute blocks and ruler; ensure min-height to show ruler */
.timeline-inner {
  position: relative;
  box-sizing: border-box;
  padding-bottom: 32px; /* space for ruler labels */
  min-height: calc(var(--slot-height, 40px) + 18px);
}

/* slot-block-area contains absolutely positioned blocks */
.slot-block-area {
  position: relative;
  height: 100%;
}

/* block appearance */
.block-body {
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  box-sizing: border-box;
  padding-right: 36px; /* space for size buttons */
}

/* block label */
.label {
  padding-right: 8px;
  font-size: 12px;
  color: #222;
}

/* size / remove buttons inside block */
.size-buttons {
  position: absolute;
  right: 6px;
  top: 6px;
  display: flex;
  gap: 6px;
  z-index: 50;
}
.op-btn {
  padding: 2px 6px;
  font-size: 11px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: #f3f3f3;
  cursor: pointer;
}
.btn-remove-block { background:#fff4f4; border-color:#f5c6cb; color:#c53030; }

/* time ruler */
.time-ruler { position: relative; margin-top: 8px; }
.ruler-inner { position: relative; height: 28px; }
.hour-mark { position: absolute; top: 0; transform: translateX(-0.5px); text-align: center; }
.h-line { width: 1px; height: 8px; background: #9ca3af; margin: 0 auto; }
.h-label { margin-top: 4px; font-size: 11px; color: #4b5563; }

/* selected info */
.selected-info { margin-top: 6px; font-size: 12px; color: #374151; }
</style>
<!-- src/components/shift/ShiftSlot.vue -->
<template>
  <div class="shift-slot-root" :style="{ padding: cssPad }">
    <div class="slot-row">
      <!-- 左ツール列（スロット単位） -->
      <div class="slot-left-tools" @mousedown.stop>
        <div
          class="drag-handle"
          draggable="true"
          @dragstart.stop="onHandleRowDragStart"
          @dragend.stop="onDragEnd"
          title="スロット行を移動"
        >⋮</div>
        <button
          class="delete-btn"
          @click.stop="onRemoveSlot"
          title="このスロットを削除"
        >✖</button>
      </div>

      <!-- タイムライン本体 -->
      <div
        class="timeline-root"
        ref="timelineRef"
        @dragover.prevent="onDragOver"
        @drop.prevent="onDrop"
      >
        <div class="timeline-inner" :style="{ width: `${timelineInnerWidth}px` }">
          <!-- ブロックを絶対配置 -->
          <div class="slot-block-area" :style="{ height: `${slotHeight}px` }">
            <div
              v-for="block in localBlocks"
              :key="block.id"
              class="block-body"
              :style="blockStyle(block)"
              @mousedown.prevent="selectBlock(block)"
              :title="block.memberName || '未割当'"
            >
              <div class="block-label">{{ block.memberName || '未割当' }}</div>
              <div class="size-buttons">
                <button class="op-btn" @click.stop="decrease(block)">-</button>
                <button class="op-btn" @click.stop="increase(block)">+</button>
              </div>
            </div>
          </div>

          <!-- 時間目盛 -->
          <div class="time-ruler">
            <div class="ruler-inner" :style="{ width: `${timelineInnerWidth}px` }">
              <div
                v-for="h in hourArray"
                :key="h"
                class="hour-mark"
                :style="{ left: `${((h - startHour) * 60 / 10) * unitPer10Min}px` }"
              >
                <div class="h-line"></div>
                <div class="h-label">{{ padHour(h) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 選択中のブロック情報 -->
    <div v-if="selectedBlock" class="selected-info">
      選択: <strong>{{ selectedBlock.memberName || "未割当" }}</strong>
      （開始: {{ minutesToHHMM(selectedBlock.start_min) }} / 長さ: {{ selectedBlock.duration_min }}分）
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useDragManager } from "@/composables/useDragManager";
import { useShiftStore } from "@/stores/shiftStore";

const props = defineProps({
  slotId: { type: String, required: true },
  blocks: { type: Array, default: () => [] },
  startHour: { type: Number, default: 7 },
  endHour: { type: Number, default: 20 },
  unitPer10Min: { type: Number, default: 6 },
  slotHeight: { type: Number, default: 40 },
  pad: { type: String, default: "0.1vw" },
  shiftDate: { type: String, required: true },
  teamId: { type: String, required: true },
  positionId: { type: String, required: true },
  timelineWidthPx: { type: Number, default: null },
});

const emit = defineEmits(["update-slots", "remove-slot"]);
const dragManager = useDragManager();
const store = useShiftStore();

const cssPad = computed(() => props.pad);

// DOM refs
const timelineRef = ref(null);

// 選択中ブロック
const selectedBlock = ref(null);

// タイムライン幅の計算
const timelineInnerWidth = computed(() => {
  if (props.timelineWidthPx !== null) return props.timelineWidthPx;
  const hours = props.endHour - props.startHour;
  const units10min = (hours * 60) / 10;
  return units10min * props.unitPer10Min + 20; // 少し余裕を持たせる
});

// ローカルなブロック配列（親から渡された props.blocks をコピー）
const localBlocks = ref(props.blocks.map((b) => ({ ...b })));

// 時間マーク用の時間配列
const hourArray = computed(() => {
  const arr = [];
  for (let h = props.startHour; h <= props.endHour; h++) arr.push(h);
  return arr;
});

function padHour(h) {
  return String(h).padStart(2, "0");
}
function minutesToHHMM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ブロック描画スタイル
function blockStyle(block) {
  const minutesFromStart = (block.start_min || 0) - props.startHour * 60;
  const leftPx = Math.max(0, (minutesFromStart / 10) * props.unitPer10Min);
  const widthPx = Math.max(12, ((block.duration_min || 0) / 10) * props.unitPer10Min);
  return {
    position: "absolute",
    left: `${leftPx}px`,
    top: "0px",
    width: `${widthPx}px`,
    height: `${props.slotHeight}px`,
    boxSizing: "border-box",
    borderRadius: "4px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    paddingLeft: "6px",
    paddingRight: "6px",
    zIndex: 10,
  };
}

// 増減
function increase(block) {
  block.duration_min = (block.duration_min || 0) + 10;
  syncToParent();
}
function decrease(block) {
  block.duration_min = Math.max(10, (block.duration_min || 0) - 10);
  syncToParent();
}

// ブロック削除
function removeBlock(id) {
  localBlocks.value = localBlocks.value.filter((b) => b.id !== id);
  syncToParent();
}

// スロット削除（親に通知）
function onRemoveSlot() {
  emit("remove-slot", props.slotId);
}

// ブロック選択
function selectBlock(block) {
  selectedBlock.value = block;
}

// ドラッグ開始（スロット行単位）
function onHandleRowDragStart(e) {
  const payload = {
    slotId: props.slotId,
    date: props.shiftDate,
    teamId: props.teamId,
    positionId: props.positionId,
  };
  dragManager.startDrag("slotRow", payload, e);
  e.dataTransfer?.setData("application/json", JSON.stringify({ dragType: "slotRow", payload }));
}
// ドラッグ終了
function onDragEnd() {
  dragManager.clearDrag();
}
// ドラッグ中オーバー
function onDragOver(e) {
  if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
}

// ドロップ処理（ブロック移動またはメンバー追加）
function onDrop(e) {
  try {
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;
    const { dragType, payload } = JSON.parse(raw);
    const rect = timelineRef.value.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const units = Math.round(x / props.unitPer10Min);
    const minutes = units * 10;
    const newStart = props.startHour * 60 + minutes;

    if (dragType === "slotBlock") {
      const idx = localBlocks.value.findIndex((b) => b.id === payload.id);
      if (idx !== -1) {
        localBlocks.value[idx].start_min = newStart;
        syncToParent();
      }
    } else if (dragType === "member") {
      const block = {
        id: `blk_${Date.now()}`,
        memberId: payload.id || null,
        memberName: payload.name_kanji || payload.name || "メンバー",
        start_min: newStart,
        duration_min: 60,
      };
      localBlocks.value.push(block);
      syncToParent();
      // ストアにも反映（オプション）
      store.assignMemberToSlot(
        props.shiftDate,
        props.teamId,
        props.positionId,
        {
          id: block.id,
          memberId: block.memberId,
          memberName: block.memberName,
          start_min: block.start_min,
          duration_min: block.duration_min,
        }
      );
    }
  } catch (err) {
    console.error("ShiftSlot onDrop error:", err);
  } finally {
    dragManager.clearDrag();
  }
}

// 親に更新を通知
function syncToParent() {
  emit("update-slots", {
    slotId: props.slotId,
    blocks: localBlocks.value.map((b) => ({ ...b })),
  });
}

// props.blocks に変更があればローカルを更新
watch(
  () => props.blocks,
  (v) => {
    localBlocks.value = (v || []).map((b) => ({ ...b }));
  },
  { deep: true }
);
</script>

<style scoped>
.shift-slot-root {
  width: 100%;
  box-sizing: border-box;
}

.slot-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.slot-left-tools {
  width: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-top: 6px;
}

.drag-handle {
  font-size: 16px;
  cursor: grab;
}
.drag-handle:active {
  cursor: grabbing;
}

.delete-btn {
  background: #fff;
  border: 1px solid #e6e6e6;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
}

.timeline-root {
  flex: 1;
  overflow-x: auto;
  position: relative;
  overflow-y: visible;
}

.timeline-inner {
  position: relative;
  min-height: calc(var(--slot-height, 40px) + 36px);
  box-sizing: border-box;
  padding-bottom: 28px;
}

.slot-block-area {
  position: relative;
  width: 100%;
}

.block-body {
  display: flex;
  align-items: center;
  overflow: hidden;
  box-sizing: border-box;
}

.block-label {
  padding-right: 8px;
  font-size: 12px;
  white-space: nowrap;
}

.size-buttons {
  position: absolute;
  right: 6px;
  top: 6px;
  display: flex;
  gap: 4px;
  z-index: 50;
}

.op-btn {
  padding: 2px 6px;
  font-size: 11px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f3f3f3;
  cursor: pointer;
}

.time-ruler {
  margin-top: 8px;
}
.ruler-inner {
  position: relative;
  height: 28px;
}
.hour-mark {
  position: absolute;
  top: 0;
  transform: translateX(-0.5px);
  width: 1px;
}
.h-line {
  width: 1px;
  height: 8px;
  background: #9ca3af;
  margin: 0 auto;
}
.h-label {
  font-size: 11px;
  color: #4b5563;
  margin-top: 4px;
}

.selected-info {
  margin-top: 6px;
  font-size: 12px;
  color: #374151;
}
</style>
