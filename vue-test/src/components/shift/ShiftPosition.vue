<template>
  <ShiftItemWrapper
    :item="position"
    :label="position.name"
    :showDrag="true"
    :showDuplicate="true"
    :showRemove="true"
    :showLock="true"
    :foldedWidth="50"
    @duplicate="$emit('duplicate', position)"
    @remove="$emit('remove', position)"
  >
    <div class="flex flex-row gap-2 items-start">
      <!-- スロット横並び -->
      <ShiftSlot
        v-for="slot in position.slots"
        :key="slot.id"
        :slot="slot"
        @remove-member="$emit('remove-member', $event)"
      />

      <!-- スロット追加ボタン -->
      <button
        @click="$emit('add-slot', position)"
        class="bg-yellow-500 text-white px-2 py-1 rounded text-sm self-start"
      >
        +スロット
      </button>
    </div>
  </ShiftItemWrapper>
</template>

<script setup>
import ShiftItemWrapper from "./ShiftItemWrapper.vue"
import ShiftSlot from "./ShiftSlot.vue"

defineProps({ position: Object })
defineEmits(["duplicate", "remove", "add-slot", "remove-member"])
</script>
