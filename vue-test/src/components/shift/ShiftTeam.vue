<template>
  <div class="p-3 my-2 border rounded-lg bg-gray-50">
    <div class="flex justify-between items-center mb-2">
      <h4 class="font-semibold text-gray-700">
        チーム: {{ team.name || team.teamId }}
      </h4>
      <button
        @click="addPosition"
        class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-sm"
      >
        + ポジション
      </button>
    </div>

    <p v-if="positions.length === 0" class="text-gray-400 text-sm">
      まだポジションがありません
    </p>

    <ShiftPosition
      v-for="position in positions"
      :key="position.positionId"
      :date-id="dateId"
      :team-id="team.teamId"
      :position="position"
      @update="updatePosition"
      @delete="deletePosition"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import ShiftPosition from "./ShiftPosition.vue";

interface Slot {
  slotId: string;
  time: string;
  member: string | null;
}

interface Position {
  positionId: string;
  name: string;
  slots: Slot[];
}

interface Team {
  teamId: string;
  name: string;
  positions: Position[];
}

const props = defineProps<{
  dateId: string;
  team: Team;
}>();

const emit = defineEmits<{
  (e: "update", team: Team): void;
}>();

const positions = ref<Position[]>(props.team.positions || []);

watch(
  positions,
  () => {
    emit("update", { ...props.team, positions: positions.value });
  },
  { deep: true }
);

function addPosition() {
  const newPosition: Position = {
    positionId: `pos_${Date.now()}`,
    name: `新しいポジション ${positions.value.length + 1}`,
    slots: [],
  };
  positions.value.push(newPosition);
}

function deletePosition(positionId: string) {
  positions.value = positions.value.filter((p) => p.positionId !== positionId);
}

function updatePosition(updatedPosition: Position) {
  positions.value = positions.value.map((p) =>
    p.positionId === updatedPosition.positionId ? updatedPosition : p
  );
}
</script>
