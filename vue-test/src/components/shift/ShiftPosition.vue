<template>
  <ShiftContainer :item="position" :list="[position]" type="position">
    <template #header>
      <div class="flex justify-between items-center mb-1">
        <input
          v-model="positionName"
          class="border rounded px-2 py-1 text-sm w-40"
          placeholder="ポジション名"
        />
        <button
          @click="addSlot"
          class="bg-green-500 text-white text-xs px-2 py-1 rounded"
        >
          ＋スロット
        </button>
      </div>
    </template>

    <template #body>
      <div class="flex flex-row items-start gap-2 overflow-x-auto">
        <!-- 時間目盛り -->
        <div class="flex flex-col text-[10px] text-gray-500 items-end pr-2">
          <div
            v-for="time in timeMarks"
            :key="time"
            class="h-8 leading-8 border-t border-gray-200"
          >
            {{ time }}
          </div>
        </div>

        <!-- スロット（横方向追加） -->
        <div class="flex flex-row gap-2 flex-nowrap">
          <ShiftSlot
            v-for="slot in position.slots"
            :key="slot.slotId"
            :shift-date="shiftDate"
            :team-id="teamId"
            :position-id="position.positionId"
            :slot="slot"
          />
        </div>
      </div>
    </template>
  </ShiftContainer>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import ShiftContainer from "./ShiftContainer.vue";
import ShiftSlot from "./ShiftSlot.vue";
import { useShiftStore } from "@/stores/shiftStore";

const props = defineProps({
  shiftDate: String,
  teamId: String,
  position: Object,
});

const store = useShiftStore();
const positionName = ref(props.position.name || "");

watch(positionName, (v) => {
  props.position.name = v;
});

const addSlot = () => {
  store.addSlot(props.shiftDate, props.teamId, props.position.positionId);
};

// 7:00〜19:00の10分刻みメモリ
const timeMarks = computed(() => {
  const times = [];
  for (let h = 7; h <= 19; h++) {
    for (let m = 0; m < 60; m += 10) {
      if (h === 19 && m > 0) break;
      const hh = h.toString().padStart(2, "0");
      const mm = m.toString().padStart(2, "0");
      times.push(`${hh}:${mm}`);
    }
  }
  return times;
});
</script>
