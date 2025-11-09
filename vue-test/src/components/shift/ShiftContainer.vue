<template>
  <div
    class="border rounded-lg p-2 bg-white shadow-sm mb-2 transition-all duration-300 overflow-hidden"
    :style="foldedStyle"
  >
    <div class="flex justify-between items-center">
      <!-- 折りたたみ時はタイトルなど非表示 -->
      <template v-if="!item.folded">
        <slot name="header">
          <span class="font-bold">{{ item.name }}</span>
        </slot>
      </template>

      <div class="flex gap-1 items-center">
        <!-- 折りたたみボタンは常に表示 -->
        <button
          @click="toggleFold"
          class="text-xs bg-gray-100 px-2 py-1 rounded"
        >
          {{ item.folded ? "＋" : "－" }}
        </button>

        <!-- 折りたたみ中は他ボタンを非表示 -->
        <template v-if="!item.folded">
          <button
            @click="toggleLock"
            class="text-xs bg-gray-100 px-2 py-1 rounded"
          >
            {{ item.locked ? "🔒" : "🔓" }}
          </button>
          <button
            @click="duplicate(list)"
            class="text-xs bg-gray-100 px-2 py-1 rounded"
          >
            📄
          </button>
          <button
            @click="remove(list)"
            class="text-xs bg-red-100 px-2 py-1 rounded"
          >
            ✖
          </button>
        </template>
      </div>
    </div>

    <!-- body部分 -->
    <div
      class="mt-2 transition-all duration-300"
      :style="bodyStyle"
    >
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
});

const { toggleLock, toggleFold, duplicate, remove } = useShiftItem(props.item);

const foldedStyle = computed(() => {
  if (!props.item.folded) {
    return {
      width: "100%",
      transition: "width 0.3s ease",
    };
  }
  return {
    width: "80px",
    transition: "width 0.3s ease",
  };
});

const bodyStyle = computed(() => {
  if (!props.item.folded) {
    return {
      maxHeight: "500px",
      opacity: "1",
    };
  }
  return {
    maxHeight: "0",
    opacity: "0",
    overflow: "hidden",
  };
});
</script>
