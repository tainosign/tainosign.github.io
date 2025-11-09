<template>
  <div
    class="border rounded-lg p-2 bg-white shadow-sm mb-2 transition-all duration-300 overflow-hidden flex-shrink-0"
    :class="{ 'opacity-70 bg-gray-100': item.locked }"
    :style="containerStyle"
    draggable="true"
  >
    <div class="flex justify-between items-center mb-1">
      <template v-if="!item.folded">
        <slot name="header">
          <span class="font-bold">{{ item.name }}</span>
        </slot>
      </template>

      <div class="flex gap-1 items-center">
        <!-- 折りたたみトグル -->
        <button @click="toggleFold" class="text-xs bg-gray-100 px-2 py-1 rounded">
          {{ item.folded ? "＋" : "－" }}
        </button>

        <template v-if="!item.folded">
          <!-- ロックボタン -->
          <button
            @click="toggleLock"
            class="text-xs px-2 py-1 rounded"
            :class="item.locked ? 'bg-gray-400 text-white' : 'bg-gray-100'"
          >
            {{ item.locked ? '🔒' : '🔓' }}
          </button>

          <!-- 複製ボタン -->
          <button
            @click="duplicate(list)"
            class="text-xs bg-gray-100 px-2 py-1 rounded"
          >
            📄
          </button>

          <!-- 削除ボタン：ロック中は非表示 -->
          <button
            v-if="!item.locked"
            @click="remove(list)"
            class="text-xs bg-red-100 px-2 py-1 rounded"
          >
            ✖
          </button>
        </template>
      </div>
    </div>

    <!-- 本体部分 -->
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

const props = defineProps({
  item: Object,
  list: Array,
});

const { toggleLock, toggleFold, duplicate, remove } = useShiftItem(props.item);

// 横幅のみ可変に
const containerStyle = computed(() => {
  if (props.item.folded) {
    return {
      width: "80px",
      transition: "width 0.3s ease",
      overflowY: "visible",
    };
  }
  return {
    width: "100%",
    transition: "width 0.3s ease",
    overflowY: "visible",
  };
});
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
