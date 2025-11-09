<template>
  <div
    class="border rounded-lg p-2 bg-white shadow-sm mb-2 transition-all duration-300 overflow-hidden flex-shrink-0"
    :style="containerStyle"
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
          <button @click="toggleLock" class="text-xs bg-gray-100 px-2 py-1 rounded">
            {{ item.locked ? "🔒" : "🔓" }}
          </button>
          <button @click="duplicate(list)" class="text-xs bg-gray-100 px-2 py-1 rounded">📄</button>
          <button @click="remove(list)" class="text-xs bg-red-100 px-2 py-1 rounded">✖</button>
        </template>
      </div>
    </div>

    <transition name="fade">
      <div v-if="!item.folded" class="mt-1">
        <slot name="body"></slot>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useShiftItem } from "@/composables/useShiftItem";

const props = defineProps({
  item: Object,
  list: Array,
});

const { toggleLock, toggleFold, duplicate, remove } = useShiftItem(props.item);

const containerStyle = computed(() => ({
  width: "auto",
  minWidth: "200px",
  transition: "width 0.3s ease",
}));
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
