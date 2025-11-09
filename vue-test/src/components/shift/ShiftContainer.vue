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

      <div class="flex gap-1 items-center">
        <!-- 折りたたみトグルは常に表示 -->
        <button
          @click="toggleFold"
          class="text-xs bg-gray-100 px-2 py-1 rounded"
        >
          {{ item.folded ? "＋" : "－" }}
        </button>

        <!-- 折りたたまれていないときだけ他ボタン表示 -->
        <transition name="fade">
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
        </transition>
      </div>
    </div>

    <!-- body部分 -->
    <transition name="collapse">
      <div
        class="mt-2 transition-all duration-300"
        :style="bodyStyle"
      >
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

// 横幅だけ細長くするスタイル
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

// 縦方向のbodyエリアは非表示にせず、高さだけ変化させる
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

<style scoped>
/* フェードとスライドアニメーション */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.collapse-enter-active, .collapse-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
}
</style>
