<template>
  <ShiftContainer :item="slot" :list="slots">
    <template #header>
      <input
        v-model="slot.name"
        class="border rounded p-1 text-sm w-24"
        placeholder="スロット名"
      />
    </template>

    <template #body>
      <div
        class="relative border h-[840px] bg-gray-50 overflow-hidden rounded"
        @dragover.prevent
        @drop="handleDrop"
      >
        <!-- 時間目盛 -->
        <div
          v-for="(t, i) in timeLabels"
          :key="i"
          class="absolute left-0 right-0 border-t border-gray-300 text-[10px] text-gray-500"
          :style="{ top: `${(i / (timeLabels.length - 1)) * 100}%` }"
        >
          <span class="absolute left-1 -top-2">{{ t }}</span>
        </div>

        <!-- メンバー描画 -->
        <div
          v-for="m in localMembers"
          :key="m.id"
          class="absolute left-8 w-[120px] bg-white border rounded shadow text-xs p-1 cursor-pointer hover:bg-blue-50"
          :style="{
            top: `${m.top}px`,
            height: `${m.height}px`,
          }"
        >
          <div class="font-semibold">{{ m.name_kanji }}</div>
          <div class="text-gray-500">{{ m.realtime_status }}</div>
        </div>
      </div>
    </template>
  </ShiftContainer>
</template>

<script setup>
import { ref, computed } from "vue";
import ShiftContainer from "./ShiftContainer.vue";
import { useShiftStore } from "@/stores/shiftStore";

const props = defineProps({
  slot: Object,
  slots: Array,
});

const shiftStore = useShiftStore();
const localMembers = ref([]);

const timeLabels = computed(() => {
  const arr = [];
  for (let h = 6; h <= 20; h++) arr.push(`${String(h).padStart(2, "0")}:00`);
  return arr;
});

const pixelsPer10Min = 840 / (14 * 6);

function handleDrop(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const y = e.clientY - rect.top;
  const member = JSON.parse(e.dataTransfer.getData("application/json"));
  const startMinutes = Math.floor(y / pixelsPer10Min) * 10 + 6 * 60;
  const hours = Math.floor(startMinutes / 60);
  const minutes = startMinutes % 60;
  const startTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  const newMember = {
    ...member,
    top: y,
    height: pixelsPer10Min * 6,
    realtime_status: "配置済み",
    position_start_time: startTime,
  };

  localMembers.value.push(newMember);
  console.log(`メンバー ${member.name_kanji} を ${startTime} に配置`);
}
</script>
