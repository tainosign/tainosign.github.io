<template>
  <div
    class="absolute left-0 bg-green-200 rounded p-1 text-xs cursor-grab active:cursor-grabbing shadow"
    draggable="true"
    @dragstart="handleDragStart"
  >
    {{ member.name }}
  </div>
</template>

<script setup>
import { useDragManager } from "@/stores/dragManager";

const props = defineProps({
  member: { type: Object, required: true }
});

const dragManager = useDragManager();

const handleDragStart = () => {
  dragManager.startDrag({
    type: "member",
    data: props.member,
  });
};
</script>
