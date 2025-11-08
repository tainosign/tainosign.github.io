<template>
  <ShiftContainer :item="team" :list="teams">
    <template #header>
      <input v-model="team.name" class="border rounded p-1 text-sm w-24" />
    </template>

    <template #body>
      <div class="flex flex-row gap-2 items-start">
        <ShiftPosition
          v-for="position in team.positions"
          :key="position.id"
          :position="position"
          :positions="team.positions"
        />
        <button @click="addPosition" class="bg-blue-500 text-white text-xs px-2 py-1 rounded self-start mt-2">
          ＋ポジション
        </button>
      </div>
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
