<template>
  <ShiftItemWrapper
    :item="dateItem"
    :label="formattedDate"
    @duplicate="$emit('duplicateDate', dateItem)"
    @remove="$emit('removeDate', dateItem)"
  >
    <!-- チーム追加ボタン -->
    <div class="mb-2">
      <button
        @click="addTeam"
        class="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-sm"
      >
        チーム追加
      </button>
    </div>

    <!-- 横並びのチーム -->
    <div class="flex flex-row gap-2 overflow-x-auto">
      <ShiftTeam
        v-for="team in dateItem.teams"
        :key="team.id"
        :team="team"
        @duplicateTeam="duplicateTeam"
        @removeTeam="removeTeam"
      />
    </div>
  </ShiftItemWrapper>
</template>

<script setup>
import ShiftItemWrapper from "@/components/shift/ShiftItemWrapper.vue"
import ShiftTeam from "@/components/shift/ShiftTeam.vue"
import { computed } from "vue"

const props = defineProps({
  dateItem: Object
})
const emit = defineEmits(["duplicateDate", "removeDate"])

// 日付のフォーマット（例：2025-11-08 → 2025/11/08）
const formattedDate = computed(() => {
  if (!props.dateItem.date) return "日付未設定"
  const d = new Date(props.dateItem.date)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate()
  ).padStart(2, "0")}`
})

// ✅ チーム追加
const addTeam = () => {
  props.dateItem.teams.push({
    id: Date.now(),
    name: `チーム${props.dateItem.teams.length + 1}`,
    locked: false,
    folded: false,
    positions: []
  })
}

// ✅ チーム削除
const removeTeam = (team) => {
  props.dateItem.teams = props.dateItem.teams.filter((t) => t.id !== team.id)
}

// ✅ チーム複製
const duplicateTeam = (team) => {
  const copy = JSON.parse(JSON.stringify(team))
  copy.id = Date.now()
  props.dateItem.teams.push(copy)
}
</script>

<style scoped>
.flex-row {
  display: flex;
  flex-direction: row;
}
</style>
