<template>
  <div class="p-4 space-y-4">
    <button @click="addDate" class="bg-indigo-500 text-white px-4 py-2 rounded">＋ 日付追加</button>

    <draggable v-model="dates" handle=".drag-handle" item-key="id" class="space-y-4">
      <template #item="{ element }">
        <ShiftDate
          :date="element"
          @remove="removeDate(element.id)"
          @add-team="addTeam"
        />
      </template>
    </draggable>
  </div>
</template>

<script setup>
import { ref } from "vue"
import draggable from "vuedraggable"
import ShiftDate from "@/components/shift/ShiftDate.vue"

const dates = ref([])

const addDate = () => {
  dates.value.push({
    id: Date.now(),
    date: new Date().toISOString().slice(0, 10),
    teams: [],
    locked: false,
    folded: false
  })
}

const removeDate = (id) => {
  dates.value = dates.value.filter(d => d.id !== id)
}

const addTeam = (date) => {
  date.teams.push({
    id: Date.now(),
    name: "新チーム",
    positions: [],
    locked: false,
    folded: false
  })
}
</script>
