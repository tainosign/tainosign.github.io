<template>
  <ShiftContainer
    :item="position"
    :list="[position]"
    type="position"
    :timelineWidthPx="timelineWidthPx"
  >
    <template #header>
      <div class="position-header">
        <span class="pos-label">{{ position.name }}</span>
        <button @click="addSlot" class="add-btn">＋ スロット</button>
      </div>
    </template>

    <template #body>
      <div class="slot-column">
        <ShiftSlot
          v-for="slot in position.slots"
          :key="slot.slotId"
          :slot-id="slot.slotId"
          :blocks="slot.blocks"
          :shift-date="shiftDate"
          :team-id="teamId"
          :position-id="position.positionId"
          :unitPer10Min="unitPer10Min"
          :timelineWidthPx="timelineWidthPx"
          @update-slots="emitUpdateSlots"
          @remove-slot="removeSlot"
        />
      </div>
    </template>
  </ShiftContainer>
</template>

<script setup>
import ShiftContainer from "./ShiftContainer.vue";
import ShiftSlot from "./ShiftSlot.vue";
import { useShiftStore } from "@/stores/shiftStore";

const props = defineProps({
  position: Object,
  shiftDate: String,
  teamId: String,
  unitPer10Min: Number,
  timelineWidthPx: Number,
});

const emit = defineEmits(["update-position"]);
const store = useShiftStore();

function addSlot() {
  store.addSlot(props.shiftDate, props.teamId, props.position.positionId);
  emit("update-position");
}

function removeSlot(slotId) {
  store.removeSlot(props.shiftDate, props.teamId, props.position.positionId, slotId);
  emit("update-position");
}

function emitUpdateSlots(payload) {
  store.updateSlotBlocks(
    props.shiftDate,
    props.teamId,
    props.position.positionId,
    payload.slotId,
    payload.blocks
  );
  emit("update-position");
}
</script>

<style>
.position-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pos-label {
  font-weight: bold;
}

.add-btn {
  background: #3b82f6;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
}

.slot-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-left: 3px solid #d1d5db;
  padding-left: 12px;
}
</style>
