<template>
  <ShiftContainer :item="position" :list="positions">
    <template #header>
      <input v-model="position.name" class="border rounded p-1 text-sm w-20" />
    </template>

    <template #body>
      <div class="flex flex-row gap-2">
        <ShiftSlot
          v-for="slot in position.slots"
          :key="slot.id"
          :slot="slot"
          :slots="position.slots"
        />
        <button @click="addSlot" class="bg-yellow-500 text-white text-xs px-2 py-1 rounded self-start mt-2">
          ＋スロット
        </button>
      </div>
    </template>
  </ShiftContainer>
</template>

<script setup>
import ShiftContainer from "./ShiftContainer.vue";
import ShiftSlot from "./ShiftSlot.vue";
import { createSlot } from "@/models/shiftModel";

const props = defineProps({
  position: Object,
  positions: Array, // 親リスト
});

const addSlot = () => {
  props.position.slots.push(createSlot());
};
</script>
