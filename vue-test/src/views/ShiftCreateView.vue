<template>
  <div class="p-4">
    <!-- 日付追加ボタン -->
    <div class="flex items-center gap-2 mb-4">
      <button @click="addDate" class="bg-blue-500 text-white px-4 py-2 rounded">日付追加</button>
    </div>

    <!-- 日付コンポーネント横並び -->
    <div class="flex flex-row gap-4 overflow-x-auto">
      <ShiftDate
        v-for="date in dates"
        :key="date.id"
        :date="date"
        @removeDate="removeDate"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import ShiftDate from "@/components/shift/ShiftDate.vue"
import { getJSTDateString } from "@/composables/useJST.js"

const dates = ref([
  { id: Date.now(), value: getJSTDateString(), teams: [] }
])

const addDate = () => {
  const newDate = {
    id: Date.now(),
    value: getJSTDateString(),
    teams: []
  }
  dates.value.push(newDate)
}

const removeDate = (date) => {
  dates.value = dates.value.filter(d => d.id !== date.id)
}
</script>
