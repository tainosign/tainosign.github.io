<template>
  <div
    class="relative border-2 border-gray-500 rounded-md bg-white shadow-sm p-2"
    :class="{ 'opacity-60': item.locked }"
    :style="{ minWidth: foldedWidth + 'px' }"
  >
    <!-- ヘッダー -->
    <div class="flex items-center gap-2 mb-2">
      <span class="cursor-pointer font-bold">{{ label }}</span>

      <button v-if="showDuplicate" @click="$emit('duplicate', item)" class="text-blue-500 font-bold">⇒</button>
      <button v-if="showRemove" @click="$emit('remove', item)" class="text-red-500 font-bold">×</button>
      <span v-if="showDrag" class="drag-handle cursor-move text-gray-700 font-bold">⋯</span>
      <button v-if="showLock" @click="toggleLock">{{ item.locked ? '●' : '◯' }}</button>
      <button @click="toggleFold">{{ item.folded ? '▶' : '◀' }}</button>
    </div>

    <transition name="fade">
      <div v-show="!item.folded">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script setup>
const props = defineProps({
  item: Object,
  label: String,
  showDuplicate: { type: Boolean, default: true },
  showRemove: { type: Boolean, default: true },
  showDrag: { type: Boolean, default: true },
  showLock: { type: Boolean, default: true },
  foldedWidth: { type: Number, default: 80 } // ◀押下時の幅
})

const toggleLock = () => (props.item.locked = !props.item.locked)
const toggleFold = () => (props.item.folded = !props.item.folded)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
