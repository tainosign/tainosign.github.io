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
    <div class="flex flex-row gap-4">
      <!-- ポジション横並び -->
      <ShiftPosition
        v-for="position in team.positions"
        :key="position.id"
        :position="position"
        @duplicate="$emit('duplicatePosition', position)"
        @remove="$emit('removePosition', position)"
        @add-slot="addSlot"
      />

      <!-- ポジション追加ボタン -->
      <button @click="addPosition" class="bg-green-500 text-white px-2 py-1 rounded text-sm self-start">
        ポジション追加
      </button>
    </div>
  </ShiftItemWrapper>
</template>

<script setup>
import ShiftItemWrapper from "./ShiftItemWrapper.vue"
import ShiftPosition from "./ShiftPosition.vue"

const props = defineProps({
  team: Object
})
const emit = defineEmits(["duplicateTeam", "removeTeam", "duplicatePosition", "removePosition", "add-slot"])

const addPosition = () => {
  if (!props.team.positions) props.team.positions = []
  props.team.positions.push({
    id: Date.now(),
    name: `ポジ${props.team.positions.length + 1}`,
    slots: [],
    locked: false,
    folded: false
  })
}

// ポジション配下にスロット追加
const addSlot = (position) => {
  if (!position.slots) position.slots = []
  position.slots.push({
    id: Date.now(),
    start: "09:00",
    end: "18:00",
    members: [],
    locked: false,
    folded: false
  })
}
</script>
