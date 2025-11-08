<template>
  <div class="border rounded-lg p-2 bg-white shadow-sm mb-2">
    <div class="flex justify-between items-center">
      <slot name="header">
        <span class="font-bold">{{ item.name }}</span>
      </slot>
      <div class="flex gap-1">
        <button @click="toggleFold" class="text-xs bg-gray-100 px-2 py-1 rounded">
          {{ item.folded ? "＋" : "－" }}
        </button>
        <button @click="toggleLock" class="text-xs bg-gray-100 px-2 py-1 rounded">
          {{ item.locked ? "🔒" : "🔓" }}
        </button>
        <button @click="duplicate(list)" class="text-xs bg-gray-100 px-2 py-1 rounded">
          📄
        </button>
        <button @click="remove(list)" class="text-xs bg-red-100 px-2 py-1 rounded">
          ✖
        </button>
      </div>
    </div>

    <div v-show="!item.folded" class="mt-2">
      <slot name="body"></slot>
    </div>
  </div>
</template>

<script setup>
import { useShiftItem } from "@/composables/useShiftItem";

const props = defineProps({
  item: Object,
  list: Array, // 親リスト
});

const { toggleLock, toggleFold, duplicate, remove } = useShiftItem(props.item);
</script>
