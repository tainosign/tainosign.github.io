<template>
  <div class="border-2 border-gray-600 rounded-md p-3 bg-white shadow-sm min-w-[220px]">
    <!-- ✅ 日付行 -->
    <div class="flex items-center gap-2 mb-2">
      <input
        type="date"
        v-model="dateItem.date"
        class="border rounded p-1 text-sm"
      />
      <button @click="$emit('duplicateDate', dateItem)" class="text-blue-500 font-bold">⇒</button>
      <button @click="$emit('removeDate', dateItem)" class="text-red-500 font-bold">×</button>
    </div>

    <!-- ✅ チーム一覧 -->
    <div class="flex flex-col gap-2">
      <ShiftTeam
        v-for="team in dateItem.teams"
        :key="team.id"
        :team="team"
      />
      <button
        @click="addTeam"
        class="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
      >
        ＋チーム追加
      </button>
    </div>
  </div>
</template>

<script setup>
import ShiftTeam from "./ShiftTeam.vue"

const props = defineProps({
  dateItem: Object
})

// ✅ チーム追加
const addTeam = () => {
  props.dateItem.teams.push({
    id: Date.now(),
    name: "新チーム",
    locked: false,
    folded: false,
    positions: []
  })
}
</script>
