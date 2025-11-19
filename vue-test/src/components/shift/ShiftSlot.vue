<template>
  <div class="shift-slot-root" :style="{ padding: cssPad }">
    <div class="slot-row">
      <!-- left tools column (slot-level) -->
      <div class="slot-left-tools" @mousedown.stop>
        <div
          class="drag-handle"
          draggable="true"
          @dragstart.stop="onBlockHandleDragStartSlot($event)"
          @dragend.stop="onDragEnd"
          title="スロット行を移動"
        >⋮</div>

        <!-- remove this slot (emit slotId) -->
        <button class="delete-btn" @click.stop="removeThisSlot" title="スロットを削除">✖</button>
      </div>

      <!-- timeline area -->
      <div class="timeline-root" ref="timelineRef" @dragover.prevent="onDragOver" @drop.prevent="onDrop">
        <div class="timeline-inner" :style="{ width: timelineInnerWidth + 'px' }">
          <!-- slot-block-area: holds absolute-positioned blocks -->
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

          <!-- time ruler -->
          <div class="time-ruler">
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
  slotId: { type: String, required: false }, // parent should pass real slotId
  slots: { type: Array, default: () => [] }, // blocks array for this slot
  startHour: { type: Number, default: 7 },
  endHour: { type: Number, default: 20 },
  unitPer10Min: { type: Number, default: 6 },
  slotHeight: { type: Number, default: 40 },
  pad: { type: String, default: "0.1vw" },
  shiftDate: { type: String, required: false },
  teamId: { type: String, required: false },
  positionId: { type: String, required: false },
  timelineWidthPx: { type: Number, default: null }, // prefer explicit width if provided
});

const emit = defineEmits(["update-slots", "remove-slot"]);
const dragManager = useDragManager();
const store = useShiftStore();

const cssPad = computed(() => props.pad || "0.1vw");
const timelineRef = ref(null);
const selectedBlock = ref(null);

// compute timeline width: prefer provided timelineWidthPx, else calculate
const timelineInnerWidth = computed(() => {
  if (props.timelineWidthPx) return props.timelineWidthPx;
  const hours = props.endHour - props.startHour;
  const tenMinUnits = hours * 6;
  return tenMinUnits * props.unitPer10Min + 40; // small right padding
});

// local copy of blocks (so editing doesn't mutate parent array until syncUp)
const localSlots = ref((props.slots || []).map(s => ({ ...s })));

const hourArray = computed(() => {
  const arr = [];
  for (let h = props.startHour; h <= props.endHour; h++) arr.push(h);
  return arr;
});

function padHour(h){ return String(h).padStart(2,"0"); }
function minutesToHHMM(mins){ const h = Math.floor(mins/60); const m = mins%60; return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`; }

// block absolute style
function blockBodyStyle(block){
  const minutesFromStart = (block.start_min || 0) - props.startHour*60;
  const leftPx = Math.max(0, (minutesFromStart / 10) * props.unitPer10Min);
  const widthPx = Math.max(12, ((block.duration_min || 0) / 10) * props.unitPer10Min);
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
  };
}

// edit helpers
function increase(block){ block.duration_min = (block.duration_min || 0) + 10; syncUp(); }
function decrease(block){ block.duration_min = Math.max(10, (block.duration_min || 0) - 10); syncUp(); }

function removeBlock(id){
  localSlots.value = localSlots.value.filter(b => b.id !== id);
  syncUp();
}

// emit "remove-slot" (parent will remove the whole slot from pos.slots)
function removeThisSlot(){
  if (props.slotId) emit("remove-slot", props.slotId);
}

// select
function selectBlock(block){ selectedBlock.value = block; }

// drag handlers
function onBlockHandleDragStartSlot(e){
  // start drag for slot-row (payload: slotId, position etc.)
  const payload = { slotId: props.slotId, shiftDate: props.shiftDate, teamId: props.teamId, positionId: props.positionId };
  dragManager.startDrag("slotRow", payload, e);
  e.dataTransfer?.setData("application/json", JSON.stringify({ dragType: "slotRow", payload }));
}
function onBlockHandleDragStart(block,e){
  if (!block) return;
  dragManager.startDrag("slotBlock", block, e);
  e.dataTransfer?.setData("application/json", JSON.stringify({ dragType: "slotBlock", payload: block }));
}
function onDragEnd(){ dragManager.clearDrag(); }
function onDragOver(e){ if(e?.dataTransfer) e.dataTransfer.dropEffect = "move"; }

// Drop: handle moving existing block or adding a new member block
function onDrop(e){
  try{
    const raw = e.dataTransfer.getData("application/json") || "";
    if(!raw) return;
    const { dragType, payload } = JSON.parse(raw);
    const rect = timelineRef.value.getBoundingClientRect();
    const x = e.clientX - rect.left;
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
        duration_min: 60,
      };
      localSlots.value.push(block);
      syncUp();

      // also persist into store if all identifiers are present (optional)
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
  }catch(err){
    console.error("ShiftSlot.onDrop error:", err);
  } finally {
    dragManager.clearDrag();
  }
}

// sync local -> parent: send { slotId, blocks }
function syncUp(){
  emit("update-slots", { slotId: props.slotId, blocks: localSlots.value.map(b => ({ ...b })) });
}

// keep local in sync with prop updates
watch(()=>props.slots, v => {
  localSlots.value = (v || []).map(s => ({ ...s }));
}, { deep: true });

</script>

<style scoped>
.shift-slot-root { width: 100%; box-sizing: border-box; }

/* row layout */
.slot-row { display:flex; gap:8px; align-items:flex-start; }

/* left tools */
.slot-left-tools { width: 48px; display:flex; flex-direction:column; align-items:center; gap:6px; padding-top:6px; }
.drag-handle { font-size:16px; cursor:grab; }
.drag-handle:active { cursor:grabbing; }
.delete-btn { background:#fff; border:1px solid #e6e6e6; padding:4px 6px; border-radius:4px; cursor:pointer; }

/* timeline */
.timeline-root { flex:1; overflow-x:auto; overflow-y:visible; position:relative; }
.timeline-inner { position:relative; height:100%; min-height: calc(var(--slot-height, 40px) + 36px); box-sizing:border-box; padding-bottom: 28px; }

/* block area */
.slot-block-area { position:relative; height: 100%; }

/* block body basics */
.block-body { display:flex; align-items:center; overflow:hidden; box-sizing:border-box; }
.label { padding-right:8px; font-size:12px; white-space:nowrap; }

/* control buttons */
.size-buttons { position: absolute; right: 6px; top: 6px; display:flex; gap:4px; z-index:50; }
.op-btn { padding:2px 6px; font-size:11px; border-radius:4px; border:1px solid #ddd; background:#f3f3f3; cursor:pointer; }

/* time ruler */
.time-ruler { margin-top:8px; }
.ruler-inner { position:relative; height:28px; }
.hour-mark { position:absolute; top:0; text-align:center; transform:translateX(-0.5px); }
.h-line { width:1px; height:8px; background:#9ca3af; margin:0 auto; }
.h-label { font-size:11px; color:#4b5563; margin-top:4px; }

/* selected info */
.selected-info { margin-top:6px; font-size:12px; color:#374151; }
</style>
