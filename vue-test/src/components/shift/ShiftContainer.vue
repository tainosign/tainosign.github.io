<template>
  <div
    class="border rounded-lg p-2 bg-white shadow-sm mb-2"
    :style="foldedStyle"
  >
    <div class="flex justify-between items-center">
      <!-- 折りたたみ時は名前非表示 -->
      <template v-if="!item.folded">
        <slot name="header">
          <input v-if="editableName" v-model="item.name" class="border rounded p-1 text-sm" />
          <span v-else class="font-bold">{{ item.name }}</span>
        </slot>
      </template>

      <div class="flex gap-1">
        <!-- 折りたたみボタンは常に表示 -->
        <button @click="toggleFold" class="text-xs bg-gray-100 px-2 py-1 rounded">
          {{ item.folded ? "＋" : "－" }}
        </button>

        <!-- 折りたたまれていない時だけ他の操作ボタン表示 -->
        <template v-if="!item.folded">
          <button @click="toggleLock" class="text-xs bg-gray-100 px-2 py-1 rounded">
            {{ item.locked ? "🔒" : "🔓" }}
          </button>
          <button @click="duplicate(list)" class="text-xs bg-gray-100 px-2 py-1 rounded">📄</button>
          <button @click="remove(list)" class="text-xs bg-red-100 px-2 py-1 rounded">✖</button>
        </template>
      </div>
    </div>

    <!-- body は折りたたみ時は非表示 -->
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
  foldedWidth: { type: Number, default: 50 }, // 横幅折りたたみ時
  editableName: { type: Boolean, default: true },
});

const { toggleLock, toggleFold, duplicate, remove } = useShiftItem(props.item);

// 横方向のみ折りたたむ
const foldedStyle = computed(() => {
  if (!props.item.folded) return {};
  return {
    width: props.foldedWidth + "px",
    transition: "width 0.3s",
    overflowX: "hidden",
    overflowY: "visible", // 縦方向は潰さない
  };
});
</script>
