<template>
  <div class="p-2" :style="{ padding: cssPad }">
    <ShiftContainer
      :item="shift"
      :list="[ { date: shift.date } ]"
      type="shift"
      :timelineWidthPx="timelineWidthPx"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <span class="font-bold">{{ shift.date }}</span>
          <button @click="addTeam" class="bg-green-500 text-white text-xs px-2 py-1 rounded">＋チーム</button>
        </div>
      </template>

      <template #body>
        <!-- チームを縦に積む -->
        <div class="flex flex-col gap-2">
          <ShiftTeam
            v-for="team in shift.teams"
            :key="team.id"
            :shift-date="shift.date"
            :team="team"
            :timelineWidthPx="timelineWidthPx"
            :unitPer10Min="unitPer10Min"
            @update-shift="emitUpdate"
          />
        </div>
      </template>
    </ShiftContainer>
  </div>
</template>

<script setup>
import { computed } from "vue";
import ShiftContainer from "./ShiftContainer.vue";
import ShiftTeam from "./ShiftTeam.vue";
import { useShiftStore } from "@/stores/shiftStore";

const props = defineProps({
  shift: { type: Object, required: true },
  unitPer10Min: { type: Number, default: 6 }, // 10分あたりpx
  startHour: { type: Number, default: 7 },
  endHour: { type: Number, default: 20 },
});

const emit = defineEmits(["update-shift"]);
const store = useShiftStore();

const totalMinutes = computed(() => (props.endHour - props.startHour) * 60);
const stepsCount = computed(() => totalMinutes.value / 10);
const timelineWidthPx = computed(() => Math.max(stepsCount.value * props.unitPer10Min, 320));

const cssPad = computed(() => `calc(var(--pad, 0.1vw))`);

const addTeam = () => {
  store.addTeam(props.shift.date);
  emit("update-shift");
};

const emitUpdate = () => {
  emit("update-shift");
};
</script>

<style scoped>
/* minimal */
</style>
