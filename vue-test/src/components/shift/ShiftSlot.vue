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
  // 余地があるなら shiftDate/teamId/positionId を渡す（将来的に使う）
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

// Drag Over
function onDragOver(e) {
  e.dataTransfer.dropEffect = "move";
}

// Drop: ここでは dragManager.parseDrop を直接呼ばず、
// このコンポーネント自身が 'member' ハンドラを登録して受ける方針にする
function onDrop(e) {
  // パースして処理（startDrag が JSON をセットしている前提）
  try {
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;
    const { dragType, payload } = JSON.parse(raw);

    if (dragType === "member") {
      // クリックした位置から開始時刻を決める
      const rect = timelineRef.value.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const minutesFromTop = Math.round((y / rect.height) * totalMinutes / gridUnit) * gridUnit;
      const start_min = startHour * 60 + minutesFromTop;

      // 新しい block を作る
      const block = {
        id: `blk_${Date.now()}`,
        memberId: payload.id || payload.uid || null,
        memberName: payload.name_kanji || payload.name || "メンバー",
        start_min,
        duration_min: 60,
      };

      // ローカルに追加して emit
      localSlots.value.push(block);
      emit("update-slots", localSlots.value);

      // store にも反映（存在すれば）
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
  } catch (err) {
    console.error("ShiftSlot.onDrop parse error:", err);
  }
}

// ブロック描画用スタイル
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

// ドラッグ開始（既存ブロックを移動したい場合など）
function onBlockDragStart(block, e) {
  // 現在は簡易的に block の情報を渡す
  dragManager.startDrag("slotBlock", block, e);
}

watch(
  () => props.slots,
  (v) => {
    localSlots.value = (v || []).map((s) => ({ ...s }));
  },
  { deep: true }
);

// --- 登録/解除（将来的に registerHandler を使う場合） ---
onMounted(() => {
  // ここでは registerHandler を使わず、onDrop で直接処理している。
});
onBeforeUnmount(() => {
  // nothing now
});
</script>

<style scoped>
/* 必要なら微調整 */
</style>
