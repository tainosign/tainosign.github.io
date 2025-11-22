<!-- src/components/shift/ShiftPosition.vue -->
<template>
  <ShiftContainer
    :item="position"
    :list="[ position ]"
    type="position"
    :timelineWidthPx="timelineWidthPx"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <input v-model="position.name" class="border rounded px-2 py-1 text-sm w-40" placeholder="ポジション名" />
        <button @click="addSlot" class="bg-green-500 text-white text-xs px-2 py-1 rounded">＋スロット</button>
      </div>
    </template>

    <template #body>
      <div class="flex flex-col gap-2">
        <ShiftSlot
          v-for="slot in position.slots"
          :key="slot.slotId"
        :slot-id="slot.slotId"
        :blocks="slot.blocks"
          :shift-date="shiftDate"          
          :team-id="teamId"
          :position-id="position.positionId"
          :blocks="slot.blocks || slot.members || []"
          :unitPer10Min="unitPer10Min"
          :startHour="startHour"
          :endHour="endHour"
          :timelineWidthPx="timelineWidthPx"
          @update-slots="onSlotsUpdate"
          @remove-slot="onRemoveSlot"
        />
      </div>
    </template>
  </ShiftContainer>
</template>

<script setup>
import ShiftContainer from "./ShiftContainer.vue";
import ShiftSlot from "./ShiftSlot.vue";
import { useShiftStore } from "@/stores/shiftStore";
import { ref } from "vue";

const props = defineProps({
  shiftDate: { type: String, required: true },
  teamId: { type: String, required: true },
  position: { type: Object, required: true },
  timelineWidthPx: { type: Number, required: true },
  unitPer10Min: { type: Number, default: 6 },
  startHour: { type: Number, default: 7 },
  endHour: { type: Number, default: 20 },
});

const emit = defineEmits(["update-position"]);
const store = useShiftStore();

const positionName = ref(props.position.name || "");
positionName.value = props.position.name || "";

function addSlot() {
  store.addSlot(props.shiftDate, props.teamId, props.position.positionId);
  emit("update-position");
}

function onRemoveSlot(slotId) {
  const shift = store.shifts.find((s) => s.date === props.shiftDate);
  const team = shift?.teams.find((t) => t.id === props.teamId);
  const pos = team?.positions.find((p) => p.positionId === props.position.positionId);
  if (pos) {
    pos.slots = pos.slots.filter((s) => s.slotId !== slotId);
    store.removeSlot(props.shiftDate, props.teamId, props.position.positionId, slotId);
    emit("update-position");
  }
}

function onSlotsUpdate({ slotId, blocks }) {
  const shift = store.shifts.find((s) => s.date === props.shiftDate);
  const team = shift?.teams.find((t) => t.id === props.teamId);
  const pos = team?.positions.find((p) => p.positionId === props.position.positionId);
  if (pos) {
    const idx = pos.slots.findIndex((s) => s.slotId === slotId);
    if (idx !== -1) pos.slots[idx].blocks = blocks;
    emit("update-position");
  }
  }
</script>

<style scoped>
/* minimal */
</style>
