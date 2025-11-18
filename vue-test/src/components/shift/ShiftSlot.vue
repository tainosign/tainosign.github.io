<!-- src/components/shift/ShiftSlot.vue -->
<template>
  <div class="shift-slot-root" :style="{ padding: cssPad }">
    <!-- optional title -->
    <div class="slot-title">タイムライン（{{ padHour(startHour) }}:00〜{{ padHour(endHour) }}:00）</div>

    <!-- timeline root: 横幅は timelineInnerWidthPx + leftToolWidth -->
    <div class="timeline-root" ref="timelineRef" @dragover.prevent="onDragOver" @drop.prevent="onDrop">
      <!-- inner area (contains absolute positioned blocks) -->
      <div class="timeline-inner" :style="{ width: timelineInnerWidthPx + 'px' }">
        <!-- for each slot row: relative container so block absolute is inside it -->
        <div
          v-for="(block, idx) in localSlots"
          :key="block.id"
          class="slot-row"
          :style="{ height: slotHeight + 'px', marginBottom: blockGap + 'px' }"
        >
          <!-- left tool column (fixed) -->
          <div class="slot-left-tools" :style="{ width: leftToolWidth + 'px' }">
            <div
              class="drag-handle"
              draggable="true"
              @dragstart.stop="onBlockHandleDragStart(block, $event)"
              @dragend.stop="onDragEnd"
              title="移動ハンドル"
            >⋮</div>

            <button class="delete-btn" @click.stop="removeBlock(block.id)" title="削除">✖</button>
          </div>

          <!-- block area: positioned absolute relative to timeline-inner -->
          <div class="slot-block-area">
            <div
              class="block-body"
              :style="blockBodyStyle(block)"
              @mousedown.prevent="selectBlock(block)"
              :title="block.memberName || '未割当'"
            >
              <div class="label">{{ block.memberName || '未割当' }}</div>

              <div class="size-buttons">
                <button class="op-btn" @click.stop="decrease(block)">-</button>
                <button class="op-btn" @click.stop="increase(block)">+</button>
              </div>
            </div>
          </div>
        </div>

        <!-- time ruler at bottom -->
        <div class="time-ruler">
          <div class="ruler-inner" :style="{ width: timelineInnerWidthPx + 'px' }">
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

    <!-- optional selected info -->
    <div v-if="selectedBlock" class="selected-info">
      選択: <strong>{{ selectedBlock.memberName || '未割当' }}</strong>
      （開始: {{ minutesToHHMM(selectedBlock.start_min) }} / 長さ: {{ selectedBlock.duration_min }}分）
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useDragManager } from "@/composables/useDragManager";

const props = defineProps({
  slots: { type: Array, default: () => [] }, // [{ id, memberName, start_min, duration_min }]
  startHour: { type: Number, default: 7 },
  endHour: { type: Number, default: 20 },
  unitPer10Min: { type: Number, default: 6 }, // 10min -> px (6)
  slotHeight: { type: Number, default: 40 },
  blockGap: { type: Number, default: 8 },
  pad: { type: String, default: "0.1vw" },
});

const emit = defineEmits(["update-slots"]);
const dragManager = useDragManager();

const cssPad = computed(() => props.pad || "0.1vw");

// left tool width (px) - fixed area for drag handle & buttons
const leftToolWidth = 32;

// compute timeline inner width (px) by hours
const timelineInnerWidthPx = computed(() => {
  const hours = props.endHour - props.startHour;
  const tenMinUnits = hours * 6; // 6 ten-min units per hour
  return tenMinUnits * props.unitPer10Min;
});

const localSlots = ref((props.slots || []).map(s => ({ ...s })));
const selectedBlock = ref(null);

const hourArray = computed(() => {
  const arr = [];
  for (let h = props.startHour; h <= props.endHour; h++) arr.push(h);
  return arr;
});

function padHour(h) { return String(h).padStart(2, "0"); }
function minutesToHHMM(mins) {
  const h = Math.floor(mins / 60); const m = mins % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}

// block style: left offset (px) from timeline-left (0), width from duration
function blockBodyStyle(block) {
  const minutesFromStart = block.start_min - props.startHour * 60;
  const leftPx = Math.max(0, (minutesFromStart / 10) * props.unitPer10Min);
  const widthPx = Math.max(12, (block.duration_min / 10) * props.unitPer10Min);
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

// increase/decrease duration by 10min
function increase(block) { block.duration_min = (block.duration_min || 0) + 10; emit("update-slots", localSlots.value); }
function decrease(block) { block.duration_min = Math.max(10, (block.duration_min || 0) - 10); emit("update-slots", localSlots.value); }

function removeBlock(id) { localSlots.value = localSlots.value.filter(b => b.id !== id); emit("update-slots", localSlots.value); }
function selectBlock(block) { selectedBlock.value = block; }

// drag handlers for block
function onBlockHandleDragStart(block, e) {
  dragManager.startDrag("slotBlock", block, e);
  if (e?.dataTransfer) e.dataTransfer.setData("application/json", JSON.stringify({ dragType: "slotBlock", payload: block }));
}
function onDragEnd() { dragManager.clearDrag(); }
function onDragOver(e) { if (e?.dataTransfer) e.dataTransfer.dropEffect = "move"; }

// drop - reposition by x
function onDrop(e) {
  try {
    const raw = e.dataTransfer.getData("application/json") || "";
    if (!raw) return;
    const { dragType, payload } = JSON.parse(raw);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - leftToolWidth; // exclude left tool
    const tenMinUnitsFromLeft = Math.round(x / props.unitPer10Min);
    const minutesFromStart = tenMinUnitsFromLeft * 10;
    const newStart = props.startHour * 60 + minutesFromStart;

    if (dragType === "slotBlock") {
      const idx = localSlots.value.findIndex(b => b.id === payload.id);
      if (idx !== -1) {
        localSlots.value[idx].start_min = newStart;
        emit("update-slots", localSlots.value);
      }
    }

    if (dragType === "member") {
      // dropped new member -> create new block
      const block = {
        id: `blk_${Date.now()}`,
        memberId: payload.id || payload.uid || null,
        memberName: payload.name_kanji || payload.name || "メンバー",
        start_min: newStart,
        duration_min: 60,
      };
      localSlots.value.push(block);
      emit("update-slots", localSlots.value);
    }
  } catch (err) {
    console.error("ShiftSlot.onDrop error:", err);
  } finally {
    dragManager.clearDrag();
  }
}

// keep localSlots in sync with incoming props.slots
watch(() => props.slots, (v) => {
  localSlots.value = (v || []).map(s => ({ ...s }));
}, { deep: true });
</script>

<style scoped>
.shift-slot-root { width: 100%; box-sizing: border-box; }

/* title */
.slot-title { font-size: 12px; color: #4b5563; margin-bottom: 6px; }

/* timeline root: left area for tools + inner timeline */
.timeline-root { width: 100%; overflow-x: hidden; position: relative; }

/* timeline-inner holds absolute blocks and ruler */
.timeline-inner {
  position: relative;
  box-sizing: border-box;
  padding-left: 32px; /* reserve left tool visual (slot-left-tools is absolute positioned) */
}

/* each slot row: relative so block absolute positions are inside timeline-inner */
.slot-row {
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

/* left tools: placed visually to the left inside timeline-inner (absolute) */
.slot-left-tools {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-top: 4px;
  z-index: 30;
}

/* drag handle and delete */
.drag-handle { font-size: 16px; cursor: grab; color: #444; }
.drag-handle:active { cursor: grabbing; }
.delete-btn {
  background: #fff;
  border: 1px solid #e6e6e6;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
}

/* slot-block-area (container for absolute positioned blocks) */
.slot-block-area {
  position: relative;
  height: 0; /* blocks are absolutely positioned with top:0 relative to the slot-row */
}

/* block body styles (see inline style for left/width/height) */
.block-body { display: flex; align-items: center; overflow: hidden; }

/* label inside block */
.label { font-size: 12px; padding-right: 8px; white-space: nowrap; }

/* size buttons */
.size-buttons { position: absolute; right: 6px; top: 6px; display: flex; gap: 4px; z-index: 50; }
.op-btn {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #e6e6e6;
  background: #f3f3f3;
  cursor: pointer;
}

/* time ruler at bottom */
.time-ruler { position: relative; margin-top: 8px; padding-top: 8px; }
.ruler-inner { position: relative; height: 28px; }
.hour-mark { position: absolute; top: 0; transform: translateX(-0.5px); text-align: center; width: 1px; }
.h-line { width: 1px; height: 8px; background: #9ca3af; margin: 0 auto; }
.h-label { font-size: 11px; color: #4b5563; margin-top: 4px; }

/* selected info */
.selected-info { margin-top: 6px; font-size: 12px; color: #374151; }

/* ensure no unintended scrollbars inside slot rows */
.slot-row { overflow: visible; }
</style>
