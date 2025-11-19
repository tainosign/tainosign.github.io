<template>
  <div class="shift-slot-root" :style="{ padding: cssPad }">
    <div class="slot-row">
      <!-- 左固定ツール列 -->
      <div class="slot-left-tools" @mousedown.stop>
        <div
          class="drag-handle"
          draggable="true"
          @dragstart.stop="onRowDragStart"
          @dragend.stop="onDragEnd"
          title="スロット行を移動"
        >⋮</div>

        <button
          class="delete-btn"
          @click.stop="removeThisSlot"
          title="このスロットを削除"
        >✖</button>
      </div>

      <!-- timeline -->
      <div class="timeline-root" ref="timelineRef" @dragover.prevent="onDragOver" @drop.prevent="onDrop">
        <div class="timeline-inner" :style="{ width: timelineInnerWidthPx + 'px' }">
          <!-- blocks are absolutely positioned inside each slot-row area -->
          <div class="slot-block-area" :style="{ height: slotHeight + 'px' }">
            <div
              v-for="block in localSlots"
              :key="block.id"
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

          <!-- ruler at bottom -->
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
    </div>

    <!-- selected info -->
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
  slotId: { type: String, required: false }, // recommend parent passes slot.slotId
  slots: { type: Array, default: () => [] }, // blocks for this slot
  startHour: { type: Number, default: 7 },
  endHour: { type: Number, default: 20 },
  unitPer10Min: { type: Number, default: 6 },
  slotHeight: { type: Number, default: 40 },
  pad: { type: String, default: "0.1vw" },
  shiftDate: { type: String, required: false },
  teamId: { type: String, required: false },
  positionId: { type: String, required: false },
});

const emit = defineEmits(["update-slots", "remove-slot"]);
const dragManager = useDragManager();
const store = useShiftStore();

const cssPad = computed(() => props.pad || "0.1vw");
const timelineRef = ref(null);
const selectedBlock = ref(null);

// timeline width: ensure it covers every hour and has slight right padding so 20:00 label visible
const timelineInnerWidthPx = computed(() => {
  const hours = props.endHour - props.startHour;
  // 1 hour = 6 units of 10min; width = units * unitPer10Min
  const tenMinUnits = hours * 6;
  // add small right padding 24px so final tick & number visible
  return tenMinUnits * props.unitPer10Min + 24;
});

const localSlots = ref((props.slots || []).map(s => ({ ...s })));

// hour ticks
const hourArray = computed(() => {
  const arr = [];
  for (let h = props.startHour; h <= props.endHour; h++) arr.push(h);
  return arr;
});

function padHour(h){ return String(h).padStart(2,"0"); }
function minutesToHHMM(mins){ const h = Math.floor(mins/60); const m = mins%60; return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`; }

function blockBodyStyle(block){
  const minutesFromStart = (block.start_min || (props.startHour * 60)) - props.startHour*60;
  const leftPx = Math.max(0, (minutesFromStart / 10) * props.unitPer10Min);
  const widthPx = Math.max(12, ((block.duration_min || 60) / 10) * props.unitPer10Min);
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
    overflow: "hidden"
  };
}

function increase(block){ block.duration_min = (block.duration_min || 60) + 10; syncUp(); }
function decrease(block){ block.duration_min = Math.max(10, (block.duration_min || 60) - 10); syncUp(); }

function removeBlock(id){ localSlots.value = localSlots.value.filter(b => b.id !== id); syncUp(); }

// remove this entire slot (notify parent by slotId)
function removeThisSlot(){
  // require a slotId to be provided by parent; if not present emit null so parent can decide (but prefer slotId)
  emit("remove-slot", props.slotId || null);
}

// select
function selectBlock(block){ selectedBlock.value = block; }

// row drag (slot-row movement)
function onRowDragStart(e){
  const payload = { slotId: props.slotId, positionId: props.positionId, teamId: props.teamId, date: props.shiftDate };
  dragManager.startDrag("slotRow", payload, e);
  e.dataTransfer?.setData("application/json", JSON.stringify({ dragType: "slotRow", payload }));
}

// block drag start
function onBlockDragStart(block,e){
  dragManager.startDrag("slotBlock", block, e);
  e.dataTransfer?.setData("application/json", JSON.stringify({ dragType: "slotBlock", payload:block }));
}
function onDragEnd(){ dragManager.clearDrag(); }
function onDragOver(e){ if (e?.dataTransfer) e.dataTransfer.dropEffect = "move"; }

// drop handler: reposition or add new member
function onDrop(e){
  try{
    const raw = e.dataTransfer.getData("application/json") || "";
    if (!raw) return;
    const { dragType, payload } = JSON.parse(raw);
    const rect = timelineRef.value.getBoundingClientRect();
    const x = e.clientX - rect.left;
    // compute based on timelineInner left = 0 (we used no left tool inside timeline)
    const tenMinUnitsFromLeft = Math.round(x / props.unitPer10Min);
    const minutesFromStart = tenMinUnitsFromLeft * 10;
    const newStart = props.startHour * 60 + minutesFromStart;

    if (dragType === "slotBlock") {
      const idx = localSlots.value.findIndex(b => b.id === payload.id);
      if (idx !== -1) {
        localSlots.value[idx].start_min = newStart;
        syncUp();
      }
    } else if (dragType === "member") {
      const block = {
        id: `blk_${Date.now()}`,
        memberId: payload.id || payload.uid || null,
        memberName: payload.name_kanji || payload.name || "メンバー",
        start_min: newStart,
        duration_min: 60
      };
      localSlots.value.push(block);
      syncUp();

      // optionally persist to store if full identifiers are known (backwards compat)
      if (props.shiftDate && props.teamId && props.positionId && props.slotId) {
        store.assignMemberToSlot?.(props.shiftDate, props.teamId, props.positionId, {
          id: block.id,
          memberId: block.memberId,
          memberName: block.memberName,
          start_min: block.start_min,
          duration_min: block.duration_min
        });
      }
    }
  }catch(err){
    console.error("ShiftSlot.onDrop error:",err);
  } finally {
    dragManager.clearDrag();
  }
}

// sync up local -> parent (include slotId)
function syncUp(){
  emit("update-slots", { slotId: props.slotId || null, blocks: localSlots.value.map(b => ({ ...b })) });
}

// watch incoming
watch(()=>props.slots, v => {
  localSlots.value = (v || []).map(s => ({ ...s }));
}, { deep: true });
</script>

<style scoped>
.shift-slot-root { width: 100%; box-sizing: border-box; }

/* one slot row: left fixed tools + timeline */
.slot-row { display: flex; gap: 8px; align-items: flex-start; }

/* left tools */
.slot-left-tools {
  width: 40px;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:6px;
  padding-top:6px;
  flex-shrink: 0;
}
.drag-handle { font-size:18px; cursor:grab; }
.drag-handle:active { cursor:grabbing; }
.delete-btn { background:#fff; border:1px solid #e6e6e6; padding:2px 6px; border-radius:4px; cursor:pointer; }

/* timeline area (no vertical scrollbar inside) */
.timeline-root { flex:1; overflow-x: auto; overflow-y: visible; position: relative; }
/* timeline-inner controls actual width (so ticks visible) */
.timeline-inner { position: relative; height: calc(var(--slot-height, 40px) + 36px); box-sizing: border-box; }

/* slot-block-area holds absolute positioned blocks */
.slot-block-area { position: relative; width: 100%; height: 100%; }

/* block body */
.block-body { display:flex; align-items:center; overflow:hidden; box-sizing:border-box; }
.label { padding-right:8px; font-size:12px; white-space:nowrap; }

/* size buttons */
.size-buttons { position:absolute; right:6px; top:6px; display:flex; gap:4px; z-index:50; }
.op-btn { padding:2px 6px; font-size:11px; border-radius:4px; border:1px solid #ddd; background:#f8f8f8; cursor:pointer; }

/* ruler */
.time-ruler { position: relative; margin-top: 6px; }
.ruler-inner { position: relative; height: 28px; }
.hour-mark { position:absolute; top:0; transform:translateX(-0.5px); text-align:center; }
.h-line { width:1px; height:8px; background:#9ca3af; margin:0 auto; }
.h-label { font-size:11px; color:#4b5563; margin-top:4px; }

/* selected info */
.selected-info { margin-top:6px; font-size:12px; color:#374151; }
</style>
