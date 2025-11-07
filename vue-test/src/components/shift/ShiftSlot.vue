<!-- src/components/shift/ShiftSlot.vue -->
<template>
  <ShiftItemWrapper
    :showCopy="true"
    :showDelete="true"
    :showAdd="false"
    :borderClass="'border-gray-700'"
    :styleObj="{ minWidth: slotMinWidth + 'px', height: '30px' }"
    @copy="$emit('copy-slot', slot.id)"
    @delete="$emit('delete-slot', slot.id)"
  >
    <template #content>
      <div class="text-center w-full h-full flex items-center justify-center">
        {{ slot.memberId || '空' }}
      </div>
    </template>
  </ShiftItemWrapper>
</template>

<script setup>
import ShiftItemWrapper from "./ShiftItemWrapper.vue";

const props = defineProps({
  slot: Object
});

const slotMinWidth = 20;
</script>

<style scoped>
/* 枠線を濃くしつつ全体高さを揃える */
</style>
