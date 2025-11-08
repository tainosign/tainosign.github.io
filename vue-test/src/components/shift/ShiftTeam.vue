<template>
  <ShiftItemWrapper
    :item="team"
    :label="team.name"
    :showDrag="true"
    :showDuplicate="true"
    :showRemove="true"
    :showLock="true"
    :foldedWidth="50"
    @duplicate="$emit('duplicateTeam', team)"
    @remove="$emit('removeTeam', team)"
  >
    <div class="flex flex-row gap-2 items-start">
      <!-- ポジション追加ボタン -->
      <button @click="addPosition" class="bg-green-500 text-white px-2 py-1 rounded text-sm">
        ポジション追加
      </button>

      <!-- ポジション横並び -->
      <div class="flex flex-row gap-2 mt-2">
        <ShiftPosition
          v-for="position in team.positions"
          :key="position.id"
          :position="position"
          @duplicatePosition="duplicatePosition"
          @removePosition="removePosition"
        />
      </div>
    </div>
  </ShiftItemWrapper>
</template>

<script setup>
import ShiftItemWrapper from "./ShiftItemWrapper.vue"
import ShiftPosition from "./ShiftPosition.vue"
import { ref } from "vue"

const props = defineProps({
  team: Object
})
const emit = defineEmits(["duplicateTeam", "removeTeam"])

const addPosition = () => {
  if (!props.team.positions) props.team.positions = []
  props.team.positions.push({
    id: Date.now(),
    name: `ポジ${props.team.positions.length + 1}`,
    slots: []
  })
}

// ポジション複製・削除
const duplicatePosition = (position) => {
  const copy = { ...position, id: Date.now() }
  props.team.positions.push(copy)
}

const removePosition = (position) => {
  props.team.positions = props.team.positions.filter(p => p.id !== position.id)
}
</script>
