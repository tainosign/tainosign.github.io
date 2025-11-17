<template>
  <div class="member-wrap flex items-center gap-2 bg-yellow-50 rounded px-1 py-1">
    <!-- 左端ドラッグハンドル (1vw) -->
    <div
      class="member-drag-handle"
      draggable="true"
      @dragstart="handleDragStart"
      title="ドラッグして配置"
    >
      ⋮
    </div>

    <div class="member-body flex-1 text-sm truncate">
      {{ member.name || member.name_kanji }}
    </div>

    <!-- 小さな操作ボタン（例: info 等） -->
    <div class="member-actions flex gap-1">
      <button class="btn-small" @click.stop="$emit('info', member)">i</button>
    </div>
  </div>
</template>

<script setup>
import { useDragManager } from "@/composables/useDragManager";

const props = defineProps({
  member: { type: Object, required: true },
});

const emit = defineEmits(["info"]);

const dragManager = useDragManager();

function handleDragStart(e) {
  dragManager.startDrag("member", props.member, e);
  dragManager.startDragMember(props.member, e);
}
</script>

<style scoped>
.member-drag-handle {
  width: 1vw;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
}
.btn-small {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid #e6e6e6;
  background: #fff;
}
.member-wrap { padding: 0.1vw; }
</style>
