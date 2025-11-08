<template>
  <ShiftContainer :item="team" :list="teams">
    <template #header>
      <input v-model="team.name" class="border rounded p-1 text-sm" />
    </template>

    <template #body>
      <ShiftPosition
        v-for="pos in team.positions"
        :key="pos.id"
        :position="pos"
        :positions="team.positions"
      />
      <button @click="addPosition" class="bg-blue-500 text-white text-xs px-2 py-1 mt-1 rounded">
        ＋ポジション
      </button>
    </template>
  </ShiftContainer>
</template>

<script setup>
import ShiftContainer from "./ShiftContainer.vue";
import ShiftPosition from "./ShiftPosition.vue";
import { createPosition } from "@/models/shiftModel";

const props = defineProps({
  team: Object,
  teams: Array,
});

const addPosition = () => {
  props.team.positions.push(createPosition());
};
</script>
