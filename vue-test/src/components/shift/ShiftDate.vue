<template>
  <ShiftContainer :item="shift" :list="shifts">
    <template #header>
      <input type="date" v-model="shift.date" class="border rounded p-1 text-sm" />
    </template>

    <template #body>
      <ShiftTeam v-for="team in shift.teams" :key="team.id" :team="team" :teams="shift.teams" />
      <button @click="addTeam" class="bg-green-500 text-white text-xs px-2 py-1 mt-1 rounded">
        ＋チーム
      </button>
    </template>
  </ShiftContainer>
</template>

<script setup>
import ShiftContainer from "./ShiftContainer.vue";
import ShiftTeam from "./ShiftTeam.vue";
import { createTeam } from "@/models/shiftModel";

const props = defineProps({
  shift: Object,
  shifts: Array,
});

const addTeam = () => {
  props.shift.teams.push(createTeam());
};
</script>
