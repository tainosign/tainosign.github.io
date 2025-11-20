<template>
  <div class="date-wrapper">
    <ShiftContainer
      :item="shift"
      :list="[shift]"
      type="date"
      :timelineWidthPx="timelineWidthPx"
    >
      <template #header>
        <div class="header-row">
          <span class="date-label">{{ shift.date }}</span>

          <button @click="addTeam" class="add-btn">
            ＋ チーム
          </button>
        </div>
      </template>

      <template #body>
        <div class="team-column">
          <ShiftTeam
            v-for="team in shift.teams"
            :key="team.id"
            :shift-date="shift.date"
            :team="team"
            :timelineWidthPx="timelineWidthPx"
            :unitPer10Min="unitPer10Min"
            @update-shift="emitUpdate"
          />
        </div>
      </template>
    </ShiftContainer>
  </div>
</template>

<script setup>
import ShiftContainer from "./ShiftContainer.vue";
import ShiftTeam from "./ShiftTeam.vue";
import { computed } from "vue";
import { useShiftStore } from "@/stores/shiftStore";

const props = defineProps({
  shift: { type: Object, required: true },
  unitPer10Min: { type: Number, default: 6 },
  startHour: { type: Number, default: 7 },
  endHour: { type: Number, default: 20 },
});

const store = useShiftStore();
const emit = defineEmits(["update-shift"]);

const totalMin = computed(() => (props.endHour - props.startHour) * 60);
const widthUnits = computed(() => totalMin.value / 10);
const timelineWidthPx = computed(() => widthUnits.value * props.unitPer10Min);

function addTeam() {
  store.addTeam(props.shift.date);
  emit("update-shift");
}

function emitUpdate() {
  emit("update-shift");
}
</script>

<style>
.date-wrapper {
  margin-bottom: 16px;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.add-btn {
  background: #10b981;
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
}

.team-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-left: 3px solid #d1d5db;
  padding-left: 10px;
}
</style>
