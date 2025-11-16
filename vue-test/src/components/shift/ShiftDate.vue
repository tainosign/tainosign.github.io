<template>
  <div class="p-2 space-y-2 w-full">
    <ShiftContainer
      :item="shift"
      :list="[shift]"
      type="shift"
    >
      <!-- ===========================
           Header Slot（上部ヘッダ）
      ============================ -->
      <template #header>
        <div class="flex items-center justify-between w-full">
          <span class="font-bold text-base">
            {{ shift.date }}
          </span>

          <!-- クリック障害を防ぐため pointer-events-auto -->
          <button
            @click.stop="addTeam(shift.date)"
            class="bg-green-500 text-white text-xs px-2 py-1 rounded pointer-events-auto"
          >
            ＋チーム
          </button>
        </div>
      </template>

      <!-- ===========================
           Body Slot（内容）
      ============================ -->
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
  shift: {
    type: Object,
    required: true
  }
});

import { useShiftStore } from "@/stores/shiftStore";
const shiftStore = useShiftStore();

const addTeam = (date) => {
  shiftStore.addTeam(date);
};
</script>
