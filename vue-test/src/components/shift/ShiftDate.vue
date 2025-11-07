<!-- src/components/shift/ShiftDate.vue -->
<template>
  <div class="border rounded mb-4 p-2">
    <div class="flex items-center justify-between mb-2">
      <div>
        <span class="font-bold">{{ date }}</span>
        <span class="text-sm text-gray-600">{{ shift.timeRange.start }}〜{{ shift.timeRange.end }}</span>
        <input type="time" v-model="shift.timeRange.start" class="border px-1 py-1 rounded ml-2">
        <input type="time" v-model="shift.timeRange.end" class="border px-1 py-1 rounded ml-1">
      </div>
      <button @click="$emit('delete-date', date)" class="bg-red-500 text-white px-2 rounded">×</button>
    </div>

    <!-- チーム列 -->
    <div class="flex overflow-x-auto" :style="{ minWidth: shift.teams.length * teamMinWidth + 'px' }">
      <ShiftTeam v-for="team in shift.teams"
                 :key="team.id"
                 :team="team"
                 :date="date"
                 @copy-team="$emit('copy-team', date, $event)"
                 @delete-team="$emit('delete-team', date, $event)"
                 @add-position="$emit('add-position', date, $event)" />
    </div>

    <button @click="$emit('add-team', date)" class="mt-2 bg-green-500 text-white px-3 py-1 rounded">
      チーム追加
    </button>
  </div>
</template>

<script setup>
import ShiftTeam from './ShiftTeam.vue'
import { ref } from 'vue'

const props = defineProps({
  date: String,
  shift: Object
})

const teamMinWidth = 120
</script>
