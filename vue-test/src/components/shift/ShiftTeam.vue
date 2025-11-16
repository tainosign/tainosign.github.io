<!-- src/components/shift/ShiftTeam.vue -->
<template>
  <ShiftContainer :item="team" :list="[teamWrapper]" type="team" :maxWidth="teamWidth">
    <template #header>
      <div class="flex items-center gap-2">
        <input
          v-model="team.name"
          placeholder="チーム名"
          class="border rounded px-2 py-1 text-sm w-full"
        />
        <button
          @click.stop="addPosition"
          class="bg-blue-500 text-white text-xs px-2 py-1 rounded"
        >
          ＋ポジション
        </button>
      </div>
    </template>

    <template #body>
      <!-- positions 横並び。増えれば横スクロール -->
      <div class="flex gap-3 overflow-x-auto py-2" :style="{ alignItems: 'flex-start' }">
        <ShiftPosition
          v-for="position in team.positions"
          :key="position.positionId"
          :shift-date="shiftDate"
          :team-id="team.id"
          :position="position"
          :maxWidth="positionWidth"
        />
      </div>
    </template>
  </ShiftContainer>
</template>

<script setup>
import { computed } from "vue";
import ShiftContainer from "./ShiftContainer.vue";
import ShiftPosition from "./ShiftPosition.vue";
import { useShiftStore } from "@/stores/shiftStore";

const props = defineProps({
  team: Object,
  shiftDate: String,
  // parent can pass available width; else we compute
  parentWidth: { type: Number, default: null },
  maxWidth: { type: String, default: null },
});

const store = useShiftStore();

// wrapper to keep expected list[0].date for ShiftContainer store ops
const teamWrapper = computed(() => ({ ...props.team, date: props.shiftDate }));

const addPosition = () => {
  store.addPosition(props.shiftDate, props.team.id);
};

// 幅計算：チームは親幅の半分（あなたの指定式に沿って近似）
const teamWidth = computed(() => {
  // If parent passed CSS maxWidth string, use it; otherwise fallback to calc
  if (props.maxWidth) return props.maxWidth;
  // Use calc to allow padding/margin room; user asked formula -> we approximate with calc
  return "calc((100% - 24px) / 2)"; // 24px は想定 padding+margin。調整可。
});

// Position 幅（内側でさらに調整）
const positionWidth = computed(() => {
  // make position slightly smaller than team container
  return "calc( ( " + teamWidth.value + " ) - 20px )";
});
</script>

<style scoped>
/* 親の overflow に合わせた見た目 */
</style>
