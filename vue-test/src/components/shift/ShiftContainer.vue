<template>
  <div
    class="border rounded p-1 bg-white shadow-sm mb-1 transition-all duration-200 flex-shrink-0"
    :class="{ 'opacity-70 bg-gray-100': item.locked }"
    :style="containerStyle"
  >
    <!-- ヘッダー：ドラッグハンドルは右端のハンドルで取る -->
    <div class="flex justify-between items-center mb-0.5">
      <div class="flex items-center gap-2">
        <template v-if="!item.folded">
          <slot name="header">
            <span class="font-bold text-xs">{{ item.name }}</span>
          </slot>
        </template>
      </div>

      <div class="flex gap-0.5 items-center">
        <!-- 折りたたみなどはここで処理（ローカル操作） -->
        <button @click.stop="toggleFold" class="text-[10px] bg-gray-100 px-1 py-0.5 rounded">
          {{ item.folded ? "＋" : "－" }}
        </button>

        <template v-if="!item.folded">
          <button
            @click.stop="toggleLock"
            class="text-[10px] px-1 py-0.5 rounded"
            :class="item.locked ? 'bg-gray-400 text-white' : 'bg-gray-100'"
          >
            {{ item.locked ? '🔒' : '🔓' }}
          </button>

          <!-- 複製／削除は emit して親が決定的処理を行う -->
          <button @click.stop="emitDuplicate" class="text-[10px] bg-gray-100 px-1 py-0.5 rounded">📄</button>

          <button
            v-if="!item.locked"
            @click.stop="emitRemove"
            class="text-[10px] bg-red-100 px-1 py-0.5 rounded"
          >✖</button>
        </template>

        <!-- ドラッグ用ハンドル（見た目は小さなハンドル） -->
        <div
          class="drag-handle ml-1 px-1 py-0.5 rounded bg-gray-200 text-[11px] cursor-move select-none"
          draggable="true"
          @dragstart="onDragStart"
          @dragend="onDragEnd"
          title="ドラッグ移動"
        >☰</div>
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
  // optional: containerWidth allows parent to specify width (px or %)
  containerWidth: { type: [String, Number], default: null },
  type: { type: String, default: "generic" },
  context: { type: Object, default: () => ({}) }, // optional context (date/teamId/positionId)
});
const emits = defineEmits(["duplicate", "remove", "dragstart", "dragend"]);

const store = useShiftStore();
const { toggleLock, toggleFold } = useShiftItem(props.item);

const containerStyle = computed(() => {
  const base = {
    width: props.item.folded ? "70px" : "100%",
    transition: "width 0.2s ease",
    overflowY: "visible",
  };
  if (props.containerWidth !== null) {
    base.width = typeof props.containerWidth === "number" ? `${props.containerWidth}px` : props.containerWidth;
  }
  return base;
});

const emitDuplicate = () => {
  emits("duplicate", { item: props.item, type: props.type, context: props.context });
};
const emitRemove = () => {
  emits("remove", { item: props.item, type: props.type, context: props.context });
};

const onDragStart = (e) => {
  // Drag payload: include type and identifying context so drop handlers can act
  const payload = { type: props.type, item: props.item, context: props.context };
  if (e && e.dataTransfer) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/json", JSON.stringify({ dragType: "container", payload }));
  }
  emits("dragstart", payload);
};
const onDragEnd = () => {
  emits("dragend");
};
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
.drag-handle {
  user-select: none;
}
</style>
