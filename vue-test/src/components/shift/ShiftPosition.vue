<template>
  <ShiftItemWrapper
    showAdd
    addLabel="スロット追加"
    @copy="$emit('copy-position', position.id)"
    @delete="$emit('delete-position', position.id)"
    @add="$emit('add-slot', position.id)"
  >
    <template #content>
      <input type="text" v-model="position.name" class="border px-1 py-1 rounded w-full">
    </template>

    <div class="flex space-x-1 mt-1">
      <div v-for="slot in position.slots" :key="slot.id" class="border border-gray-700 p-1 min-w-[20px]">
        {{ slot.member || "空" }}
      </div>
    </div>
  </ShiftItemWrapper>
</template>

<script setup>
import ShiftItemWrapper from "./ShiftItemWrapper.vue";
import { defineProps } from "vue";

const props = defineProps({
  position: Object
});
</script>
