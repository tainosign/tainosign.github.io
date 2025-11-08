<template>
  <div class="border-2 border-blue-300 rounded-lg p-3 bg-white min-w-[600px]">
    <div class="flex justify-between items-center mb-2">
      <h3 class="font-semibold text-blue-600">{{ team.name }}</h3>
      <div class="flex gap-2">
        <button @click="addPosition" class="bg-green-500 text-white px-2 py-1 rounded">＋ポジ</button>
        <button @click="$emit('remove')" class="bg-red-500 text-white px-2 py-1 rounded">×</button>
      </div>
    </div>

    <!-- ポジション横並び -->
    <div class="flex flex-row gap-4 overflow-x-auto">
      <ShiftPosition
        v-for="(pos, pIndex) in team.positions"
        :key="pos.id"
        :position="pos"
        @remove="removePosition(pIndex)"
      />
    </div>
  </div>
</template>

<script setup>
import ShiftPosition from "./ShiftPosition.vue";

const props = defineProps({
  team: Object
});

const addPosition = () => {
  props.team.positions.push({
    id: Date.now(),
    name: `ポジ${props.team.positions.length + 1}`,
    slots: [],
  });
};

const removePosition = (index) => {
  props.team.positions.splice(index, 1);
};
</script>
