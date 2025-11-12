<template>
  <div
    class="border rounded-lg p-2 bg-white shadow-sm mb-2 transition-all duration-300 overflow-hidden flex-shrink-0"
    :class="{ 'opacity-70 bg-gray-100': item.locked }"
    :style="containerStyle"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <div class="flex justify-between items-center mb-1">
      <template v-if="!item.folded">
        <slot name="header">
          <span class="font-bold">{{ item.name }}</span>
        </slot>
      </template>

      <div class="flex gap-1 items-center">
        <button @click="toggleFold" class="text-xs bg-gray-100 px-2 py-1 rounded">
          {{ item.folded ? "＋" : "－" }}
        </button>

        <template v-if="!item.folded">
          <button
            @click="toggleLock"
            class="text-xs px-2 py-1 rounded"
            :class="item.locked ? 'bg-gray-400 text-white' : 'bg-gray-100'"
          >
            {{ item.locked ? '🔒' : '🔓' }}
          </button>

          <button @click="duplicateItem" class="text-xs bg-gray-100 px-2 py-1 rounded">📄</button>

          <button v-if="!item.locked" @click="removeItem" class="text-xs bg-red-100 px-2 py-1 rounded">✖</button>
        </template>
      </div>
    </div>

    <transition name="fade">
      <div v-show="!item.folded" class="mt-1 overflow-visible">
        <slot name="body"></slot>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useShiftItem } from "@/composables/useShiftItem";
import { useShiftStore } from "@/stores/shiftStore";

const props = defineProps({
  item: Object,
  list: Array,
  type: { type: String, default: "generic" }, // "team", "position", "slot"
});

const store = useShiftStore();
const { toggleLock, toggleFold } = useShiftItem(props.item);

const containerStyle = computed(() => {
  return {
    width: props.item.folded ? "80px" : "100%",
    transition: "width 0.3s ease",
    overflowY: "visible",
  };
});

// 共通操作
const duplicateItem = () => {
  if (props.type === "team") store.duplicateTeam(props.list[0]?.date, props.item.id);
  if (props.type === "position") store.duplicatePosition(props.list[0]?.teamId, props.item.positionId);
  // slotは基本UIで複製可能
};

const removeItem = () => {
  if (props.type === "team") store.removeTeam(props.list[0]?.date, props.item.id);
  if (props.type === "position") store.removePosition(props.list[0]?.teamId, props.item.positionId);
  // slotは基本UIで削除可能
};

// ドラッグ対応
const onDragStart = (e) => {
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("application/json", JSON.stringify(props.item));
};

const onDragEnd = () => {
  // 必要であればドラッグ終了後の処理
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
