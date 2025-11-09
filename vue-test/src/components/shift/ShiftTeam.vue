<template>
  <ShiftContainer :item="team" :list="teams">
    <template #header>
      <input v-model="team.name" class="border rounded p-1 text-sm w-24" />
      <button @click="addPosition" class="bg-blue-500 text-white text-xs px-2 py-1 rounded ml-2">
        ＋ポジション
      </button>
    </template>

    <template #body>
      <ScrollableRow>
        <ShiftPosition
          v-for="position in team.positions"
          :key="position.id"
          :position="position"
          :positions="team.positions"
        />
      </ScrollableRow>
    </template>
  </ShiftContainer>
</template>

<script setup>
import ShiftContainer from "./ShiftContainer.vue";
import ScrollableRow from "../common/ScrollableRow.vue";
import ShiftPosition from "./ShiftPosition.vue";
import { createPosition } from "@/models/shiftModel";

const props = defineProps({
  team: Object,
  teams: Array,
});

const addPosition = () => props.team.positions.push(createPosition());
</script>
