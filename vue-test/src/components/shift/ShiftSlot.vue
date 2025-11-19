<template>
  <div class="shift-slot-root" :style="{ padding: cssPad }">

    <!-- 1スロット全体を横並びにする -->
    <div class="slot-row">
      
      <!-- 左固定ツール部（常に表示される） -->
      <div class="slot-left-tools">
        <div
          class="drag-handle"
          draggable="true"
          @dragstart.stop="onBlockHandleDragStart(firstBlock, $event)"
          @dragend.stop="onDragEnd"
          title="移動"
        >⋮</div>

        <button
          class="delete-btn"
          @click.stop="removeBlock(firstBlock?.id)"
          title="削除"
        >✖</button>
      </div>

      <!-- タイムライン本体 -->
      <div
        class="timeline-root"
        ref="timelineRef"
        @dragover.prevent="onDragOver"
        @drop.prevent="onDrop"
      >
        <div class="timeline-inner" :style="{ width: timelineInnerWidthPx + 'px' }">

          <!-- block absolute container -->
          <div class="slot-block-area">
            <div
              v-for="block in localSlots"
              :key="block.id"
              class="block-body"
              :style="blockBodyStyle(block)"
              @mousedown.prevent="selectBlock(block)"
            >
              <div class="label">{{ block.memberName || '未割当' }}</div>

              <div class="size-buttons">
                <button class="op-btn" @click.stop="decrease(block)">-</button>
                <button class="op-btn" @click.stop="increase(block)">+</button>
              </div>
            </div>
          </div>

          <!-- 時間目盛 -->
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

    <!-- 選択情報 -->
    <div v-if="selectedBlock" class="selected-info">
      選択:
      <strong>{{ selectedBlock.memberName || '未割当' }}</strong>
      （開始: {{ minutesToHHMM(selectedBlock.start_min) }} / {{ selectedBlock.duration_min }}分）
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useDragManager } from "@/composables/useDragManager";

const props = defineProps({
  slots: { type: Array, default: () => [] },
  startHour: { type: Number, default: 7 },
  endHour: { type: Number, default: 20 },
  unitPer10Min: { type: Number, default: 6 },
  slotHeight: { type: Number, default: 40 },
  pad: { type: String, default: "0.1vw" }
});
const emit = defineEmits(["update-slots"]);

const dragManager = useDragManager();
const cssPad = computed(() => props.pad);

const leftToolWidth = 32;

const timelineInnerWidthPx = computed(() => {
  const hours = props.endHour - props.startHour;
  return hours * 6 * props.unitPer10Min;
});

const localSlots = ref(props.slots.map(s => ({ ...s })));
const selectedBlock = ref(null);

const firstBlock = computed(() => localSlots.value[0] || null);

const hourArray = computed(() => {
  const arr = [];
  for (let h = props.startHour; h <= props.endHour; h++) arr.push(h);
  return arr;
});

function padHour(h){ return String(h).padStart(2,"0"); }
function minutesToHHMM(mins){
  const h = Math.floor(mins/60);
  const m = mins%60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}

function blockBodyStyle(block){
  const minutesFromStart = block.start_min - props.startHour*60;
  const leftPx = Math.max(0,(minutesFromStart/10)*props.unitPer10Min);
  const widthPx = Math.max(12,(block.duration_min/10)*props.unitPer10Min);

  return {
    position:"absolute",
    left:`${leftPx}px`,
    width:`${widthPx}px`,
    height:`${props.slotHeight}px`,
    top:"0px",
    background:"#fff",
    border:"1px solid #cbd5e1",
    borderRadius:"4px",
    display:"flex",
    alignItems:"center",
    paddingLeft:"6px",
    paddingRight:"6px",
    boxSizing:"border-box",
    zIndex:10
  };
}

function increase(block){
  block.duration_min += 10;
  emit("update-slots", localSlots.value);
}
function decrease(block){
  block.duration_min = Math.max(10, block.duration_min - 10);
  emit("update-slots", localSlots.value);
}

function removeBlock(id){
  localSlots.value = localSlots.value.filter(b => b.id !== id);
  emit("update-slots", localSlots.value);
}

function selectBlock(block){ selectedBlock.value = block; }

function onBlockHandleDragStart(block,e){
  if(!block)return;
  dragManager.startDrag("slotBlock",block,e);
  e.dataTransfer?.setData("application/json",JSON.stringify({dragType:"slotBlock",payload:block}));
}
function onDragEnd(){ dragManager.clearDrag(); }
function onDragOver(e){ e.dataTransfer.dropEffect = "move"; }

function onDrop(e){
  const raw = e.dataTransfer.getData("application/json");
  if(!raw)return;

  const {dragType,payload}=JSON.parse(raw);

  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;

  const ten = Math.round(x/props.unitPer10Min);
  const newStart = props.startHour*60 + ten*10;

  if(dragType==="slotBlock"){
    const idx = localSlots.value.findIndex(b=>b.id===payload.id);
    if(idx!==-1){
      localSlots.value[idx].start_min = newStart;
      emit("update-slots", localSlots.value);
    }
  }
}

watch(()=>props.slots,(v)=>{
  localSlots.value = (v||[]).map(s=>({...s}));
},{deep:true});
</script>

<style scoped>
.shift-slot-root { width: 100%; }

.slot-row {
  display: flex;
  gap: 4px;
  width: 100%;
  align-items: flex-start;
}

/* 左固定ツール部分 */
.slot-left-tools {
  width: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-top: 4px;
}

.drag-handle {
  cursor: grab;
  font-size: 18px;
}
.drag-handle:active {
  cursor: grabbing;
}

.delete-btn {
  font-size: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  padding: 2px 4px;
  cursor: pointer;
}

/* タイムライン */
.timeline-root {
  flex: 1;
  overflow-x: hidden;
  position: relative;
}

.timeline-inner {
  position: relative;
  height: 100%;
}

/* ブロック配置 */
.slot-block-area {
  position: relative;
  width: 100%;
  height: 40px;
}

/* ラベル */
.label {
  font-size: 12px;
  white-space: nowrap;
  padding-right: 8px;
}

/* 伸縮ボタン */
.size-buttons {
  position: absolute;
  right: 6px;
  top: 6px;
  display: flex;
  gap: 4px;
  z-index: 50;
}
.op-btn {
  padding: 2px 6px;
  font-size: 11px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f8f8f8;
  cursor: pointer;
}

/* 時刻目盛 */
.time-ruler { margin-top: 4px; }
.ruler-inner { position: relative; height: 24px; }
.hour-mark { position: absolute; top: 0; text-align: center; }
.h-line { width: 1px; height: 8px; background: #999; margin: 0 auto; }
.h-label { font-size: 11px; color: #555; }
</style>
