<!-- src/components/shift/ShiftSlot.vue -->
<template>
  <div class="border text-center rounded"
       :style="{ minWidth: slotMinWidth + 'px', height: 30 + 'px' }">
    {{ slot.memberId || '空' }}
  </div>
</template>

<script setup>
const props = defineProps({
  slot: Object
})

const slotMinWidth = 20
</script>
