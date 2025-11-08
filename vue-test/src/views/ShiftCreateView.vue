<template>
  <div class="p-4 space-y-4">
    <!-- ✅ 日付選択と追加ボタン -->
    <div class="flex items-center gap-2 mb-4">
      <input
        type="date"
        v-model="selectedDate"
        class="border rounded p-2"
      />
      <button
        @click="addDate"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        日付追加
      </button>
    </div>

    <!-- ✅ 横並びで日付コンポーネントを表示 -->
    <div class="flex flex-row gap-4 overflow-x-auto">
      <ShiftDate
        v-for="dateItem in dates"
        :key="dateItem.id"
        v-model="dateItem.date"
        :dateItem="dateItem"
        @duplicateDate="duplicateDate"
        @removeDate="removeDate"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import ShiftDate from "@/components/shift/ShiftDate.vue"
import { getJSTDateString } from "@/composables/useJST.js"

// ✅ 初期値：今日（日本時間）
const selectedDate = ref(getJSTDateString())

// ✅ 登録済みの日付コンポーネント
const dates = ref([])

// ✅ 日付追加
const addDate = () => {
  if (!selectedDate.value) return
  dates.value.push({
    id: Date.now(),
    date: selectedDate.value,
    locked: false,
    folded: false,
    teams: []
  })
}

// ✅ 日付削除
const removeDate = (item) => {
  dates.value = dates.value.filter((d) => d.id !== item.id)
}

// ✅ 日付複製（＋1日）
const duplicateDate = (item) => {
  const copy = JSON.parse(JSON.stringify(item))
  const newDate = new Date(item.date)
  newDate.setDate(newDate.getDate() + 1) // ✅ 1日加算
  copy.date = newDate.toISOString().slice(0, 10)
  copy.id = Date.now()
  dates.value.push(copy)
}
</script>
