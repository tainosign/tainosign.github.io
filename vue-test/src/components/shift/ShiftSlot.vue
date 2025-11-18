<template>
  <div class="shift-slot-root" :style="{ padding: cssPad }">
    <!-- タイムライン本体（縦積み） -->
    <div
      class="timeline bg-gray-50 relative"
      ref="timelineRef"
      @dragover.prevent="onDragOver"
      @drop.prevent="onDrop"
      :style="{ minWidth: timelineWidthPx + 'px' }"
    >
      <!-- 各行（縦積み） -->
      <div
        v-for="(block, idx) in localSlots"
        :key="block.id"
        class="member-block-wrapper"
        :style="{ height: slotHeight + 'px', marginBottom: blockGap + 'px' }"
      >
        <!-- ドラッグハンドル（最前面に修正） -->
        <div
          class="block-drag-handle"
          :style="{ left:'0px', top:'0px', width: dragAreaWidth, height: slotHeight + 'px' }"
          draggable="true"
          @dragstart.stop="onBlockHandleDragStart(block, $event)"
          @dragend.stop="onDragEnd"
          title="ドラッグで移動"
        >
          <div class="drag-symbol">⋮</div>
        </div>

        <!-- ブロック本体 -->
        <div
          class="block-body"
          :style="blockBodyStyle(block)"
          @mousedown.prevent="selectBlock(block)"
        >
          <div class="px-1 truncate text-sm">
            {{ block.memberName || "未割当" }}
          </div>

          <!-- ボタン -->
          <div class="block-controls">
            <button class="op-btn" @click.stop="decrease(block)">-</button>
            <button class="op-btn" @click.stop="increase(block)">+</button>
            <button class="op-btn text-red-600" @click.stop="removeBlock(block.id)">✖</button>
          </div>
        </div>
      </div>

      <!-- 時間メモリ -->
      <div class="time-ruler absolute left-0 bottom-0 w-full pointer-events-none">
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

    <!-- 選択中情報 -->
    <div v-if="selectedBlock" class="mt-2 text-xs">
      選択: <strong>{{ selectedBlock.memberName }}</strong>
      (開始 {{ minutesToHHMM(selectedBlock.start_min) }} / 長さ {{ selectedBlock.duration_min }}分)
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useDragManager } from "@/composables/useDragManager";
import { useShiftStore } from "@/stores/shiftStore";

const props = defineProps({
  slots: { type: Array, default: () => [] },
  unitPer10Min: { type: Number, default: 6 },
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
const dragAreaWidth = computed(() => "24px"); // force visible

const timelineWidthPx = computed(() => {
  const hours = props.endHour - props.startHour;
  return hours * 6 * props.unitPer10Min;
});

const localSlots = ref((props.slots || []).map(s => ({ ...s })));

const hourArray = computed(() => {
  const arr = [];
  for (let h = props.startHour; h <= props.endHour; h++) arr.push(h);
  return arr;
});

function minutesToHHMM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}
function padHour(h) {
  return String(h).padStart(2,"0");
}

function onDragOver(e) { e.dataTransfer.dropEffect = "move"; }

function onDrop(e) {
  const raw = e.dataTransfer.getData("application/json");
  if (!raw) return;
  const { dragType, payload } = JSON.parse(raw);

  const rect = timelineRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const tenMinUnits = Math.round(x / props.unitPer10Min);
  const start_min = props.startHour * 60 + tenMinUnits * 10;

  if (dragType === "member") {
    const block = {
      id: `blk_${Date.now()}`,
      memberId: payload.id,
      memberName: payload.name_kanji || payload.name,
      start_min,
      duration_min: 60,
    };
    localSlots.value.push(block);
    emit("update-slots", localSlots.value);
  }

  if (dragType === "slotBlock") {
    const idx = localSlots.value.findIndex(b => b.id === payload.id);
    if (idx !== -1) {
      localSlots.value[idx].start_min = start_min;
      emit("update-slots", localSlots.value);
    }
  }
}

function blockBodyStyle(block) {
  const minutesFromStart = block.start_min - props.startHour * 60;
  const leftPx = Math.max(0, (minutesFromStart / 10) * props.unitPer10Min);

  return {
    position: "absolute",
    left: `${leftPx}px`,
    top: "0px",
    width: `${(block.duration_min / 10) * props.unitPer10Min}px`,
    height: `${props.slotHeight}px`,
    paddingLeft: dragAreaWidth.value,
    background: "#fff",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
    zIndex: 1,
  };
}

function increase(block) {
  block.duration_min += 10;
  emit("update-slots", localSlots.value);
}
function decrease(block) {
  block.duration_min = Math.max(10, block.duration_min - 10);
  emit("update-slots", localSlots.value);
}
function removeBlock(id) {
  localSlots.value = localSlots.value.filter(b => b.id !== id);
  emit("update-slots", localSlots.value);
}
function selectBlock(block) {
  selectedBlock.value = block;
}

function onBlockHandleDragStart(block, e) {
  dragManager.startDrag("slotBlock", block, e);
  e.dataTransfer.setData("application/json", JSON.stringify({ dragType: "slotBlock", payload: block }));
}
function onDragEnd() {
  dragManager.clearDrag();
}

watch(() => props.slots, v => {
  localSlots.value = (v || []).map(s => ({ ...s }));
}, { deep: true });
</script>

<style scoped>
.shift-slot-root { width:100%; box-sizing:border-box; }

.timeline {
  position:relative;
  padding-bottom:56px;
  overflow-x:hidden; /* 横スクロール禁止 */
  overflow-y:auto;
}

/* 行全体 */
.member-block-wrapper {
  position:relative;
  width:100%;
}

/* ドラッグハンドル（最前面） */
.block-drag-handle {
  position:absolute;
  z-index:10;
  background:#fff;
  border-right:1px solid #ddd;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:grab;
}
.drag-symbol {
  font-size:14px;
  color:#555;
}

/* ブロック本体 */
.block-body {
  position:absolute;
  background:#fff;
  border:1px solid #e2e8f0;
  z-index:1;
}

/* ボタン */
.block-controls {
  position:absolute;
  right:4px;
  top:4px;
  display:flex;
  gap:4px;
  z-index:20;
}
.op-btn {
  border:1px solid #ccc;
  padding:2px 6px;
  font-size:12px;
  border-radius:4px;
  background:#f3f3f3;
  cursor:pointer;
}

/* 時間メモリ */
.hour-mark {
  position:absolute;
  width:36px;
  transform:translateX(-18px);
  text-align:center;
}
.h-line {
  height:8px;
  width:1px;
  background:#ccc;
  margin:0 auto;
}
.h-label {
  font-size:10px;
  margin-top:4px;
}
</style>
