<!-- src/components/shift/ShiftPosition.vue -->
<template>
  <div class="position-card bg-transparent" :style="{ minWidth: positionMinWidth }">
    <ShiftContainer :item="position" :list="[positionWrapper]" type="position" :maxWidth="positionMaxWidth">
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <input
            v-model="positionName"
            class="border rounded px-2 py-1 text-sm w-40"
            placeholder="ポジション名"
          />
          <div class="flex items-center gap-1">
            <button @click.stop="addSlot" class="bg-green-500 text-white text-xs px-2 py-1 rounded">＋スロット</button>
          </div>
        </div>
      </template>

      <template #body>
        <div class="flex gap-2 items-start">
          <!-- 時刻目盛（左端） -->
          <div class="time-rail text-[10px] text-gray-500 flex flex-col items-end pr-2">
            <div v-for="time in timeMarks" :key="time" class="h-8 leading-8 border-t border-gray-200">{{ time }}</div>
          </div>

          <!-- スロット群（横並び） -->
          <div class="flex gap-2 overflow-x-auto">
            <ShiftSlot
              v-for="slot in position.slots"
              :key="slot.slotId"
              :shift-date="shiftDate"
              :team-id="teamId"
              :position-id="position.positionId"
              :slots="slot.blocks || slot.slots || []"
              :position="position"
            />
          </div>
        </div>
      </template>
    </ShiftContainer>
  </div>
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
  maxWidth: { type: String, default: null },
});

const store = useShiftStore();

const positionWrapper = computed(() => ({ ...props.position, teamId: props.teamId, date: props.shiftDate }));
const positionName = ref(props.position.name || "");
watch(positionName, (v) => {
  props.position.name = v;
});

const addSlot = () => {
  store.addSlot(props.shiftDate, props.teamId, props.position.positionId);
};

// time marks (7:00-19:00 / 10min step)
const timeMarks = computed(() => {
  const arr = [];
  for (let h = 7; h <= 19; h++) {
    for (let m = 0; m < 60; m += 60) { // display on each hour only (visual)
      if (h === 19 && m > 0) break;
      arr.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
    }
  }
  return arr;
});

const positionMaxWidth = computed(() => props.maxWidth ?? "320px");
const positionMinWidth = computed(() => "280px");
</script>

<style scoped>
.position-card {
  box-sizing: border-box;
}
.time-rail { width: 48px; }
</style>
