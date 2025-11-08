<template>
  <div class="p-4 space-y-4">
<!-- 日付追加ボタン -->
<button @click="addDate">日付追加</button>

<div class="flex flex-row gap-4 mt-4">
  <ShiftDate
    v-for="(date, index) in dates"
    :key="date.id"
    :date="date"
    @remove="removeDate(date)"
  />
</div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import draggable from "vuedraggable"
import ShiftDate from "@/components/shift/ShiftDate.vue"

const dates = ref([
  { id: 1, value: getJSTDateString(), teams: [] }
]);

const addDate = () => {
  const newDate = { id: Date.now(), value: '', teams: [] };
  dates.value.push(newDate); // flex-row で横並び
}
const removeDate = (date) => {
  dates.value = dates.value.filter(d => d.id !== date.id)
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
