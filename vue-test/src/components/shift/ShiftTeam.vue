<template>
  <ShiftContainer
    :item="team"
    type="team"
    :containerWidth="teamWidth"
    :context="{ date: shiftDate, teamId: team.id }"
    @duplicate="onDuplicate"
    @remove="onRemove"
  >
    <template #header>
      <div class="flex justify-between items-center mb-1">
        <input
          v-model="team.name"
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
          @duplicate="onPositionDuplicate"
          @remove="onPositionRemove"
        />
      </ScrollableRow>
    </template>
  </ShiftContainer>
</template>

<script setup>
import { computed } from "vue";
import ShiftContainer from "./ShiftContainer.vue";
import ShiftPosition from "./ShiftPosition.vue";
import ScrollableRow from "../common/ScrollableRow.vue";
import { useShiftStore } from "@/stores/shiftStore";

const props = defineProps({
  team: Object,
  shiftDate: String,
});

const store = useShiftStore();

const addPosition = () => {
  store.addPosition(props.shiftDate, props.team.id);
};

const teamWidth = computed(() => {
  // チーム幅はポジション数に依存させる（1ポジション=360px）
  const posCount = props.team.positions?.length || 1;
  return Math.max(320, posCount * 360);
});

const onDuplicate = (payload) => {
  // bubble up to parent (ShiftDate)
  // payload from ShiftContainer already contains item and context
  // but ShiftDate expects team duplication via store. Here we emit event upward:
  // emit('duplicate'...) handled by parent via @duplicate - but we're inside Setup so:
  // use $emit isn't available; use defineEmits
};
const emits = defineEmits(["duplicate", "remove", "position-duplicate", "position-remove"]);

// forward handlers
const onPositionDuplicate = ({ item }) => {
  emits("position-duplicate", { position: item, teamId: props.team.id, shiftDate: props.shiftDate });
};
const onPositionRemove = ({ item }) => {
  emits("position-remove", { position: item, teamId: props.team.id, shiftDate: props.shiftDate });
};

const onDuplicateLocal = (payload) => {
  emits("duplicate", { team: props.team, shiftDate: props.shiftDate });
};
const onRemoveLocal = (payload) => {
  emits("remove", { team: props.team, shiftDate: props.shiftDate });
};
</script>
