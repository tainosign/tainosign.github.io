<template>
  <div
    class="border rounded-lg p-2 bg-white shadow-sm mb-2 transition-all duration-300 overflow-hidden"
    :style="foldedStyle"
  >
    <div class="flex justify-between items-center">
      <!-- 折りたたみ時は名前や他のボタンを非表示 -->
      <template v-if="!item.folded">
        <slot name="header">
          <span class="font-bold">{{ item.name }}</span>
        </slot>
      </template>

      <div class="flex gap-1">
        <!-- 折りたたみトグルは常に表示 -->
        <button
          @click="toggleFold"
          class="text-xs bg-gray-100 px-2 py-1 rounded"
        >
          {{ item.folded ? "＋" : "－" }}
        </button>

        <!-- 折りたたまれていないときだけ他ボタン表示 -->
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
    <div v-show="!item.folded" class="mt-2">
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

// 折りたたみ制御関数
const { toggleLock, toggleFold, duplicate, remove } = useShiftItem(props.item);

// 横幅だけ細長くするスタイル
const foldedStyle = computed(() => {
  if (!props.item.folded) {
    return { width: "100%" };
  }
  return {
    width: "80px",
    height: "auto",
    transition: "width 0.3s ease",
    overflowX: "hidden",
    overflowY: "visible",
  };
});
</script>
