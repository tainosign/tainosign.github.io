<!-- src/components/shift/ShiftMember.vue -->
<template>
  <div
    class="bg-yellow-100 rounded px-2 py-1 text-sm cursor-grab active:cursor-grabbing"
    draggable="true"
    @dragstart="handleDragStart"
  >
    {{ member.name }}
  </div>
</template>

<script setup>
import { useDragManager } from "@/composables/useDragManager";

const props = defineProps({
  member: { type: Object, required: true },
});

const dragManager = useDragManager();

const handleDragStart = (e) => {
  dragManager.startDrag("member", props.member, e);
  dragManager.startDragMember(props.member, e);
};
</script>

<style scoped>
</style>
