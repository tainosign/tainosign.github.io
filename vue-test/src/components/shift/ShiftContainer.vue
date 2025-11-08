<template>
  <div
    class="border rounded-lg p-2 bg-white shadow-sm mb-2"
    :style="foldedStyle"
  >
    <div class="flex justify-between items-center">
      <slot name="header">
        <input v-if="editableName" v-model="item.name" class="border rounded p-1 text-sm" />
        <span v-else class="font-bold">{{ item.name }}</span>
      </slot>

      <div class="flex gap-1">
        <button @click="toggleFold" class="text-xs bg-gray-100 px-2 py-1 rounded">
          {{ item.folded ? "＋" : "－" }}
        </button>
        <button @click="toggleLock" class="text-xs bg-gray-100 px-2 py-1 rounded">
          {{ item.locked ? "🔒" : "🔓" }}
        </button>
        <button @click="duplicate(list)" class="text-xs bg-gray-100 px-2 py-1 rounded">📄</button>
        <button @click="remove(list)" class="text-xs bg-red-100 px-2 py-1 rounded">✖</button>
      </div>
    </div>

    <!-- body は折りたたみ時でも高さ維持 -->
    <div class="mt-2">
      <slot name="body"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useShiftItem } from "@/composables/useShiftItem";

const props = defineProps({
  item: Object,
  list: Array,
  foldedWidth: { type: Number, default: null }, // 幅だけ折りたたむ場合に指定
  editableName: { type: Boolean, default: true },
});

const { toggleLock, toggleFold, duplicate, remove } = useShiftItem(props.item);

const foldedStyle = computed(() => {
  if (!props.item.folded) return {};
  if (!props.foldedWidth) return {};
  return {
    width: props.foldedWidth + "px",
    transition: "width 0.3s",
    overflowX: "hidden",
  };
});
</script>
