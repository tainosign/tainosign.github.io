<template>
  <div
    class="border rounded p-1 bg-white shadow-sm mb-1 transition-all duration-200 flex-shrink-0"
    :class="{ 'opacity-70 bg-gray-100': item.locked }"
    :style="containerStyle"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <div class="flex justify-between items-center mb-0.5">
      <template v-if="!item.folded">
        <slot name="header">
          <span class="font-bold text-xs">{{ item.name }}</span>
        </slot>
      </template>

      <div class="flex gap-0.5 items-center">
        <button @click="toggleFold" class="text-[10px] bg-gray-100 px-1 py-0.5 rounded">
          {{ item.folded ? "＋" : "－" }}
        </button>

        <template v-if="!item.folded">
          <button
            @click="toggleLock"
            class="text-[10px] px-1 py-0.5 rounded"
            :class="item.locked ? 'bg-gray-400 text-white' : 'bg-gray-100'"
          >
            {{ item.locked ? '🔒' : '🔓' }}
          </button>

          <button @click="duplicateItem" class="text-[10px] bg-gray-100 px-1 py-0.5 rounded">📄</button>

          <button
            v-if="!item.locked"
            @click="removeItem"
            class="text-[10px] bg-red-100 px-1 py-0.5 rounded"
          >✖</button>
        </template>
      </div>
    </div>

    <transition name="fade">
      <div v-show="!item.folded" class="mt-0.5 overflow-visible">
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
  type: { type: String, default: "generic" },
});

const store = useShiftStore();
const { toggleLock, toggleFold } = useShiftItem(props.item);

const containerStyle = computed(() => ({
  width: props.item.folded ? "70px" : "100%",
  transition: "width 0.2s ease",
  overflowY: "visible",
}));

const duplicateItem = () => {
  if (props.type === "team") store.duplicateTeam(props.list[0]?.date, props.item.id);
  if (props.type === "position") store.duplicatePosition(props.list[0]?.teamId, props.item.positionId);
};

const removeItem = () => {
  if (props.type === "team") store.removeTeam(props.list[0]?.date, props.item.id);
  if (props.type === "position") store.removePosition(props.list[0]?.teamId, props.item.positionId);
};

const onDragStart = (e) => {
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("application/json", JSON.stringify(props.item));
};
const onDragEnd = () => {};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
