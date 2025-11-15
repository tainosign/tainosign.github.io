<!-- src/components/shift/ShiftSlot.vue -->
<template>
  <div class="border rounded p-1 bg-white relative">
    <div class="text-[10px] text-gray-600 font-semibold mb-0.5 text-center">
      タイムライン（7:00〜19:00）
    </div>

    <div
      class="relative bg-gray-50 border h-[600px] overflow-y-auto overflow-x-hidden"
      ref="timelineRef"
      @dragover.prevent="onDragOver"
      @drop.prevent="onDrop"
    >
      <!-- 10分ごとの目盛 -->
      <div
        v-for="(t, i) in timeLabels"
        :key="i"
        :style="{ top: `${(i / (timeLabels.length - 1)) * 100}%` }"
        class="absolute left-0 w-full text-[9px] text-gray-400 select-none"
      >
        <div
          class="absolute -left-10 w-8 text-right pr-1 text-[9px] text-gray-500"
          :style="{ transform: 'translateY(-50%)' }"
        >
          {{ t }}
        </div>
        <div
          class="h-[1px]"
          :class="t.endsWith(':00') ? 'bg-gray-400' : 'bg-gray-200'"
          style="width: calc(100% - 32px); margin-left: 32px;"
        ></div>
      </div>

      <!-- スロットブロック（配置済みメンバー） -->
      <div
        v-for="block in localSlots"
        :key="block.id"
        class="absolute left-12 right-2 bg-white border rounded p-0.5 text-[10px] cursor-move select-none shadow-sm"
        :style="blockStyle(block)"
        draggable="true"
        @dragstart="onBlockDragStart(block, $event)"
        @mousedown.prevent="selectBlock(block, $event)"
      >
        <div class="flex justify-between items-center">
          <div class="truncate">{{ block.memberName || '未割当' }}</div>
          <div class="text-[9px] text-gray-500">{{ formatBlockTime(block) }}</div>
        </div>
        <div class="flex justify-between mt-0.5">
          <button class="text-[9px] px-1 border rounded" @click.stop="changeDuration(block, -10)">-</button>
          <button class="text-[9px] px-1 border rounded" @click.stop="changeDuration(block, 10)">+</button>
          <button class="text-[9px] px-1 border rounded text-red-600" @click.stop="removeBlock(block.id)">✖</button>
        </div>
      </div>
    </div>

    <div v-if="selectedBlock" class="mt-1 text-[10px]">
      <div>選択中: <strong>{{ selectedBlock.memberName || '未割当' }}</strong></div>
      <div class="text-gray-600">
        開始: {{ minutesToHHMM(selectedBlock.start_min) }} /
        長さ: {{ selectedBlock.duration_min }}分
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useDragManager } from "@/composables/useDragManager";
import { useShiftStore } from "@/stores/shiftStore";

const props = defineProps({
  shiftDate: { type: String, required: false },
  teamId: { type: String, required: false },
  positionId: { type: String, required: false },
  position: Object,
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

// local copy
const localSlots = ref((props.slots || []).map((s) => ({ ...s })));

// 時刻ラベル生成
const timeLabels = computed(() => {
  const arr = [];
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += gridUnit) {
      if (h === endHour && m > 0) break;
      arr.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return arr;
});

/* ------------------------------
   Drag Over
------------------------------ */
function onDragOver(e) {
  e.dataTransfer.dropEffect = "move";
}

/* ------------------------------
   Drop 処理
------------------------------ */
function onDrop(e) {
  try {
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    const { dragType, payload } = JSON.parse(raw);

    // ① メンバーのドロップ
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

      if (props.shiftDate && props.teamId && props.positionId) {
        store.assignMemberToSlot?.(
          props.shiftDate,
          props.teamId,
          props.positionId,
          block
        );
      }
    }

    // ② 既存ブロック(slotBlock) のドラッグ移動は今後必要なら追加可能
  } catch (err) {
    console.error("ShiftSlot.onDrop parse error:", err);
  }
}

/* ------------------------------
   block のスタイル
------------------------------ */
function blockStyle(block) {
  const topRatio = (block.start_min - startHour * 60) / totalMinutes;
  const heightRatio = block.duration_min / totalMinutes;
  return {
    top: `${Math.max(0, topRatio * 100)}%`,
    height: `${Math.max(2, heightRatio * 100)}%`,
  };
}

/* ------------------------------
   時刻表示
------------------------------ */
function minutesToHHMM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function formatBlockTime(block) {
  const start = minutesToHHMM(block.start_min);
  const end = minutesToHHMM(block.start_min + block.duration_min);
  return `${start}〜${end}`;
}

/* ------------------------------
   block 操作
------------------------------ */
function changeDuration(block, delta) {
  block.duration_min = Math.max(
    gridUnit,
    Math.round((block.duration_min + delta) / gridUnit) * gridUnit
  );
  emit("update-slots", localSlots.value);
}
function removeBlock(id) {
  localSlots.value = localSlots.value.filter((b) => b.id !== id);
  emit("update-slots", localSlots.value);
}

const selectedBlock = ref(null);
function selectBlock(block, e) {
  selectedBlock.value = block;
}

/* ------------------------------
   block のドラッグ開始
------------------------------ */
function onBlockDragStart(block, e) {
  dragManager.startDrag("slotBlock", block, e);
}

/* ------------------------------
   props.slots の変更監視
------------------------------ */
watch(
  () => props.slots,
  (v) => {
    localSlots.value = (v || []).map((s) => ({ ...s }));
  },
  { deep: true }
);

onMounted(() => {});
onBeforeUnmount(() => {});
</script>

<style scoped>
/* 必要なら調整 */
</style>
