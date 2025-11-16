<!-- src/components/shift/ShiftSlot.vue -->
<template>
  <div class="slot-card border rounded p-1 bg-white relative" :style="{ minWidth: slotMinWidth }">
    <!-- ヘッダ：タイトル + 操作（ドラッグはメンバー側で） -->
    <div class="flex items-center justify-between mb-1">
      <div class="text-xs font-semibold">タイムライン（7:00〜19:00）</div>
      <div class="flex items-center gap-1">
        <!-- 小さな操作群（タイムライン上でもコピー/削除など） -->
        <button @click.stop="onCopy" class="text-[10px] bg-gray-100 px-1 py-0.5 rounded">📄</button>
        <button @click.stop="onClear" class="text-[10px] bg-red-100 px-1 py-0.5 rounded">✖</button>
      </div>
    </div>

    <div
      class="relative bg-gray-50 border h-[600px] overflow-y-auto overflow-x-hidden"
      ref="timelineRef"
      @dragover.prevent="onDragOver"
      @drop.prevent="onDrop"
    >
      <!-- 時刻目盛（左端、絶対配置） -->
      <div class="absolute left-0 top-0 bottom-0 w-12 flex flex-col">
        <div v-for="(t,i) in hourMarks" :key="i" class="h-12 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-end pr-1">
          {{ t }}
        </div>
      </div>

      <!-- スロットブロック（配置済みメンバー） -->
      <div
        v-for="block in localSlots"
        :key="block.id"
        class="absolute bg-white border rounded p-1 text-[10px] cursor-move select-none shadow-sm"
        :style="blockStyle(block)"
        draggable="true"
        @dragstart.stop="onBlockDragStart(block, $event)"
        @mousedown.prevent="selectBlock(block, $event)"
      >
        <div class="flex justify-between items-center gap-2">
          <div class="truncate">{{ block.memberName || '未割当' }}</div>
          <div class="text-[9px] text-gray-500">{{ minutesToHHMM(block.start_min) }}</div>
        </div>

        <div class="flex justify-between mt-1">
          <button class="text-[9px] px-1 border rounded" @click.stop="changeDuration(block, -10)">-</button>
          <button class="text-[9px] px-1 border rounded" @click.stop="changeDuration(block, 10)">+</button>
          <button class="text-[9px] px-1 border rounded text-red-600" @click.stop="removeBlock(block.id)">✖</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useDragManager } from "@/composables/useDragManager";
import { useShiftStore } from "@/stores/shiftStore";

const props = defineProps({
  shiftDate: { type: String, required: false },
  teamId: { type: String, required: false },
  positionId: { type: String, required: false },
  position: { type: Object, default: () => ({}) },
  slots: { type: Array, default: () => [] },
});

const emit = defineEmits(["update-slots"]);
const dragManager = useDragManager();
const store = useShiftStore();

const timelineRef = ref(null);
const startHour = 7;
const endHour = 19;
const totalMinutes = (endHour - startHour) * 60;
const gridUnit = 10;
const localSlots = ref((props.slots || []).map(s => ({ ...s })));

// hour marks for left column
const hourMarks = computed(() => {
  const arr = [];
  for (let h = startHour; h <= endHour; h++) {
    arr.push(String(h).padStart(2,"0") + ":00");
  }
  return arr;
});

function onDragOver(e) { e.dataTransfer.dropEffect = "move"; }

function onDrop(e) {
  try {
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;
    const { dragType, payload } = JSON.parse(raw);

    if (dragType === "member") {
      const rect = timelineRef.value.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const minutesFromTop = Math.round((y / rect.height) * totalMinutes / gridUnit) * gridUnit;
      const start_min = startHour * 60 + minutesFromTop;
      const block = {
        id: `blk_${Date.now()}`,
        memberId: payload.id || payload.uid || null,
        memberName: payload.name_kanji || payload.name || "メンバー",
        start_min,
        duration_min: 60,
      };
      localSlots.value.push(block);
      emit("update-slots", localSlots.value);

      // store 反映
      if (props.shiftDate && props.teamId && props.positionId) {
        store.assignMemberToSlot(props.shiftDate, props.teamId, props.positionId, {
          id: block.id,
          memberId: block.memberId,
          memberName: block.memberName,
          start_min: block.start_min,
          duration_min: block.duration_min,
        });
      }
    } else if (dragType === "slotBlock") {
      // 移動された既存ブロック： payload に元情報があるはず
      // シンプルな実装：既存 block を新位置に追加して old を消す（store 更新は省略）
      const rect = timelineRef.value.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const minutesFromTop = Math.round((y / rect.height) * totalMinutes / gridUnit) * gridUnit;
      const start_min = startHour * 60 + minutesFromTop;
      const newBlock = { ...payload, id: `blk_${Date.now()}`, start_min };
      localSlots.value.push(newBlock);
      emit("update-slots", localSlots.value);
    }
  } catch (err) {
    console.error("ShiftSlot.onDrop parse error:", err);
  }
}

function blockStyle(block) {
  const topRatio = (block.start_min - startHour * 60) / totalMinutes;
  const heightRatio = block.duration_min / totalMinutes;
  const top = Math.max(0, topRatio * 100);
  const height = Math.max(2, heightRatio * 100);
  // left offset to consider left time rail (48px) + small padding
  return {
    left: `56px`,
    top: `${top}%`,
    height: `${height}%`,
    right: `8px`,
  };
}

function minutesToHHMM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}

function formatBlockTime(block) {
  const start = minutesToHHMM(block.start_min);
  const end = minutesToHHMM(block.start_min + block.duration_min);
  return `${start}〜${end}`;
}

function changeDuration(block, delta) {
  block.duration_min = Math.max(gridUnit, Math.round((block.duration_min + delta) / gridUnit) * gridUnit);
  emit("update-slots", localSlots.value);
}

function removeBlock(id) {
  localSlots.value = localSlots.value.filter(b => b.id !== id);
  emit("update-slots", localSlots.value);
}

const selectedBlock = ref(null);
function selectBlock(block, ev) { selectedBlock.value = block; }

// ドラッグ開始（既存ブロックを移動）
function onBlockDragStart(block, e) {
  dragManager.startDrag("slotBlock", block, e);
}

// ヘッダ操作
function onCopy() {
  // 簡易コピー: 現在の localSlots を複製して追加
  const clones = localSlots.value.map(s => ({ ...s, id: `blk_${Date.now()}_${Math.random().toString(36).slice(2,6)}` }));
  localSlots.value.push(...clones);
  emit("update-slots", localSlots.value);
}
function onClear() {
  localSlots.value = [];
  emit("update-slots", localSlots.value);
}

watch(() => props.slots, (v) => {
  localSlots.value = (v || []).map(s => ({ ...s }));
}, { deep: true });

const slotMinWidth = "320px";
</script>

<style scoped>
.slot-card {
  box-sizing: border-box;
}
/* スロット上の時間はブロック右に出すのではなく左端の rail で表示するため、ブロックは left を 56px に設定 */
</style>
