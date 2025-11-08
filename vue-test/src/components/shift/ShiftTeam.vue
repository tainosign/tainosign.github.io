<template>
  <ShiftItemWrapper
    :item="team"
    :label="team.name"
    :showDrag="true"
    @duplicate="$emit('duplicateTeam', team)"
    @remove="$emit('removeTeam', team)"
  >
    <div class="flex flex-col gap-2">
      <!-- ✅ チーム名編集 -->
      <input v-model="team.name" class="border rounded p-1 text-sm w-32" />

      <!-- ✅ ポジション横並び -->
      <div class="flex flex-row gap-2 overflow-x-auto">
        <ShiftPosition
          v-for="position in team.positions"
          :key="position.id"
          :position="position"
          @add-slot="addSlot"
          @duplicate="duplicatePosition"
          @remove="removePosition"
        />
        <button
          @click="addPosition"
          class="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
        >
          ＋ポジション追加
        </button>
      </div>
    </div>
  </ShiftItemWrapper>
</template>

<script setup>
import ShiftItemWrapper from "./ShiftItemWrapper.vue"
import ShiftPosition from "./ShiftPosition.vue"

const props = defineProps({ team: Object })
const emit = defineEmits(["duplicateTeam", "removeTeam"])

const addPosition = () => {
  if (!props.team.positions) props.team.positions = []
  props.team.positions.push({
    id: Date.now(),
    name: `ポジ${props.team.positions.length + 1}`,
    slots: []
  })
}

const duplicatePosition = (position) => {
  const copy = JSON.parse(JSON.stringify(position))
  copy.id = Date.now()
  props.team.positions.push(copy)
}

const removePosition = (position) => {
  props.team.positions = props.team.positions.filter(p => p.id !== position.id)
}

const addSlot = (position) => {
  position.slots.push({
    id: Date.now(),
    start: "09:00",
    end: "17:00",
    members: []
  })
}
</script>
