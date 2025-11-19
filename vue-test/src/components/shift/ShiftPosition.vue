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
      <!-- スロット群：縦に積む (each slot is a ShiftSlot component) -->
      <div class="flex flex-col gap-2">
        <ShiftSlot
          v-for="slot in position.slots"
          :key="slot.slotId || slot.id"
          :slot-id="slot.slotId || slot.id"
          :shift-date="shiftDate"
          :team-id="teamId"
          :position-id="position.positionId"
          :slots="slot.blocks || slot.blocks /* legacy */ || slot.members /* legacy */ || slot.slotBlocks || slot.members || []"
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
  if (!shift) return;
  const team = shift.teams.find((t) => t.id === props.teamId);
  if (!team) return;
  const pos = team.positions.find((p) => p.positionId === props.position.positionId);
  if (!pos) return;
  pos.slots = pos.slots.filter(s => (s.slotId || s.id) !== slotId);
  emit("update-position");
}

// 変更前:
// function onSlotsUpdate(newSlots) { ... }

// 変更後:
function onSlotsUpdate(payload) {
  // payload = { slotId, blocks }
  if (!payload || !payload.slotId) {
    // 互換で古い配列が来る場合は無視しないで置換（ただし推奨はしない）
    return;
  }
  const shift = store.shifts.find((s) => s.date === props.shiftDate);
  if (!shift) return;
  const team = shift.teams.find((t) => t.id === props.teamId);
  if (!team) return;
  const pos = team.positions.find((p) => p.positionId === props.position.positionId);
  if (!pos) return;

  // find corresponding slot object by slotId
  const slotIdx = pos.slots.findIndex(s => (s.slotId === payload.slotId || s.id === payload.slotId));
  if (slotIdx !== -1) {
    // replace only blocks for that slot
    pos.slots[slotIdx].blocks = (payload.blocks || []).map(b => ({ ...b }));
  } else {
    // if not found, optionally add a new slot entry with given slotId
    pos.slots.push({
      slotId: payload.slotId,
      blocks: (payload.blocks || []).map(b => ({ ...b })),
    });
  }

  emit("update-position");
}

</script>

<style scoped>
/* minimal */
</style>
