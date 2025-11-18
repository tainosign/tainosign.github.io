<template>
  <div class="shift-slot-root" :style="{ padding: cssPad }">

    <!-- タイムライン全体（横スクロール禁止、ルート幅100%） -->
    <div
      class="timeline bg-gray-50 relative w-full"
      ref="timelineRef"
      @dragover.prevent="onDragOver"
      @drop.prevent="onDrop"
    >

      <!-- ブロック行（縦に積む） -->
      <div
        v-for="block in localSlots"
        :key="block.id"
        class="slot-row"
      >

        <!-- 左ツール（ドラッグ・削除）-->
        <div class="slot-left-tools">
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

        <!-- ブロック本体 -->
        <div
          class="block-body"
          :style="blockBodyStyle(block)"
          @mousedown.prevent="selectBlock(block)"
        >
          <div class="label">{{ block.memberName || "未割当" }}</div>

          <!-- サイズボタン -->
          <div class="size-buttons">
            <button class="op-btn" @click.stop="decrease(block)">-</button>
            <button class="op-btn" @click.stop="increase(block)">+</button>
          </div>
        </div>

      </div>

      <!-- 時間メモリ -->
      <div class="time-ruler w-full">
        <div
          class="ruler-inner relative"
          :style="{ width: timelineWidthPx + 'px' }"
        >
          <div
            v-for="h in hourArray"
            :key="h"
            class="hour-mark"
            :style="{ left: ((h - startHour) * 36) + 'px' }"
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

const props = defineProps({
  slots: Array,
  startHour: { type: Number, default: 7 },
  endHour: { type: Number, default: 20 },
  unitPer10Min: { type: Number, default: 6 }, // 10分6px → 1時間36px
  pad: { type: String, default: "0.1vw" },
});

const emit = defineEmits(["update-slots"]);
const dragManager = useDragManager();

const timelineRef = ref(null);
const selectedBlock = ref(null);

const cssPad = computed(() => props.pad || "0.1vw");

function padHour(h) {
  return String(h).padStart(2, "0");
}

const localSlots = ref((props.slots || []).map(s => ({ ...s })));

/* 時間メモリ用 */
const hourArray = computed(() => {
  const result = [];
  for (let h = props.startHour; h <= props.endHour; h++) result.push(h);
  return result;
});

/* タイムライン内部の幅（12時間=432px） */
const timelineWidthPx = computed(() => {
  return (props.endHour - props.startHour) * 36; // 1h=36px
});

/* ブロックの位置と幅 */
function blockBodyStyle(block) {
  const start = block.start_min - props.startHour * 60;
  const leftPx = (start / 10) * props.unitPer10Min + 32;

  const widthPx = (block.duration_min / 10) * props.unitPer10Min;

  return {
    position: "absolute",
    left: leftPx + "px",
    width: widthPx + "px",
    height: "100%",
    background: "#fff",
    border: "1px solid #bbb",
    borderRadius: "4px",
    boxSizing: "border-box",
    minHeight: "32px",
  };
}

/* + - ボタン */
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

/* ドラッグ関連 */
function onBlockHandleDragStart(block, e) {
  dragManager.startDrag("slotBlock", block, e);
  e.dataTransfer.setData("application/json", JSON.stringify({ dragType: "slotBlock", payload: block }));
}
function onDragEnd() {
  dragManager.clearDrag();
}
function onDragOver(e) {
  e.dataTransfer.dropEffect = "move";
}
function onDrop(e) {
  const data = JSON.parse(e.dataTransfer.getData("application/json") || "{}");
  if (!data.dragType) return;

  const rect = timelineRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left - 32; // 左ツール分

  const tenMinUnit = Math.round(x / props.unitPer10Min);
  const newStart = props.startHour * 60 + tenMinUnit * 10;

  if (data.dragType === "slotBlock") {
    const block = data.payload;
    const t = localSlots.value.find(b => b.id === block.id);
    if (t) {
      t.start_min = newStart;
      emit("update-slots", localSlots.value);
    }
  }
}

watch(
  () => props.slots,
  v => (localSlots.value = (v || []).map(s => ({ ...s }))),
  { deep: true }
);
</script>

<style scoped>
.shift-slot-root {
  width: 100%;
  position: relative;
}

.timeline {
  width: 100%;
  overflow-x: hidden; /* 横スクロール禁止 */
  position: relative;
  padding-bottom: 50px;
}

.slot-row {
  width: 100%;
  position: relative;
  padding-left: 32px; /* 左ツール領域 */
  margin-bottom: 8px;
  min-height: 32px;
}

.slot-left-tools {
  width: 32px;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 4px;
}

.drag-handle {
  cursor: grab;
  font-size: 18px;
  color: #444;
  margin-bottom: 4px;
}

.delete-btn {
  background: #eee;
  border: 1px solid #aaa;
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
}

.block-body {
  position: absolute;
  top: 0;
}

.label {
  padding: 2px 4px;
  font-size: 12px;
  white-space: nowrap;
}

.size-buttons {
  position: absolute;
  top: 2px;
  right: 2px;
  display: flex;
  gap: 3px;
}

.op-btn {
  background: #eee;
  border: 1px solid #aaa;
  padding: 2px 4px;
  font-size: 11px;
  border-radius: 3px;
  cursor: pointer;
}

.time-ruler {
  position: absolute;
  left: 32px;
  bottom: 0;
}

.hour-mark {
  position: absolute;
  text-align: center;
  transform: translateX(-18px);
}

.h-line {
  height: 8px;
  width: 1px;
  background: #666;
  margin: 0 auto;
}

.h-label {
  margin-top: 3px;
  font-size: 10px;
}
</style>
