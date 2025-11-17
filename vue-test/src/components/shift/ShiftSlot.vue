<template>
  <div class="shift-slot-root" :style="{ padding: cssPad }">
    <!-- タイムライン本体（縦に積むブロック群） -->
    <div
      class="timeline bg-gray-50 relative"
      ref="timelineRef"
      @dragover.prevent="onDragOver"
      @drop.prevent="onDrop"
      :style="{ width: timelineWidthPx + 'px', minWidth: timelineWidthPx + 'px' }"
    >
      <!-- 各ブロック行（縦積み） -->
      <div
        v-for="(block, idx) in localSlots"
        :key="block.id"
        class="member-block-wrapper"
        :style="{ height: slotHeight + 'px', marginBottom: blockGap + 'px', position: 'relative' }"
      >
        <!-- 左ドラッグ領域（固定幅）と可視化は block-drag-handle の中で行う -->
        <div
          class="block-drag-handle"
          :style="{ left: '0px', top: '0px', height: slotHeight + 'px', width: dragAreaWidth }"
          draggable="true"
          @dragstart.stop="onBlockHandleDragStart(block, $event)"
          @dragend.stop="onDragEnd"
          title="このハンドルでブロックを移動"
        >
          <div class="drag-symbol">⋮</div>
        </div>

        <!-- ブロック本体を絶対配置で left を決める -->
        <div
          class="block-body"
          :style="blockBodyStyle(block)"
          @mousedown.prevent="selectBlock(block, $event)"
        >
          <div class="px-1 truncate text-sm">
            {{ block.memberName || '未割当' }}
          </div>

          <!-- 操作ボタン（絶対配置） -->
          <div class="block-controls">
            <button class="op-btn" @click.stop="decrease(block)" title="短く">-</button>
            <button class="op-btn" @click.stop="increase(block)" title="長く">+</button>
            <button class="op-btn text-red-600" @click.stop="removeBlock(block.id)" title="削除">✖</button>
          </div>
        </div>
      </div>

      <!-- タイムメモリ（下部） -->
      <div class="time-ruler absolute bottom-0 left-0 w-full pointer-events-none">
        <div class="ruler-inner relative" :style="{ width: timelineWidthPx + 'px' }">
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

    <!-- 選択中のブロック情報 -->
    <div v-if="selectedBlock" class="mt-2 text-xs text-gray-700">
      選択: <strong>{{ selectedBlock.memberName || '未割当' }}</strong>
      （開始: {{ minutesToHHMM(selectedBlock.start_min) }} / 長さ: {{ selectedBlock.duration_min }}分）
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useDragManager } from "@/composables/useDragManager";
import { useShiftStore } from "@/stores/shiftStore";

const props = defineProps({
  shiftDate: { type: String, required: false },
  teamId: { type: String, required: false },
  positionId: { type: String, required: false },

  slots: { type: Array, default: () => [] },

  // visual params
  unitPer10Min: { type: Number, default: 6 }, // 10min -> px
  slotHeight: { type: Number, default: 40 },
  startHour: { type: Number, default: 7 },
  endHour: { type: Number, default: 20 },
  blockGap: { type: Number, default: 8 },
  pad: { type: String, default: "0.1vw" },
});

const emit = defineEmits(["update-slots"]);

const dragManager = useDragManager();
const store = useShiftStore();

const timelineRef = ref(null);
const selectedBlock = ref(null);

const cssPad = computed(() => props.pad || "0.1vw");
// drag area width — fixed px for reliability (approx 1vw)
const dragAreaWidth = computed(() => `${Math.max(20, Math.round(window.innerWidth * 0.01))}px`);

// compute timeline width px from startHour/endHour
const timelineWidthPx = computed(() => {
  const hours = props.endHour - props.startHour;
  const tenMinUnits = hours * 6; // 6 units/hour
  return tenMinUnits * props.unitPer10Min;
});

// local copy of slots
const localSlots = ref((props.slots || []).map(s => ({ ...s })));

// hour ticks array
const hourArray = computed(() => {
  const arr = [];
  for (let h = props.startHour; h <= props.endHour; h++) arr.push(h);
  return arr;
});

function minutesToHHMM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function padHour(h) {
  return String(h).padStart(2, "0");
}

// Drag over
function onDragOver(e) {
  e.dataTransfer.dropEffect = "move";
}

// Drop handler (同じ)
function onDrop(e) {
  try {
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;
    const { dragType, payload } = JSON.parse(raw);

    if (dragType === "member") {
      const rect = timelineRef.value.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const tenMinUnitsFromLeft = Math.round(x / props.unitPer10Min);
      const minutesFromStart = tenMinUnitsFromLeft * 10;
      const start_min = props.startHour * 60 + minutesFromStart;

      const block = {
        id: `blk_${Date.now()}`,
        memberId: payload.id || payload.uid || null,
        memberName: payload.name_kanji || payload.name || "メンバー",
        start_min,
        duration_min: 60,
      };

      localSlots.value.push(block);
      emit("update-slots", localSlots.value);

      if (props.shiftDate && props.teamId && props.positionId) {
        store.assignMemberToSlot?.(
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
    }

    if (dragType === "slotBlock") {
      const rect = timelineRef.value.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const tenMinUnitsFromLeft = Math.round(x / props.unitPer10Min);
      const minutesFromStart = tenMinUnitsFromLeft * 10;
      const start_min = props.startHour * 60 + minutesFromStart;

      const idx = localSlots.value.findIndex(b => b.id === payload.id);
      if (idx !== -1) {
        localSlots.value[idx].start_min = start_min;
        emit("update-slots", localSlots.value);
      }
    }
  } catch (err) {
    console.error("ShiftSlot.onDrop parse error:", err);
  }
}

// block style: absolute left/top
function blockBodyStyle(block) {
  const minutesFromStart = block.start_min - props.startHour * 60;
  const leftPx = Math.max(0, (minutesFromStart / 10) * props.unitPer10Min);
  const widthPx = Math.max(10, (block.duration_min / 10) * props.unitPer10Min);

  // leave some left margin to account for drag handle space visually (drag handle sits at x=0)
  const handleOffset = pxValue(dragAreaWidth.value);

  return {
    position: "absolute",
    left: `${leftPx + handleOffset}px`,
    top: `0px`,
    width: `${widthPx}px`,
    height: `${props.slotHeight}px`,
    display: "flex",
    alignItems: "center",
    background: "#fff",
    border: "1px solid #e2e8f0",
    boxSizing: "border-box",
    paddingRight: "60px", // space for controls
    overflow: "visible",
    zIndex: 1,
  };
}

function pxValue(val) {
  if (!val) return 0;
  if (String(val).endsWith("px")) return Number(String(val).replace("px", ""));
  if (String(val).endsWith("vw")) return Math.round((Number(val.replace("vw",""))/100) * window.innerWidth);
  return Number(val) || 0;
}

// duration adjust
function increase(block) {
  block.duration_min = block.duration_min + 10;
  emit("update-slots", localSlots.value);
}
function decrease(block) {
  block.duration_min = Math.max(10, Math.round(block.duration_min / 10) * 10 - 10);
  emit("update-slots", localSlots.value);
}

function removeBlock(id) {
  localSlots.value = localSlots.value.filter(b => b.id !== id);
  emit("update-slots", localSlots.value);
}

function selectBlock(block, ev) {
  selectedBlock.value = block;
}

// drag start for block
function onBlockHandleDragStart(block, e) {
  dragManager.startDrag("slotBlock", block, e);
  if (e?.dataTransfer) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/json", JSON.stringify({ dragType: "slotBlock", payload: block }));
  }
}
function onDragEnd(e) {
  dragManager.clearDrag();
}

// keep local in sync
watch(() => props.slots, (v) => {
  localSlots.value = (v || []).map(s => ({ ...s }));
}, { deep: true });

onMounted(() => {});
onBeforeUnmount(() => {});
</script>

<style scoped>
.shift-slot-root { width: 100%; box-sizing: border-box; }

/* timeline container */
.timeline {
  position: relative;
  box-sizing: border-box;
  padding-bottom: 56px; /* space for bottom ruler */
  overflow-x: visible; /* 親（ShiftContainer）が幅を持つので横スクロールしない */
  overflow-y: auto;
  min-height: 48px;
}

/* wrapper for each block row */
.member-block-wrapper {
  width: 100%;
  box-sizing: border-box;
  position: relative;
}

/* left drag handle inside each row (placed at x=0) */
.block-drag-handle {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
  z-index: 3;
  background: transparent;
  border-right: 1px solid #eee;
}
.block-drag-handle .drag-symbol {
  font-size: 14px;
  color: #666;
  padding-left: 4px;
  padding-right: 4px;
}

/* block body (absolute) */
.block-body {
  position: absolute;
  top: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  box-sizing: border-box;
  overflow: visible;
  z-index: 1;
  display: flex;
  align-items: center;
}

/* controls inside block */
.block-controls {
  position: absolute;
  right: 6px;
  top: 6px;
  display: flex;
  gap: 6px;
  z-index: 5;
  pointer-events: auto;
}
.op-btn {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f3f3f3;
  border: 1px solid #e6e6e6;
  cursor: pointer;
}

/* time ruler */
.time-ruler {
  pointer-events: none;
  bottom: 0;
  left: 0;
}
.ruler-inner {
  position: relative;
  height: 56px;
  box-sizing: border-box;
  padding-top: 4px;
}
.hour-mark {
  position: absolute;
  top: 0;
  transform: translateX(-0.5px);
  text-align: center;
  width: 36px;
}
.hour-mark .h-line {
  background: #cbd5e1;
  width: 1px;
  height: 8px;
  margin: 0 auto;
}
.hour-mark .h-label {
  margin-top: 4px;
  font-size: 10px;
  color: #4b5563;
}

/* ensure controls clickable */
.block-controls button { pointer-events: auto; }

/* responsive tweaks */
@media (min-width:640px) {}
</style>
