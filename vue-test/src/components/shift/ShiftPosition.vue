<template>
  <ShiftContainer
    :item="position"
    type="position"
    :containerWidth="positionWidth"
    :context="{ date: shiftDate, teamId: teamId, positionId: position.positionId }"
    @duplicate="onDuplicate"
    @remove="onRemove"
  >
    <template #header>
      <div class="flex justify-between items-center mb-1">
        <input
          v-model="positionName"
          class="border rounded px-2 py-1 text-sm w-40"
          placeholder="ポジション名"
        />
        <button
          @click="addSlot"
          class="bg-green-500 text-white text-xs px-2 py-1 rounded"
        >
          ＋スロット
        </button>
      </div>
    </template>

    <template #body>
      <div class="flex flex-row items-start gap-2 overflow-x-auto">
        <!-- 時間目盛り（左） -->
        <div class="flex flex-col text-[10px] text-gray-500 items-end pr-2">
          <div
            v-for="time in timeMarksDisplay"
            :key="time"
            class="h-8 leading-8 border-t border-gray-200"
          >
            {{ time }}
          </div>
        </div>

        <!-- スロット（横方向に並ぶ） -->
        <div class="flex flex-row gap-2 flex-nowrap">
          <div
            v-for="slot in position.slots"
            :key="slot.slotId"
            class="flex-shrink-0"
            :style="{ width: slotColumnWidth + 'px' }"
          >
            <ShiftSlot
              :shift-date="shiftDate"
              :team-id="teamId"
              :position-id="position.positionId"
              :slots="slot.blocks || slot.items || []"
              @update-slots="onUpdateSlots(slot.slotId, $event)"
            />
          </div>
        </div>
      </div>
    </template>
  </ShiftContainer>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import ShiftContainer from "./ShiftContainer.vue";
import ShiftSlot from "./ShiftSlot.vue";
import { useShiftStore } from "@/stores/shiftStore";

const props = defineProps({
  shiftDate: String,
  teamId: String,
  position: Object,
});

const store = useShiftStore();
const positionName = ref(props.position.name || "");

watch(positionName, (v) => {
  props.position.name = v;
});

const addSlot = () => {
  store.addSlot(props.shiftDate, props.teamId, props.position.positionId);
};

const slotColumnWidth = 360;
const positionWidth = computed(() => {
  const slotsCount = props.position.slots?.length || 1;
  return Math.max(320, slotsCount * slotColumnWidth);
});

// 7:00〜19:00 の 10分刻みメモリ（表示用を短く）
const timeMarksDisplay = computed(() => {
  const arr = [];
  for (let h = 7; h <= 19; h++) {
    arr.push(`${String(h).padStart(2, "0")}:00`);
  }
  return arr;
});

const onUpdateSlots = (slotId, newSlots) => {
  // slot 内のブロック情報を position に反映する（簡易）
  const sIndex = props.position.slots.findIndex((s) => s.slotId === slotId);
  if (sIndex === -1) return;
  // store にも反映可能だがここはローカル更新
  props.position.slots[sIndex].blocks = newSlots;
};
</script>
