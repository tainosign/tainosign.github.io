<template>
  <ShiftContainer :item="position" :list="positions">
    <template #header>
      <input v-model="position.name" class="border rounded p-1 text-sm" />
    </template>

    <template #body>
      <div v-for="slot in position.slots" :key="slot.id" class="border rounded p-2 mb-1 bg-gray-50">
        <div class="flex justify-between items-center mb-1">
          <span>{{ slot.start }} - {{ slot.end }}</span>
          <button @click="addMember(slot)" class="text-xs bg-blue-200 px-2 rounded">＋メンバー</button>
        </div>
        <div class="flex flex-wrap gap-1">
          <ShiftMember v-for="m in slot.members" :key="m.id" :member="m" />
        </div>
      </div>
    </template>
  </ShiftContainer>
</template>

<script setup>
import ShiftContainer from "./ShiftContainer.vue";
import ShiftMember from "./ShiftMember.vue";
import { createMember } from "@/models/shiftModel";

const props = defineProps({
  position: Object,
  positions: Array,
});

const addMember = (slot) => {
  slot.members.push(createMember());
};
</script>
