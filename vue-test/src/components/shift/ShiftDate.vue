<template>
  <div class="border-2 border-gray-600 rounded-md p-3 bg-white shadow-sm min-w-[300px]">
    <!-- ✅ 日付 -->
    <div class="flex items-center gap-2 mb-2">
      <input type="date" v-model="dateItem.date" class="border rounded p-1 text-sm" />
      <button @click="$emit('duplicateDate', dateItem)" class="text-blue-500 font-bold">⇒</button>
      <button @click="$emit('removeDate', dateItem)" class="text-red-500 font-bold">×</button>
    </div>

    <!-- ✅ チーム一覧（横並び） -->
    <div class="flex flex-row gap-3 overflow-x-auto pb-2">
      <ShiftTeam
        v-for="team in dateItem.teams"
        :key="team.id"
        :team="team"
        @duplicateTeam="duplicateTeam"
        @removeTeam="removeTeam"
      />
      <button
        @click="addTeam"
        class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 min-w-[100px]"
      >
        ＋チーム追加
      </button>
    </div>
  </div>
</template>

<script setup>
import ShiftTeam from "./ShiftTeam.vue"

const props = defineProps({ dateItem: Object })

const addTeam = () => {
  if (!props.dateItem.teams) props.dateItem.teams = []
  props.dateItem.teams.push({
    id: Date.now(),
    name: `チーム${props.dateItem.teams.length + 1}`,
    locked: false,
    folded: false,
    positions: []
  })
}

const duplicateTeam = (team) => {
  const copy = JSON.parse(JSON.stringify(team))
  copy.id = Date.now()
  props.dateItem.teams.push(copy)
}

const removeTeam = (team) => {
  props.dateItem.teams = props.dateItem.teams.filter(t => t.id !== team.id)
}
</script>
