<!-- src/components/shift/ShiftSlot.vue -->
<template>
  <div class="shift-slot-root" :style="{ padding: cssPad }">
    <div class="slot-row">
      <!-- 左ツール列（スロット単位のハンドルとスロット削除） -->
      <div class="slot-left-tools" @mousedown.stop>
        <button
          class="slot-drag-handle"
          draggable="true"
          @dragstart.stop="onBlockHandleDragStartSlot($event)"
          @dragend.stop="onDragEnd"
          :aria-label="'ドラッグハンドル ' + (slotId || 'new')"
          title="スロット行を移動"
        >⋮</button>

        <button
          class="slot-delete-btn"
          v-if="slotId"
          @click.stop="removeThisSlot"
          :title="'このスロットを削除'"
          aria-label="スロット削除"
        >✖</button>
      </div>

      <!-- タイムライン本体 -->
      <div
        class="timeline-root"
        ref="timelineRef"
        @dragover.prevent="onDragOver"
        @drop.prevent="onDrop"
      >
        <!-- timelineInner は固定幅（timelineWidthPx）を採用 -->
        <div class="timeline-inner" :style="{ minWidth: timelineInnerWidth + 'px' }">
          <!-- slot-block-area: absolute 配置された各 block を描画 -->
          <div class="slot-block-area" :style="{ height: slotHeight + 'px' }">
            <div
              v-for="block in localBlocks"
              :key="block.id"
              class="block-body"
              :style="blockBodyStyle(block)"
              @mousedown.prevent="selectBlock(block)"
              :title="block.memberName || '未割当'"
            >
              <div class="label">{{ block.memberName || '未割当' }}</div>

              <div class="size-buttons" aria-hidden="false">
                <button class="op-btn" @click.stop="decrease(block)" aria-label="減らす">-</button>
                <button class="op-btn" @click.stop="increase(block)" aria-label="増やす">+</button>
                <button class="op-btn op-remove" @click.stop="removeBlock(block.id)" aria-label="ブロック削除">✖</button>
              </div>
            </div>
          </div>

          <!-- 時間ルーラー（下段） -->
          <div class="time-ruler" aria-hidden="true">
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
  // 推奨: 親から slotId と blocks を渡す
  slotId: { type: String, required: false },
  blocks: { type: Array, default: null }, // 新しい name: blocks
  // 互換: 古い実装で "slots" や "members" を渡している場合に備える
  slots: { type: Array, default: null },
  members: { type: Array, default: null },

  // timeline params
  startHour: { type: Number, default: 7 },
  endHour: { type: Number, default: 20 },
  unitPer10Min: { type: Number, default: 6 },
  slotHeight: { type: Number, default: 40 },
  pad: { type: String, default: "0.1vw" },

  // identifiers for persisting to store (optional)
  shiftDate: { type: String, required: false },
  teamId: { type: String, required: false },
  positionId: { type: String, required: false },

  // explicit timeline width (px) — 優先適用
  timelineWidthPx: { type: Number, default: null },
});

const emit = defineEmits(["update-slots", "remove-slot"]);
const dragManager = useDragManager();
const store = useShiftStore();

// padding
const cssPad = computed(() => props.pad || "0.1vw");

// timeline width: props.timelineWidthPx 優先、なければ計算（余白 + 右側余裕）
const timelineInnerWidth = computed(() => {
  if (props.timelineWidthPx) return props.timelineWidthPx;
  const hours = Math.max(1, props.endHour - props.startHour);
  const tenMinUnits = hours * 6;
  // 右余白を若干加える
  return tenMinUnits * props.unitPer10Min + 80;
});

const timelineRef = ref(null);
const selectedBlock = ref(null);

// local copy of blocks: 名前の混在に対応して blocks を決定する
const initialBlocks = (() => {
  if (Array.isArray(props.blocks)) return props.blocks;
  if (Array.isArray(props.slots)) return props.slots;
  if (Array.isArray(props.members)) return props.members;
  return [];
})();
const localBlocks = ref((initialBlocks || []).map(b => ({ ...b })));

// hour ticks
const hourArray = computed(() => {
  const arr = [];
  for (let h = props.startHour; h <= props.endHour; h++) arr.push(h);
  return arr;
});

// helpers
function padHour(h){ return String(h).padStart(2,"0"); }
function minutesToHHMM(mins){ const H = Math.floor(mins/60); const M = mins%60; return `${String(H).padStart(2,"0")}:${String(M).padStart(2,"0")}`; }

// block absolute style (left/width in px)
function blockBodyStyle(block){
  const start_min = block.start_min || 0;
  const dur = block.duration_min || 0;
  const minutesFromStart = start_min - props.startHour*60;
  const leftPx = Math.max(0, (minutesFromStart / 10) * props.unitPer10Min);
  const widthPx = Math.max(12, (dur / 10) * props.unitPer10Min);
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

// editing helpers
function increase(block){ block.duration_min = (block.duration_min || 0) + 10; syncUp(); }
function decrease(block){ block.duration_min = Math.max(10, (block.duration_min || 0) - 10); syncUp(); }

function removeBlock(id){
  localBlocks.value = localBlocks.value.filter(b => b.id !== id);
  syncUp();
}

// remove this slot (emit parent to remove slot object from pos.slots)
function removeThisSlot(){
  if (!props.slotId) {
    // safety: nothing to do
    return;
  }
  emit("remove-slot", props.slotId);
}

// select
function selectBlock(block){ selectedBlock.value = block; }

// drag handlers
function onBlockHandleDragStartSlot(e){
  const payload = { slotId: props.slotId, shiftDate: props.shiftDate, teamId: props.teamId, positionId: props.positionId };
  dragManager.startDrag("slotRow", payload, e);
  e.dataTransfer?.setData("application/json", JSON.stringify({ dragType: "slotRow", payload }));
}
function onBlockHandleDragStart(block, e){
  if (!block) return;
  dragManager.startDrag("slotBlock", block, e);
  e.dataTransfer?.setData("application/json", JSON.stringify({ dragType: "slotBlock", payload: block }));
}
function onDragEnd(){ dragManager.clearDrag(); }
function onDragOver(e){ if (e?.dataTransfer) e.dataTransfer.dropEffect = "move"; }

// drop: reposition block or add member block
function onDrop(e){
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
      const idx = localBlocks.value.findIndex(b => b.id === payload.id);
      if (idx !== -1) {
        localBlocks.value[idx].start_min = newStart;
        syncUp();
      }
    } else if (dragType === "member") {
      const block = {
        id: `blk_${Date.now()}`,
        memberId: payload.id || payload.uid || null,
        memberName: payload.name_kanji || payload.name || "メンバー",
        start_min: newStart,
        duration_min: 60,
      };
      localBlocks.value.push(block);
      syncUp();

      // optionally persist into store: use store.assignMemberToSlot if identifiers available
      if (props.shiftDate && props.teamId && props.positionId && props.slotId && store.assignMemberToSlot) {
        store.assignMemberToSlot(props.shiftDate, props.teamId, props.positionId, {
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

// sync to parent: emit { slotId, blocks }
function syncUp(){
  emit("update-slots", { slotId: props.slotId, blocks: localBlocks.value.map(b => ({ ...b })) });
}

// watch incoming props: support blocks / slots / members changes
watch(
  () => [props.blocks, props.slots, props.members],
  () => {
    const src = Array.isArray(props.blocks) ? props.blocks :
                Array.isArray(props.slots) ? props.slots :
                Array.isArray(props.members) ? props.members : [];
    localBlocks.value = (src || []).map(b => ({ ...b }));
  },
  { deep: true }
);
</script>

<style scoped>
.shift-slot-root { width: 100%; box-sizing: border-box; }

/* 行全体：左ツール + timeline */
.slot-row { display: flex; gap: 10px; align-items: flex-start; width: 100%; }

/* 左ツール列 */
.slot-left-tools {
  width: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-top: 6px;
  box-sizing: border-box;
}
.slot-drag-handle {
  font-size: 18px;
  line-height: 1;
  cursor: grab;
  border: none;
  background: transparent;
  padding: 2px 6px;
}
.slot-drag-handle:active { cursor: grabbing; }
.slot-delete-btn {
  font-size: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  background: #fff;
  padding: 4px 6px;
  cursor: pointer;
}

/* timeline root: 横スクロール可（幅固定を親が指定） */
.timeline-root {
  flex: 1;
  overflow-x: auto;
  overflow-y: visible; /* vertical scrollbar should not appear */
  position: relative;
}

/* inner area: absolute blocks placed here */
.timeline-inner {
  position: relative;
  box-sizing: border-box;
  min-height: calc(var(--slot-height, 40px) + 28px); /* block + ruler */
  padding-bottom: 28px; /* space for ruler */
}

/* block area holds absolute children */
.slot-block-area {
  position: relative;
  height: 100%;
}

/* block basics */
.block-body {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
}
.label { padding-right: 8px; font-size: 12px; white-space: nowrap; }

/* size buttons inside block */
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
.op-remove { background: #fff0f0; color: #c53030; border-color: #f5c6cb; }

/* ruler */
.time-ruler { margin-top: 6px; position: absolute; left: 0; bottom: 0; width: 100%; pointer-events: none; }
.ruler-inner { position: relative; height: 28px; }
.hour-mark { position: absolute; top: 0; transform: translateX(-0.5px); text-align: center; }
.h-line { width: 1px; height: 8px; background: #9ca3af; margin: 0 auto; }
.h-label { font-size: 11px; color: #4b5563; margin-top: 4px; }

/* selection info */
.selected-info { margin-top: 6px; font-size: 12px; color: #374151; }
</style>
