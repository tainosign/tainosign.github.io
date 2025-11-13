<template>
  <div class="p-2 space-y-2">
    <ShiftContainer :item="shift" :list="[shift]" type="shift">
      <template #header>
        <div class="flex items-center gap-2">
          <span class="font-bold">{{ shift.date }}</span>
          <button
            @click="addTeam(shift.date)"
            class="bg-green-500 text-white text-xs px-2 py-1 rounded"
          >
            ＋チーム
          </button>
        </div>
      </template>

      <template #body>
        <ScrollableRow>
          <ShiftTeam
            v-for="team in shift.teams"
            :key="team.id"
            :shift-date="shift.date"
            :team="team"
          />
        </ScrollableRow>
      </template>
    </ShiftContainer>
  </div>
</template>

<script setup>
import ShiftContainer from "./ShiftContainer.vue";
import ShiftTeam from "./ShiftTeam.vue";
import ScrollableRow from "../common/ScrollableRow.vue";

const props = defineProps({
  shift: Object
});

import { useShiftStore } from "@/stores/shiftStore";
const shiftStore = useShiftStore();

const addTeam = (date) => {
  shiftStore.addTeam(date);
};
</script>
