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
  // member を dragManager 経由で配布
  dragManager.startDrag("member", props.member, e);
  // 簡易保持
  dragManager.startDragMember(props.member, e);
};
</script>

<style scoped>
/* 必要なら追加スタイル */
</style>
