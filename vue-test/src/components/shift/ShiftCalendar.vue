<!-- src/components/shift/ShiftCalendar.vue -->
<template>
  <div class="flex items-center space-x-2 mb-4">
    <input type="date" v-model="selectedDate" class="border px-2 py-1 rounded">
    <button @click="addDateHandler" class="bg-green-500 text-white px-3 py-1 rounded">日付追加</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { addDate, shifts } from '@/composables/useShift.js'

const selectedDate = ref('')

function addDateHandler() {
  if (!selectedDate.value) return
  addDate(selectedDate.value)
  selectedDate.value = ''
}
</script>
