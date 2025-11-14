<template>
  <ShiftContainer :item="team" :list="[team]" type="team">
    <template #header>
      <div class="flex justify-between items-center mb-1">
        <!-- 入力欄がドラッグを邪魔しないよう stop を付与 -->
        <input
          v-model="team.name"
          @dragstart.stop
          placeholder="チーム名"
          class="border rounded px-2 py-1 text-sm w-32"
        />
        <button
          @click="addPosition"
          class="bg-blue-500 text-white text-xs px-2 py-1 rounded"
        >
          ＋ポジション
        </button>
      </div>
    </template>

    <template #body>
      <ScrollableRow>
        <ShiftPosition
          v-for="position in team.positions"
          :key="position.positionId"
          :shift-date="shiftDate"
          :team-id="team.id"
          :position="position"
        />
      </ScrollableRow>
    </template>
  </ShiftContainer>
</template>

<script setup>
import { useShiftStore } from "@/stores/shiftStore";
import ShiftContainer from "./ShiftContainer.vue";
import ShiftPosition from "./ShiftPosition.vue";
import ScrollableRow from "../common/ScrollableRow.vue";

const props = defineProps({
  team: Object,
  shiftDate: String,
});

const store = useShiftStore();

const addPosition = () => {
  store.addPosition(props.shiftDate, props.team.id);
};
</script>
