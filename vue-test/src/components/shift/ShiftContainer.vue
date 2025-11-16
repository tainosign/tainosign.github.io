<!-- src/components/shift/ShiftContainer.vue -->
<template>
  <div
    :class="['shift-container border rounded p-1 bg-white shadow-sm mb-1 transition-all duration-200 flex-shrink-0', item.locked ? 'opacity-70 bg-gray-100' : '']"
    :style="containerStyle"
  >
    <!-- ヘッダー行：ドラッグハンドル（左） + ヘッダースロット（中央） + 操作ボタン（右） -->
    <div class="flex items-center justify-between gap-2 mb-1">
      <!-- ドラッグハンドル（固定幅） -->
      <div
        class="drag-handle w-6 h-8 flex items-center justify-center rounded text-xs cursor-grab select-none"
        draggable="true"
        @dragstart.stop="onHandleDragStart"
        @dragend.stop="onDragEnd"
        title="ドラッグ移動（長押し／ドラッグ可能）"
      >
        ⋮
      </div>

      <!-- ヘッダー本体（スロット） -->
      <div class="flex-1">
        <slot name="header">
          <span class="font-bold text-sm truncate">{{ item.name }}</span>
        </slot>
      </div>

      <!-- 操作ボタン群（クリック専用。ドラッグハンドルと分離） -->
      <div class="flex items-center gap-1">
        <button
          @click.stop="toggleFold"
          class="text-[10px] bg-gray-100 px-1 py-0.5 rounded"
          title="折りたたみ"
        >
          {{ item.folded ? "＋" : "－" }}
        </button>

        <button
          @click.stop="toggleLock"
          :class="['text-[10px] px-1 py-0.5 rounded', item.locked ? 'bg-gray-400 text-white' : 'bg-gray-100']"
          title="ロック"
        >
          {{ item.locked ? '🔒' : '🔓' }}
        </button>

        <button
          @click.stop="onDuplicate"
          class="text-[10px] bg-gray-100 px-1 py-0.5 rounded"
          title="複製"
        >📄</button>

        <button
          v-if="!item.locked"
          @click.stop="onRemove"
          class="text-[10px] bg-red-100 px-1 py-0.5 rounded"
          title="削除"
        >✖</button>
      </div>
    </div>

    <!-- 内容 -->
    <transition name="fade">
      <div v-show="!item.folded" class="overflow-visible">
        <slot name="body"></slot>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useShiftItem } from "@/composables/useShiftItem";
import { useShiftStore } from "@/stores/shiftStore";
import { useDragManager } from "@/composables/useDragManager";

const props = defineProps({
  item: { type: Object, required: true },
  list: { type: Array, default: () => [] },
  type: { type: String, default: "generic" },
  // optionally parent widths could be passed to compute
  maxWidth: { type: String, default: null },
});

const store = useShiftStore();
const dragManager = useDragManager();
const { toggleLock, toggleFold, duplicate, remove } = useShiftItem(props.item);

// container style: allow parent to pass maxWidth or fallback to 100%
const containerStyle = computed(() => {
  const w = props.maxWidth ? props.maxWidth : (props.item.folded ? "70px" : "100%");
  return {
    width: w,
    transition: "width 0.2s ease",
  };
});

// 操作
const onDuplicate = () => {
  // try to use specific store duplicator
  if (props.type === "team") store.duplicateTeam(props.list[0]?.date, props.item.id);
  else if (props.type === "position") store.duplicatePosition(props.list[0]?.date, props.list[0]?.teamId, props.item.positionId);
  else duplicate(props.list);
};

const onRemove = () => {
  if (props.type === "team") store.removeTeam(props.list[0]?.date, props.item.id);
  else if (props.type === "position") store.removePosition(props.list[0]?.date, props.list[0]?.teamId, props.item.positionId);
  else remove(props.list);
};

// ドラッグハンドル専用 start
const onHandleDragStart = (e) => {
  // payload はコンテキストに合わせて変えてください（例: 移動対象の item と type）
  const payload = { type: props.type, item: props.item, sourceDate: props.list[0]?.date };
  // native transfer
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("application/json", JSON.stringify({ dragType: "shiftItem", payload }));
  // drag manager also record optionally
  dragManager.startDrag("shiftItem", payload, e);
};
const onDragEnd = (e) => {
  dragManager.clearDrag();
};
</script>

<style scoped>
/* 小さなスタイル調整 */
.shift-container {
  /* デフォルトの最大幅は100%だが親が管理します */
  box-sizing: border-box;
}

/* ハンドルの見た目 */
.drag-handle {
  background: transparent;
  color: #666;
}
.drag-handle:active {
  cursor: grabbing;
}

/* fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
