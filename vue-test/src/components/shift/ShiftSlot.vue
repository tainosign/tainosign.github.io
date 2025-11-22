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
        <div
          class="timeline-inner"
          :style="{ width: `${timelineInnerWidth}px` }"
        >
          <!-- ブロック配置領域 -->
          <div
            class="slot-block-area"
            :style="{ height: `${slotHeight}px` }"
          >
            <div
              v-for="block in localBlocks"
              :key="block.id"
              class="block-body"
              :style="blockStyle(block)"
              @mousedown.prevent="selectBlock(block)"
            >
              <div class="block-label">
                {{ block.memberName || '未割当' }}
              </div>

              <div class="size-buttons">
                <button
                  class="op-btn"
                  @click.stop="decrease(block)"
                >-</button>

                <button
                  class="op-btn"
                  @click.stop="increase(block)"
                >+</button>
              </div>
            </div>
          </div>

          <!-- 時間目盛 -->
          <div class="time-ruler">
            <div
              class="ruler-inner"
              :style="{ width: `${timelineInnerWidth}px` }"
            >
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

    <!-- 選択中ブロック情報 -->
    <div
      v-if="selectedBlock"
      class="selected-info"
    >
      選択: <strong>{{ selectedBlock.memberName || "未割当" }}</strong>
      （開始: {{ minutesToHHMM(selectedBlock.start_min) }}
      / 長さ: {{ selectedBlock.duration_min }}分）
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useShiftStore } from "@/stores/shiftStore";
import { useDragManager } from "@/composables/useDragManager";

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
  timelineWidthPx: { type: Number, default: null }
});

const emit = defineEmits(["update-slots", "remove-slot"]);
const timelineRef = ref(null);
const dragManager = useDragManager();
const store = useShiftStore();

const cssPad = computed(() => props.pad);

const localBlocks = ref(props.blocks.map(b => ({ ...b })));
const selectedBlock = ref(null);

const timelineInnerWidth = computed(() => {
  if (props.timelineWidthPx !== null) return props.timelineWidthPx;

  const hours = props.endHour - props.startHour;
  const units10 = (hours * 60) / 10;
  return units10 * props.unitPer10Min + 20;
});

const hourArray = computed(() => {
  const arr = [];
  for (let h = props.startHour; h <= props.endHour; h++) arr.push(h);
  return arr;
});

function padHour(h) {
  return String(h).padStart(2, "0");
}

function minutesToHHMM(m) {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function blockStyle(block) {
  const mins = (block.start_min || 0) - props.startHour * 60;
  const left = Math.max(0, (mins / 10) * props.unitPer10Min);
  const width = Math.max(12, ((block.duration_min || 0) / 10) * props.unitPer10Min);

  return {
    position: "absolute",
    left: `${left}px`,
    top: "0px",
    width: `${width}px`,
    height: `${props.slotHeight}px`,
    background: "#fff",
    border: "1px solid #cbd5e1",
    borderRadius: "4px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    paddingLeft: "6px",
    paddingRight: "6px"
  };
}

function onRemoveSlot() {
  emit("remove-slot", props.slotId);
}

function selectBlock(b) {
  selectedBlock.value = b;
}

function increase(block) {
  block.duration_min += 10;
  syncToParent();
}
function decrease(block) {
  block.duration_min = Math.max(10, block.duration_min - 10);
  syncToParent();
}

function onHandleRowDragStart(e) {
  dragManager.startDrag("slotRow", {
    slotId: props.slotId,
    date: props.shiftDate,
    teamId: props.teamId,
    positionId: props.positionId
  });
  e.dataTransfer?.setData("application/json", JSON.stringify({ dragType: "slotRow" }));
}
function onDragEnd() {
  dragManager.clearDrag();
}

function onDragOver(e) {
  e.dataTransfer.dropEffect = "move";
}

function onDrop(e) {
  dragManager.clearDrag();
}

function syncToParent() {
  emit("update-slots", {
    slotId: props.slotId,
    blocks: localBlocks.value.map(b => ({ ...b }))
  });
}

watch(
  () => props.blocks,
  v => {
    localBlocks.value = v.map(b => ({ ...b }));
  },
  { deep: true }
);
</script>

<style scoped>
.shift-slot-root { width: 100%; }
.slot-row { display: flex; gap: 8px; }
.slot-left-tools {
  width: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-top: 4px;
}
.drag-handle { cursor: grab; }
.delete-btn {
  border: 1px solid #ccc;
  background: #fff;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
}
.timeline-root {
  flex: 1;
  overflow-x: auto;
  position: relative;
}
.timeline-inner {
  position: relative;
  padding-bottom: 24px;
}
.slot-block-area { position: relative; }
.block-body { position: absolute; display: flex; align-items: center; }
.block-label { font-size: 12px; }
.size-buttons {
  position: absolute;
  right: 4px;
  top: 4px;
  display: flex;
  gap: 4px;
}
.op-btn {
  padding: 2px 5px;
  font-size: 10px;
  border: 1px solid #ddd;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
}
.time-ruler { margin-top: 6px; }
.ruler-inner { position: relative; height: 28px; }
.hour-mark { position: absolute; width: 1px; }
.h-line { background: #999; height: 6px; width: 1px; margin: auto; }
.h-label { font-size: 11px; text-align: center; }
.selected-info { margin-top: 6px; font-size: 12px; }
</style>
