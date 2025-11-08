<template>
  <div class="p-4">
    <!-- 外側の日付選択と追加ボタン -->
    <div class="flex items-center gap-2 mb-4">
      <select v-model="selectedDate" class="border rounded p-1">
        <option disabled value="">日付を選択</option>
        <option v-for="date in dateOptions" :key="date" :value="date">
          {{ date }}
        </option>
      </select>

      <button
        @click="addDate"
        class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
      >
        日付追加
      </button>
    </div>

    <!-- 横並びで日付コンポーネントを表示 -->
    <div class="flex flex-row gap-4 overflow-x-auto">
      <ShiftDate
        v-for="dateItem in shiftDates"
        :key="dateItem.id"
        :date-item="dateItem"
        @duplicateDate="duplicateDate"
        @removeDate="removeDate"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import ShiftDate from "@/components/shift/ShiftDate.vue"

const selectedDate = ref("")
const shiftDates = ref([])

// サンプル日付（実際はカレンダーAPIや選択範囲でもOK）
const dateOptions = [
  "2025-11-08",
  "2025-11-09",
  "2025-11-10",
  "2025-11-11",
  "2025-11-12",
]

const addDate = () => {
  if (!selectedDate.value) return alert("日付を選択してください。")

  // 既に同じ日付がある場合は追加しない
  if (shiftDates.value.some(d => d.date === selectedDate.value)) {
    return alert("同じ日付はすでに追加されています。")
  }

  const newDate = {
    id: Date.now(),
    date: selectedDate.value,
    locked: false,
    folded: false,
    teams: []
  }

  shiftDates.value.push(newDate)
  selectedDate.value = "" // 追加後にリセット
}

const duplicateDate = (item) => {
  const copy = JSON.parse(JSON.stringify(item))
  copy.id = Date.now()
  shiftDates.value.push(copy)
}

const removeDate = (item) => {
  shiftDates.value = shiftDates.value.filter(d => d.id !== item.id)
}
</script>

<style scoped>
/* 横並びのスクロール表示 */
.flex-row {
  display: flex;
  flex-direction: row;
}
</style>
