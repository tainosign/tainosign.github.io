<template>
  <ShiftItemWrapper
    :item="position"
    label="ポジション"
    @duplicate="$emit('duplicate', position)"
    @remove="$emit('remove', position)"
  >
    <div class="flex gap-2">
      <button @click="$emit('add-slot', position)" class="bg-yellow-500 text-white rounded px-2 py-1">＋スロット追加</button>

      <draggable
        v-model="position.slots"
        handle=".drag-handle"
        item-key="id"
        class="flex gap-2"
      >
        <template #item="{ element }">
          <ShiftSlot :slot="element" />
        </template>
      </draggable>
    </div>
  </ShiftItemWrapper>
</template>

<script setup>
import draggable from "vuedraggable"
import ShiftSlot from "./ShiftSlot.vue"
import ShiftItemWrapper from "./ShiftItemWrapper.vue"

defineProps({ position: Object })
defineEmits(["duplicate", "remove", "add-slot"])
</script>
