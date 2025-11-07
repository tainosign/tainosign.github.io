<!-- src/components/shift/ShiftPosition.vue -->
<template>
  <div class="border p-1 rounded">
    <input type="text" v-model="position.name" class="border px-1 py-1 rounded w-full mb-1">

    <div class="flex space-x-1">
      <ShiftSlot v-for="slot in position.slots" :key="slot.id" :slot="slot" />
    </div>

    <button @click="$emit('add-slot', position.id)" class="mt-1 bg-indigo-500 text-white px-1 py-1 rounded text-xs">
      スロット追加
    </button>
  </div>
</template>

<script setup>
import ShiftSlot from './ShiftSlot.vue'

const props = defineProps({
  position: Object
})
</script>
