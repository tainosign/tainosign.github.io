<template>
  <div :class="['border rounded p-2', borderClass]" :style="styleObj">
    <div class="flex items-center justify-between mb-1">
      <slot name="content" />
      <div class="flex space-x-1">
        <button v-if="showCopy" @click="onCopy" class="bg-blue-500 text-white px-2 rounded">⇒</button>
        <button v-if="showDelete" @click="onDelete" class="bg-red-500 text-white px-2 rounded">×</button>
      </div>
    </div>

    <slot /> <!-- 子コンテンツ（チームやポジションなど） -->

    <button v-if="showAdd" @click="onAdd"
            class="mt-2 bg-green-500 text-white px-2 py-1 rounded text-sm w-full">
      {{ addLabel }}
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  showCopy: { type: Boolean, default: true },
  showDelete: { type: Boolean, default: true },
  showAdd: { type: Boolean, default: false },
  addLabel: { type: String, default: "追加" },
  borderClass: { type: String, default: "border-gray-700" },
  styleObj: { type: Object, default: () => ({}) }
});

const emit = defineEmits(["copy", "delete", "add"]);

function onCopy() { emit("copy") }
function onDelete() { emit("delete") }
function onAdd() { emit("add") }
</script>
