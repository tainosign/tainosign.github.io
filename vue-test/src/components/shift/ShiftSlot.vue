<!-- src/components/shift/ShiftSlot.vue -->
<template>
  <div class="border rounded p-1 bg-white relative">
    <!-- 小さなツールバー -->
    <div class="flex justify-end gap-1 mb-1">
      <button class="text-[10px] bg-gray-100 px-1 py-0.5 rounded">…</button>
      <button class="text-[10px] bg-gray-100 px-1 py-0.5 rounded">📄</button>
      <button class="text-[10px] bg-red-100 px-1 py-0.5 rounded">✖</button>
    </div>

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
        <!-- 左端時間バッジ -->
        <div class="absolute -left-10 top-0 text-[9px] text-gray-600 px-0.5" :style="{ transform: 'translateY(4px)' }">
          {{ minutesToHHMM(block.start_min) }}
        </div>

        <div class="flex justify-between items-center pl-1">
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
  slots: { type: Array, default: () => [] }, // expected to be array of block objects
});
const emit = defineEmits(["update-slots"]);

const dragManager = useDragManager();
const store = useShiftStore();

const timelineRef = ref(null);
const startHour = 7;
const endHour = 19;
const totalMinutes = (endHour - startHour) * 60;
const gridUnit = 10;
const localSlots = ref((props.slots || []).map((s) => ({ ...s })));

// 時刻ラベル
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

function onDragOver(e) {
  e.dataTransfer.dropEffect = "move";
}

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

    // slotBlock（既にあるブロックの移動）等の処理も later
  } catch (err) {
    console.error("ShiftSlot.onDrop parse error:", err);
  }
}

function blockStyle(block) {
  const topRatio = (block.start_min - startHour * 60) / totalMinutes;
  const heightRatio = block.duration_min / totalMinutes;
  return {
    top: `${Math.max(0, topRatio * 100)}%`,
    height: `${Math.max(2, heightRatio * 100)}%`,
  };
}

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

function changeDuration(block, delta) {
  block.duration_min = Math.max(gridUnit, Math.round((block.duration_min + delta) / gridUnit) * gridUnit);
  emit("update-slots", localSlots.value);
}

function removeBlock(id) {
  localSlots.value = localSlots.value.filter((b) => b.id !== id);
  emit("update-slots", localSlots.value);
}

const selectedBlock = ref(null);
function selectBlock(block, ev) {
  selectedBlock.value = block;
}

function onBlockDragStart(block, e) {
  dragManager.startDrag("slotBlock", { block, from: { shiftDate: props.shiftDate, teamId: props.teamId, positionId: props.positionId } }, e);
}

watch(
  () => props.slots,
  (v) => {
    localSlots.value = (v || []).map((s) => ({ ...s }));
  },
  { deep: true }
);
</script>

<style scoped>
/* 微調整あればここで */
</style>
