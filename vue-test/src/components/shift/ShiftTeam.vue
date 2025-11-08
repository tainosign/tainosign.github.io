<template>
  <ShiftItemWrapper
    :item="team"
    label="チーム"
    @duplicate="$emit('duplicate', team)"
    @remove="$emit('remove', team)"
  >
    <div class="flex gap-2">
      <button @click="$emit('add-position', team)" class="bg-blue-500 text-white rounded px-2 py-1">＋ポジション追加</button>

      <draggable
        v-model="team.positions"
        handle=".drag-handle"
        item-key="id"
        class="flex gap-2"
      >
        <template #item="{ element }">
          <ShiftPosition
            :position="element"
            @duplicate="$emit('duplicate-position', { team, position: element })"
            @remove="$emit('remove-position', { team, position: element })"
          />
        </template>
      </draggable>
    </div>
  </ShiftItemWrapper>
</template>

<script setup>
import draggable from "vuedraggable"
import ShiftPosition from "./ShiftPosition.vue"
import ShiftItemWrapper from "./ShiftItemWrapper.vue"

defineProps({ team: Object })
defineEmits(["duplicate", "remove", "add-position", "duplicate-position", "remove-position"])
</script>
