<template>
  <ShiftContainer :item="team" :list="[team]" type="team">
    <template #header>
      <div class="flex justify-between items-center mb-2">
        <h4 class="font-semibold">{{ team.name }}</h4>
        <button @click="addPosition"
                class="bg-blue-500 text-white px-2 py-1 rounded text-sm">
          ＋ポジション
        </button>
      </div>
    </template>

    <template #body>
      <div class="flex gap-2 overflow-x-auto">
        <ShiftPosition v-for="position in team.positions"
                       :key="position.positionId"
                       :shift-date="shiftDate"
                       :team-id="team.id"
                       :position="position"/>
      </div>
    </template>
  </ShiftContainer>
</template>

<script setup>
import { useShiftStore } from "@/stores/shiftStore";
import ShiftContainer from "./ShiftContainer.vue";
import ShiftPosition from "./ShiftPosition.vue";

const props = defineProps({
  team: Object,
  shiftDate: String,
});

const store = useShiftStore();

const addPosition = () => {
  store.addPosition(props.shiftDate, props.team.id);
};
</script>  );
}
</script>
