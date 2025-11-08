<template>
  <div class="border-2 border-green-300 rounded-lg p-3 bg-gray-50 min-w-[400px]">
    <div class="flex justify-between items-center mb-2">
      <h4 class="font-medium text-green-700">{{ position.name }}</h4>
      <div class="flex gap-2">
        <button @click="addSlot" class="bg-green-500 text-white px-2 py-1 rounded">＋スロット</button>
        <button @click="$emit('remove')" class="bg-red-500 text-white px-2 py-1 rounded">×</button>
      </div>
    </div>

    <!-- スロット横並び -->
    <div class="flex flex-row gap-3 overflow-x-auto">
      <ShiftSlot
        v-for="(slot, sIndex) in position.slots"
        :key="slot.id"
        :slot="slot"
        @remove="removeSlot(sIndex)"
      />
    </div>
  </div>
</template>

<script setup>
import ShiftSlot from "./ShiftSlot.vue";

const props = defineProps({
  position: Object
});

const addSlot = () => {
  props.position.slots.push({
    id: Date.now(),
    name: `スロ${props.position.slots.length + 1}`,
    duration: 480, // 分単位: 480=8時間
    members: [],
  });
};

const removeSlot = (index) => {
  props.position.slots.splice(index, 1);
};
</script>
