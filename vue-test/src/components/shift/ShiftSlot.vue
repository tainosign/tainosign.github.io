<template>
  <div class="border rounded p-2 bg-white">
    <!-- 時間帯ヘッダ -->
    <div class="flex justify-between items-center mb-2 text-xs text-gray-600">
      <div>{{ startHour }}:00</div>
      <div>{{ endHour }}:00</div>
    </div>

    <!-- タイムライン本体 -->
    <div
      class="relative bg-gray-50 border h-[720px] overflow-hidden"
      ref="timelineRef"
      @dragover.prevent="onDragOver"
      @drop.prevent="onDrop"
    >
      <!-- 10分目盛 -->
      <div
        v-for="(t, i) in timeLabels"
        :key="i"
        :style="{ top: `${(i / (timeLabels.length - 1)) * 100}%` }"
        class="absolute left-1/2 w-full -translate-x-1/2 text-[10px] text-gray-400 pointer-events-none"
      >
        <div class="absolute -left-8 text-xs">{{ t }}</div>
        <div class="h-[1px] bg-gray-200 w-full"></div>
      </div>

      <!-- 割当ブロック -->
      <div
        v-for="block in localSlots"
        :key="block.id"
        class="absolute left-12 right-3 bg-white border rounded shadow-sm p-1 text-xs cursor-move select-none"
        :style="blockStyle(block)"
        draggable="true"
        @dragstart="onDragStart(block, $event)"
        @mousedown.prevent="selectBlock(block, $event)"
      >
        <div class="flex justify-between items-center">
          <div class="font-semibold truncate">{{ block.memberName || "未割当" }}</div>
          <div class="text-[11px] text-gray-500">{{ formatBlockTime(block) }}</div>
        </div>

        <div class="mt-1 flex gap-1">
          <button class="text-xs px-1 py-0.5 border rounded" @click.stop="changeDuration(block, -10)">-10分</button>
          <button class="text-xs px-1 py-0.5 border rounded" @click.stop="changeDuration(block, 10)">+10分</button>
          <button class="text-xs px-1 py-0.5 border rounded text-red-600" @click.stop="removeBlock(block.id)">削除</button>
        </div>
      </div>
    </div>

    <!-- 選択ブロックの情報 -->
    <div v-if="selectedBlock" class="mt-2 text-sm">
      <div>選択中: <strong>{{ selectedBlock.memberName || "未割当" }}</strong></div>
      <div class="text-xs text-gray-600">
        開始: {{ minutesToHHMM(selectedBlock.start_min) }} /
        長さ: {{ selectedBlock.duration_min }}分
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  position: { type: Object, required: true },
  slots: { type: Array, default: () => [] },
});

const emit = defineEmits([
  "update-slots",
  "copy-block",
  "move-block",
]);

const timelineRef = ref(null);
const startHour = 7;
const endHour = 19;
const totalMinutes = (endHour - startHour) * 60;
const gridUnit = 10;

const localSlots = ref((props.slots || []).map(s => ({ ...s })));

const timeLabels = computed(() => {
  const arr = [];
  for (let h = startHour; h <= endHour; h++) {
    arr.push(`${String(h).padStart(2, "0")}:00`);
  }
  return arr;
});

function onDragOver(e) {
  e.dataTransfer.dropEffect = "move";
}

/**
 * Drop時処理：単一・複数メンバーどちらにも対応
 */
function onDrop(e) {
  try {
    const data = JSON.parse(e.dataTransfer.getData("application/json"));
    const members = Array.isArray(data) ? data : [data];
    const rect = timelineRef.value.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const minutesFromTop = Math.round((y / rect.height) * totalMinutes / gridUnit) * gridUnit;
    const start_min = startHour * 60 + minutesFromTop;

    members.forEach((member, idx) => {
      const block = {
        id: `blk_${Date.now()}_${idx}`,
        memberId: member.id || member.uid || null,
        memberName: member.name_kanji || member.name || "メンバー",
        start_min,
        duration_min: 60,
        originDate: member.originDate || null,
        originTeamId: member.originTeamId || null,
        originPositionId: member.originPositionId || null,
      };
      localSlots.value.push(block);
    });
    emit("update-slots", localSlots.value);
  } catch (err) {
    console.error("drop parse error:", err);
  }
}

function onDragStart(block, e) {
  const data = JSON.stringify({
    type: "slot-block",
    ...block,
    originPositionId: props.position.positionId,
  });
  e.dataTransfer.setData("application/json", data);
}

/**
 * 表示上の位置・高さを計算
 */
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
function selectBlock(block) {
  selectedBlock.value = block;
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
/* 高さ720px = 12時間分。10分単位なら1時間=60px相当 */
</style>
