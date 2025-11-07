<!-- src/components/shift/ShiftTeam.vue -->
<template>
  <div class="border rounded p-2 mr-2 flex-shrink-0" :style="{ minWidth: teamMinWidth + 'px' }">
    <input type="text" v-model="team.name" class="border px-1 py-1 rounded w-full mb-1">

    <div class="flex space-x-1 mb-2">
      <button @click="$emit('copy-team', team.id)" class="bg-blue-500 text-white px-2 rounded">⇒</button>
      <button @click="$emit('delete-team', team.id)" class="bg-red-500 text-white px-2 rounded">×</button>
    </div>

    <div class="flex flex-col space-y-1">
      <ShiftPosition v-for="pos in team.positions"
                     :key="pos.id"
                     :position="pos"
                     @add-slot="$emit('add-slot', team.id, $event)" />
    </div>

    <button @click="$emit('add-position', team.id)" class="mt-2 bg-purple-500 text-white px-2 py-1 rounded text-sm">
      ポジション追加
    </button>
  </div>
</template>

<script setup>
import ShiftPosition from './ShiftPosition.vue'

const props = defineProps({
  team: Object,
  date: String
})

const teamMinWidth = 120
</script>
