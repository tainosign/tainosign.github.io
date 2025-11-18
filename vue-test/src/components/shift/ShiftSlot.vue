<template>
  <div class="shift-slot-root" :style="{ padding: cssPad }">

    <!-- タイムライン本体（横スクロール禁止 & 幅100%） -->
    <div
      class="timeline bg-gray-50 relative w-full"
      ref="timelineRef"
      @dragover.prevent="onDragOver"
      @drop.prevent="onDrop"
    >

      <!-- 各行（縦積み） -->
      <div
        v-for="(block, idx) in localSlots"
        :key="block.id"
        class="slot-row"
        :style="{ height: slotHeight + 'px' }"
      >

        <!-- 左端のドラッグハンドル & 削除ボタン -->
        <div class="slot-left-tools" :style="{ height: slotHeight + 'px' }">
          <div
            class="drag-handle"
            draggable="true"
            @dragstart.stop="onBlockHandleDragStart(block, $event)"
            @dragend.stop="onDragEnd"
          >
            ⋮
          </div>

          <button class="delete-btn" @click.stop="removeBlock(block.id)">✖</button>
        </div>

        <!-- ブロック本体（絶対配置） -->
        <div
          class="block-body"
          :style="blockBodyStyle(block)"
          @mousedown.prevent="selectBlock(block)"
        >
          <div class="px-1 truncate text-sm">
            {{ block.memberName || "未割当" }}
          </div>

          <!-- + - ボタン（右上固定） -->
          <div class="size-buttons">
            <button class="op-btn" @click.stop="decrease(block)">-</button>
            <button class="op-btn" @click.stop="increase(block)">+</button>
          </div>
        </div>
      </div>

      <!-- 時間メモリ -->
      <div class="time-ruler w-full">
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

  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useDragManager } from "@/composables/useDragManager";
import { useShiftStore } from "@/stores/shiftStore";

const props = defineProps({
  slots: Array,
  unitPer10Min: { type: Number, default: 6 }, // 10分あたり6px → 1時間36px
  slotHeight: { type: Number, default: 40 },
  startHour: { type: Number, default: 7 },
  endHour: { type: Number, default: 20 },
  pad: { type: String, default: "0.1vw" }
});

const emit = defineEmits(["update-slots"]);

const dragManager = useDragManager();
const store = useShiftStore();

const timelineRef = ref(null);
const selectedBlock = ref(null);

const cssPad = computed(() => props.pad || "0.1vw");

/* タイムライン幅（常に固定で100%表示するため、overflow-x:hidden にする） */
const timelineWidthPx = computed(() => {
  const hours = props.endHour - props.startHour;
  return hours * 60 / 10 * props.unitPer10Min;
});

const localSlots = ref((props.slots || []).map(s => ({ ...s })));

/* 時間配列 */
const hourArray = computed(() => {
  const arr = [];
  for (let h = props.startHour; h <= props.endHour; h++) arr.push(h);
  return arr;
});

/* 位置計算 */
function blockBodyStyle(block) {
  const minutesFromStart = block.start_min - props.startHour * 60;
  const leftPx = Math.max(0, (minutesFromStart / 10) * props.unitPer10Min);

  return {
    position: "absolute",
    left: `${leftPx}px`,
    width: `${(block.duration_min / 10) * props.unitPer10Min}px`,
    height: `${props.slotHeight}px`,
    top: "0",
    background: "#fff",
    border: "1px solid #e2e8f0",
    boxSizing: "border-box"
  };
}

/* +- ボタン */
function increase(block) {
  block.duration_min += 10;
  emit("update-slots", localSlots.value);
}
function decrease(block) {
  block.duration_min = Math.max(10, block.duration_min - 10);
  emit("update-slots", localSlots.value);
}

/* 削除 */
function removeBlock(id) {
  localSlots.value = localSlots.value.filter(b => b.id !== id);
  emit("update-slots", localSlots.value);
}

function selectBlock(block) {
  selectedBlock.value = block;
}

/* ドラッグハンドル */
function onBlockHandleDragStart(block, e) {
  dragManager.startDrag("slotBlock", block, e);
  e.dataTransfer.setData(
    "application/json",
    JSON.stringify({ dragType: "slotBlock", payload: block })
  );
}
function onDragEnd() {
  dragManager.clearDrag();
}

/* ドロップ */
function onDragOver(e) {
  e.dataTransfer.dropEffect = "move";
}

function onDrop(e) {
  const data = JSON.parse(e.dataTransfer.getData("application/json") || "{}");
  if (!data.dragType) return;

  const rect = timelineRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const tenMinUnits = Math.round(x / props.unitPer10Min);
  const start_min = props.startHour * 60 + tenMinUnits * 10;

  if (data.dragType === "slotBlock") {
    const block = data.payload;
    const target = localSlots.value.find(b => b.id === block.id);
    if (target) {
      target.start_min = start_min;
      emit("update-slots", localSlots.value);
    }
  }
}

watch(
  () => props.slots,
  v => {
    localSlots.value = (v || []).map(s => ({ ...s }));
  },
  { deep: true }
);
</script>

<style scoped>
.shift-slot-root {
  width: 100%;
}

/* タイムライン（横スクロール禁止） */
.timeline {
  position: relative;
  width: 100%;
  overflow-x: hidden;
  padding-bottom: 50px;
}

/* 行全体 */
.slot-row {
  width: 100%;
  position: relative;
  margin-bottom: 8px;
}

/* 左端ツール */
.slot-left-tools {
  width: 32px;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* ドラッグハンドル */
.drag-handle {
  cursor: grab;
  font-size: 18px;
  color: #555;
  margin-bottom: 4px;
}

/* 削除ボタン */
.delete-btn {
  background: #f3f3f3;
  border: 1px solid #ccc;
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
}

/* ブロック本体 */
.block-body {
  position: absolute;
  left: 32px;
}

/* +- ボタン右上 */
.size-buttons {
  position: absolute;
  right: 2px;
  top: 2px;
  display: flex;
  gap: 4px;
}

.op-btn {
  background: #eee;
  border: 1px solid #ccc;
  padding: 2px 4px;
  font-size: 11px;
  border-radius: 3px;
}

/* 時間メモリ */
.time-ruler {
  position: absolute;
  bottom: 0;
  left: 32px;
}

.hour-mark {
  position: absolute;
  transform: translateX(-18px);
  text-align: center;
}
.h-line {
  width: 1px;
  height: 8px;
  background: #777;
  margin: 0 auto;
}
.h-label {
  font-size: 10px;
  margin-top: 4px;
}
</style>
