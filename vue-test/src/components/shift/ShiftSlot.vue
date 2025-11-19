<!-- src/components/shift/ShiftSlot.vue -->
<template>
  <div class="shift-slot-root" :style="{ padding: cssPad }">
    <div class="slot-row">
      <!-- 左ツール列（ドラッグ / 削除） -->
      <div class="slot-left-tools" @mousedown.stop>
        <div
          class="drag-handle"
          draggable="true"
          @dragstart.stop="onBlockHandleDragStartSlot($event)"
          @dragend.stop="onDragEnd"
          title="スロット（行）を移動"
        >⋮</div>

        <!-- このスロット（slot）の削除。親に slotId 指定で伝える -->
        <button class="delete-btn" @click.stop="removeThisSlot" title="このスロットを削除">✖</button>
      </div>

      <!-- タイムライン本体（タイムライン幅は timelineInnerWidthPx） -->
      <div class="timeline-root" ref="timelineRef" @dragover.prevent="onDragOver" @drop.prevent="onDrop">
        <div class="timeline-inner" :style="{ width: timelineInnerWidthPx + 'px' }">
          <!-- ブロックを絶対配置 -->
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

          <!-- 時間ルーラー -->
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
  // ここで期待する props: slots はそのスロット行の blocks 配列（スロット単位）
  slotId: { type: String, required: false }, // 親側の slotId を受け取る（推奨）
  slots: { type: Array, default: () => [] }, // blocks for this slot
  startHour: { type: Number, default: 7 },
  endHour: { type: Number, default: 20 },
  unitPer10Min: { type: Number, default: 6 }, // 10分 -> px
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

// timeline inner width (px) — 固定幅（1時間 = 36px）
const timelineInnerWidthPx = computed(() => {
  const hours = props.endHour - props.startHour;
  // 10min 単位数 = hours * 6; でも 左右ちょっと余白が欲しいのでそのまま unitPer10Min を使う
  return hours * 6 * props.unitPer10Min;
});

// local copy of blocks in this slot
const localSlots = ref((props.slots || []).map(s => ({ ...s })));

// hour ticks
const hourArray = computed(() => {
  const arr = [];
  for (let h = props.startHour; h <= props.endHour; h++) arr.push(h);
  return arr;
});

function padHour(h) { return String(h).padStart(2, "0"); }
function minutesToHHMM(mins){ const h = Math.floor(mins/60); const m = mins%60; return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`; }

// block style (absolute inside timeline-inner)
function blockBodyStyle(block){
  const minutesFromStart = block.start_min - props.startHour*60;
  const leftPx = Math.max(0, (minutesFromStart/10) * props.unitPer10Min);
  const widthPx = Math.max(12, (block.duration_min/10) * props.unitPer10Min);
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

// 増減
function increase(block){ block.duration_min = (block.duration_min || 0) + 10; syncUp(); }
function decrease(block){ block.duration_min = Math.max(10, (block.duration_min || 0) - 10); syncUp(); }

// 削除（この slot の中の一つのブロックを削除）
function removeBlock(id){
  localSlots.value = localSlots.value.filter(b => b.id !== id);
  syncUp();
}

// 親に "この slot 全体を削除したい" を通知（親が pos.slots から削除する）
function removeThisSlot(){
  // emit で親に slotId を伝える
  emit("remove-slot", props.slotId);
}

// 選択
function selectBlock(block){ selectedBlock.value = block; }

// Slot 行ごとのドラッグハンドル（行自体を動かす設計があるなら payload に slotId を含める）
function onBlockHandleDragStartSlot(e){
  const payload = { slotId: props.slotId };
  dragManager.startDrag("slotRow", payload, e);
  e.dataTransfer?.setData("application/json", JSON.stringify({ dragType: "slotRow", payload }));
}
function onBlockHandleDragStart(block,e){
  // block 個別ドラッグ
  dragManager.startDrag("slotBlock", block, e);
  e.dataTransfer?.setData("application/json", JSON.stringify({ dragType: "slotBlock", payload: block }));
}
function onDragEnd(){ dragManager.clearDrag(); }
function onDragOver(e){ e.dataTransfer.dropEffect = "move"; }

// Drop（timeline への drop） — ブロック移動または member のドロップ対応
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
      // 既存 block の移動
      const idx = localSlots.value.findIndex(b => b.id === payload.id);
      if (idx !== -1) {
        localSlots.value[idx].start_min = newStart;
        syncUp();
      }
    } else if (dragType === "member") {
      // 新しい member を追加
      const block = {
        id: `blk_${Date.now()}`,
        memberId: payload.id || payload.uid || null,
        memberName: payload.name_kanji || payload.name || "メンバー",
        start_min: newStart,
        duration_min: 60,
      };
      localSlots.value.push(block);
      syncUp();
      // store にも反映（もし shiftDate/teamId/positionId が渡っているなら）
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

// 親に自分の blocks を通知する（slotId と共に）
function syncUp(){
  emit("update-slots", { slotId: props.slotId, blocks: localSlots.value });
}

// watch props
watch(()=>props.slots, v => {
  localSlots.value = (v || []).map(s => ({ ...s }));
}, { deep: true });

</script>

<style scoped>
.shift-slot-root { width: 100%; box-sizing: border-box; }

/* row: 左ツール + timeline */
.slot-row { display: flex; gap: 8px; align-items: flex-start; }

/* 左ツール */
.slot-left-tools {
  width: 40px;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:6px;
  padding-top:6px;
}
.drag-handle { font-size:16px; cursor:grab; }
.drag-handle:active { cursor:grabbing; }
.delete-btn { background:#fff; border:1px solid #e6e6e6; padding:2px 6px; border-radius:4px; cursor:pointer; }

/* timeline root/inner */
.timeline-root { flex:1; overflow-x: hidden; position: relative; }
.timeline-inner { position: relative; box-sizing: border-box; padding-left: 0px; }

/* slot-block-area holds absolute blocks */
.slot-block-area { position: relative; height: 100%; }

/* block body */
.block-body { display:flex; align-items:center; overflow:hidden; box-sizing:border-box; }
.label { padding-right:8px; font-size:12px; white-space:nowrap; }

/* size buttons */
.size-buttons { position:absolute; right:6px; top:6px; display:flex; gap:4px; z-index:50; }
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
