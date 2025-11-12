<template>
  <ShiftContainer :item="position" :list="[position]" type="position">
    <template #header>
      <div class="flex justify-between items-center mb-2">
        <input v-model="positionName"
               class="border rounded px-2 py-1 text-sm"
               placeholder="ポジション名"/>
        <button @click="addSlot"
                class="bg-green-500 text-white text-xs px-2 py-1 rounded">
          ＋スロット
        </button>
      </div>
    </template>

    <template #body>
      <div class="flex flex-col gap-2">
        <ShiftSlot v-for="slot in position.slots"
                   :key="slot.slotId"
                   :shift-date="shiftDate"
                   :team-id="teamId"
                   :position-id="position.positionId"
                   :slot="slot"/>
      </div>
    </template>
  </ShiftContainer>
</template>

<script setup>
import { ref, watch } from "vue";
import ShiftContainer from "./ShiftContainer.vue";
import ShiftSlot from "./ShiftSlot.vue";
import { useShiftStore } from "@/stores/shiftStore";

const props = defineProps({
  shiftDate: String,
  teamId: String,
  position: Object,
});

const store = useShiftStore();

const positionName = ref(props.position.name || "");

watch(positionName, (v) => {
  props.position.name = v;
});

const addSlot = () => {
  store.addSlot(props.shiftDate, props.teamId, props.position.positionId);
};
</script>
