<template>
  <div class="p-3 border rounded-lg bg-gray-50 min-w-[320px]">
    <div class="flex justify-between items-center mb-2">
      <h4 class="font-semibold">チーム: {{ team.name || team.teamId }}</h4>
      <button
        @click="addPosition"
        class="bg-blue-500 text-white px-2 py-1 rounded text-sm"
      >
        ＋ポジション
      </button>
    </div>

    <div class="flex gap-2 overflow-x-auto">
      <ShiftPosition
        v-for="position in positions"
        :key="position.positionId"
        :date="date"
        :team-id="team.teamId"
        :position="position"
        @update="updatePosition"
        @delete="deletePosition"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import ShiftPosition from "./ShiftPosition.vue";

const props = defineProps({
  team: Object,
  date: String,
});

const emit = defineEmits(["update"]);

const positions = ref(props.team.positions || []);

watch(
  positions,
  () => emit("update", { ...props.team, positions: positions.value }),
  { deep: true }
);

function addPosition() {
  positions.value.push({
    positionId: `pos_${Date.now()}`,
    name: `新しいポジション ${positions.value.length + 1}`,
    slots: [],
  });
}

function deletePosition(id) {
  positions.value = positions.value.filter((p) => p.positionId !== id);
}

function updatePosition(updated) {
  positions.value = positions.value.map((p) =>
    p.positionId === updated.positionId ? updated : p
  );
}
</script>
