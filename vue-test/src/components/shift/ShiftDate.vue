<template>
  <div class="border rounded-lg p-3 shadow-md bg-gray-50 min-w-[700px]">
    <div class="flex justify-between items-center mb-2">
      <h2 class="text-lg font-bold">{{ date.date }}</h2>
      <div class="flex gap-2">
        <button @click="addTeam" class="bg-green-500 text-white px-2 py-1 rounded">＋チーム</button>
        <button @click="$emit('remove')" class="bg-red-500 text-white px-2 py-1 rounded">×</button>
      </div>
    </div>

    <!-- チーム横並び -->
    <div class="flex flex-row gap-4 overflow-x-auto">
      <ShiftTeam
        v-for="(team, tIndex) in date.teams"
        :key="team.id"
        :team="team"
        @remove="removeTeam(tIndex)"
      />
    </div>
  </div>
</template>

<script setup>
import ShiftTeam from "./ShiftTeam.vue";

const props = defineProps({
  date: Object
});

const addTeam = () => {
  props.date.teams.push({
    id: Date.now(),
    name: `チーム${props.date.teams.length + 1}`,
    positions: [],
  });
};

const removeTeam = (index) => {
  props.date.teams.splice(index, 1);
};
</script>
