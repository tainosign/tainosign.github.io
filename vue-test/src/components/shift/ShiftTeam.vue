<template>
  <div class="min-w-[300px] bg-gray-50 border rounded p-3">
    <div class="flex items-center justify-between mb-2">
      <div>
        <div class="font-semibold text-gray-800">{{ team.name }}</div>
        <div class="text-xs text-gray-500">ID: {{ team.id }}</div>
      </div>
      <div class="flex items-center gap-2">
        <button @click="addPosition" class="bg-blue-500 text-white text-xs px-2 py-1 rounded">＋ポジション</button>
        <button @click="removeTeam" class="bg-red-500 text-white text-xs px-2 py-1 rounded">削除</button>
      </div>
    </div>

    <div class="flex gap-2 overflow-x-auto py-1">
      <div
        v-for="position in positions"
        :key="position.positionId"
        class="w-[360px] shrink-0"
      >
        <ShiftPosition
          :date-id="shiftDay"
          :team-id="team.id"
          :position="position"
          @update-position="updatePosition"
          @delete-position="deletePosition"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import ShiftPosition from "./ShiftPosition.vue";
import { useShiftStore } from "@/stores/shiftStore";
import { reactive } from "vue";

const props = defineProps({
  shiftDay: { type: String, required: false, default: '' },
  team: { type: Object, required: true },
});

const emit = defineEmits(["update-team", "delete-team"]);
const store = useShiftStore();

const positions = reactive(props.team.positions || []);

function addPosition() {
  const newPos = {
    positionId: `pos_${Date.now()}`,
    name: `ポジション ${positions.length + 1}`,
    // slots will be managed inside ShiftSlot (assignments)
    slots: [],
  };
  positions.push(newPos);
  emit("update-team", { ...props.team, positions: positions });
}

function deletePosition(positionId) {
  const updated = positions.filter(p => p.positionId !== positionId);
  emit("update-team", { ...props.team, positions: updated });
}

function updatePosition(updatedPosition) {
  const updated = positions.map(p => (p.positionId === updatedPosition.positionId ? updatedPosition : p));
  emit("update-team", { ...props.team, positions: updated });
}

function removeTeam() {
  if (!confirm("このチームを削除しますか？")) return;
  emit("delete-team", props.team.id);
}
</script>
