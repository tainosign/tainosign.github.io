<template>
  <div class="shift-slot-root" :style="{ padding: cssPad }">
    <!-- タイトル（任意） -->
    <div class="slot-title text-xs text-gray-600 mb-1">
      タイムライン（{{ padHour(startHour) }}:00〜{{ padHour(endHour) }}:00）
    </div>

    <!-- タイムライン本体（縦に積むブロック群） -->
    <div
      class="timeline bg-gray-50 relative overflow-auto"
      ref="timelineRef"
      @dragover.prevent="onDragOver"
      @drop.prevent="onDrop"
      :style="{ minWidth: timelineWidthPx + 'px' }"
    >
      <!-- 縦に並ぶ各ブロック（配置されたメンバー） -->
      <div
        v-for="(block, idx) in localSlots"
        :key="block.id"
        class="member-block-wrapper"
        :style="{ height: slotHeight + 'px', marginBottom: blockGap + 'px' }"
      >
        <div
          class="member-block flex items-stretch h-full"
          :class="{'bg-white': true, 'shadow-sm': true}"
        >
          <!-- 左ドラッグ領域（1vw幅） -->
          <div
            class="block-drag-handle flex-shrink-0"
            :style="{ width: dragAreaWidth }"
            draggable="true"
            @dragstart.stop="onBlockHandleDragStart(block, $event)"
            @dragend.stop="onDragEnd"
            title="このハンドルでブロックを移動"
          >
            ⋮
          </div>

          <!-- ブロック本体（横長） -->
          <div
            class="block-body flex items-center overflow-hidden relative"
            :style="blockBodyStyle(block)"
            @mousedown.prevent="selectBlock(block, $event)"
          >
            <div class="px-1 truncate text-sm">
              {{ block.memberName || '未割当' }}
            </div>

            <!-- 右端の操作ボタン -->
            <div class="block-controls absolute right-0 top-0 flex gap-1 p-1">
              <button class="op-btn" @click.stop="decrease(block)" title="短く">-</button>
              <button class="op-btn" @click.stop="increase(block)" title="長く">+</button>
              <button class="op-btn text-red-600" @click.stop="removeBlock(block.id)" title="削除">✖</button>
            </div>
          </div>
        </div>
      </div>

      <!-- タイムメモリ（横幅固定、下部に表示するため timeline と同幅） -->
      <div class="time-ruler absolute bottom-0 left-0 w-full pointer-events-none">
        <div class="ruler-inner relative" :style="{ width: timelineWidthPx + 'px' }">
          <!-- 1時間ごとの目盛（線）と数字 -->
          <div
            v-for="h in hourArray"
            :key="h"
            class="hour-mark absolute"
            :style="{ left: ((h - startHour) * 60 / 10 * unitPer10Min) + 'px' }"
          >
            <div class="h-line" :style="{ height: '8px', width: '1px', margin: '0 auto' }"></div>
            <div class="h-label text-[10px] mt-1 text-gray-600">{{ padHour(h) }}</div>
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

  // store の slots 形状に合わせる。localSlots の各要素は { id, memberId, memberName, start_min, duration_min }
  slots: { type: Array, default: () => [] },

  // visual params
  unitPer10Min: { type: Number, default: 6 }, // 10分あたりのpx（=6 => 1時間=36px）
  slotHeight: { type: Number, default: 40 }, // 各ブロック高さ(px)
  startHour: { type: Number, default: 7 },
  endHour: { type: Number, default: 20 },
  blockGap: { type: Number, default: 8 }, // vertical gap between blocks
  pad: { type: String, default: "0.1vw" },
});

const emit = defineEmits(["update-slots"]);

const dragManager = useDragManager();
const store = useShiftStore();

const timelineRef = ref(null);
const selectedBlock = ref(null);

const cssPad = computed(() => props.pad || "0.1vw");
const dragAreaWidth = computed(() => "1vw");

// compute timeline width px from startHour/endHour
const timelineWidthPx = computed(() => {
  const hours = props.endHour - props.startHour;
  // total 10min units = hours * 6 (per hour 6 units of 10min)
  const tenMinUnits = hours * 6;
  return tenMinUnits * props.unitPer10Min;
});

// local copy of slots for immediate UI update
const localSlots = ref((props.slots || []).map(s => ({ ...s })));

// hour ticks array
const hourArray = computed(() => {
  const arr = [];
  for (let h = props.startHour; h <= props.endHour; h++) arr.push(h);
  return arr;
});

// helper: convert minutes to HH:MM
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

// Drop: parse member drop
function onDrop(e) {
  try {
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;
    const { dragType, payload } = JSON.parse(raw);

    // drop member onto timeline -> create new block at x location
    if (dragType === "member") {
      const rect = timelineRef.value.getBoundingClientRect();
      const x = e.clientX - rect.left;
      // convert x to minutes from startHour
      const tenMinUnitsFromLeft = Math.round(x / props.unitPer10Min);
      const minutesFromStart = tenMinUnitsFromLeft * 10;
      const start_min = props.startHour * 60 + minutesFromStart;

      const block = {
        id: `blk_${Date.now()}`,
        memberId: payload.id || payload.uid || null,
        memberName: payload.name_kanji || payload.name || "メンバー",
        start_min,
        duration_min: 60, // default 60min
      };

      localSlots.value.push(block);
      emit("update-slots", localSlots.value);

      // persist to store if shiftDate/teamId/positionId provided
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

    // moving existing block (slotBlock)
    if (dragType === "slotBlock") {
      const rect = timelineRef.value.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const tenMinUnitsFromLeft = Math.round(x / props.unitPer10Min);
      const minutesFromStart = tenMinUnitsFromLeft * 10;
      const start_min = props.startHour * 60 + minutesFromStart;

      // find target block in localSlots (by id)
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

// block style: width by duration, left offset by start_min
function blockBodyStyle(block) {
  const minutesFromStart = block.start_min - props.startHour * 60;
  const leftPx = Math.max(0, (minutesFromStart / 10) * props.unitPer10Min);
  const widthPx = Math.max(10, (block.duration_min / 10) * props.unitPer10Min);
  return {
    width: `${widthPx}px`,
    marginLeft: `${leftPx}px`,
    height: `${props.slotHeight}px`,
    display: "flex",
    alignItems: "center",
    position: "relative",
  };
}

// decrease/increase duration in 10min steps
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

// block drag start (from handle)
function onBlockHandleDragStart(block, e) {
  // use dragManager and native transfer for compatibility
  dragManager.startDrag("slotBlock", block, e);
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("application/json", JSON.stringify({ dragType: "slotBlock", payload: block }));
}
function onBlockDragStart(block, e) {
  // fallback if needed
  onBlockHandleDragStart(block, e);
}
function onDragEnd(e) {
  dragManager.clearDrag();
}

// watch incoming props.slots and keep local in sync
watch(() => props.slots, (v) => {
  localSlots.value = (v || []).map(s => ({ ...s }));
}, { deep: true });

onMounted(() => {
  // optional: register handler if needed
});
onBeforeUnmount(() => {
  // optional cleanup
});
</script>

<style scoped>
.shift-slot-root { width: 100%; box-sizing: border-box; }

/* padding variable usage */
.slot-title { padding-left: 0.1vw; }

/* timeline container */
.timeline {
  position: relative;
  min-height: calc(var(--slot-height, 40px) + 40px); /* allow space for ruler */
  border-radius: 4px;
  box-sizing: border-box;
  padding-bottom: 48px; /* space for bottom ruler and labels */
}

/* wrapper for each block row */
.member-block-wrapper {
  width: 100%;
  box-sizing: border-box;
}

/* block main */
.member-block {
  align-items: stretch;
}

/* left drag handle inside block */
.block-drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
  background: transparent;
  border-right: 1px solid #eee;
  padding-left: 4px;
  padding-right: 4px;
}

/* block body (horizontal width represents time) */
.block-body {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-left: none;
  box-sizing: border-box;
  position: relative;
  overflow: visible;
}

/* controls inside block (absolute at right) */
.block-controls .op-btn {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f3f3f3;
  border: 1px solid #e6e6e6;
}

/* time ruler: absolute bottom element */
.time-ruler {
  pointer-events: none;
  bottom: 0;
}

/* ruler inner uses absolute hour marks */
.ruler-inner {
  position: relative;
  height: 48px;
  box-sizing: border-box;
  padding-top: 4px;
}

/* hour mark positioning */
.hour-mark {
  position: absolute;
  top: 0;
  transform: translateX(-0.5px);
  text-align: center;
  width: 36px; /* optional visual anchor */
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

/* small responsive tweaks */
@media (min-width: 640px) {
  /* nothing special */
}
</style>
