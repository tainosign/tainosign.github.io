<template>
  <ShiftContainer
    :item="team"
    :list="[ team ]"
    type="team"
    :timelineWidthPx="timelineWidthPx"
  >
    <template #header>
      <div class="flex flex-col">
        <div class="flex items-center gap-2">
          <input v-model="team.name" placeholder="チーム名" class="border rounded px-2 py-1 text-sm w-36" />
          <button @click="addPosition" class="bg-blue-500 text-white text-xs px-2 py-1 rounded">＋ポジション</button>
        </div>
      </div>
    </template>

    <template #body>
      <!-- ポジションを縦に積む -->
      <div class="flex flex-col gap-2">
        <ShiftPosition
          v-for="position in team.positions"
          :key="position.positionId"
          :shift-date="shiftDate"
          :team-id="team.id"
          :position="position"
          :timelineWidthPx="timelineWidthPx"
          :unitPer10Min="unitPer10Min"
          @update-position="emitUpdate"
        />
      </div>
    </template>
  </ShiftContainer>
</template>

<script setup>
import ShiftContainer from "./ShiftContainer.vue";
import ShiftPosition from "./ShiftPosition.vue";
import { useShiftStore } from "@/stores/shiftStore";

const props = defineProps({
  team: { type: Object, required: true },
  shiftDate: { type: String, required: true },
  timelineWidthPx: { type: Number, required: true },
  unitPer10Min: { type: Number, default: 6 },
});

const emit = defineEmits(["update-shift","update-position"]);
const store = useShiftStore();

const addPosition = () => {
  store.addPosition(props.shiftDate, props.team.id);
  emit("update-shift");
};

const emitUpdate = () => emit("update-shift");
</script>

<style scoped>
/* minimal */
</style>
