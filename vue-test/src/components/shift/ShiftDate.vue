<template>
  <div class="p-2 space-y-2">
    <ShiftContainer
      :item="shift"
      type="shift"
      :containerWidth="calcWidth"
      :context="{ date: shift.date }"
      @duplicate="onDuplicate"
      @remove="onRemove"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <span class="font-bold">{{ shift.date }}</span>
          <button
            @click="addTeam(shift.date)"
            class="bg-green-500 text-white text-xs px-2 py-1 rounded"
          >
            ＋チーム
          </button>
        </div>
      </template>

      <template #body>
        <div class="flex gap-2">
          <div
            v-for="team in shift.teams"
            :key="team.id"
            class="flex-shrink-0"
            :style="{ width: teamWidth + 'px' }"
          >
            <ShiftTeam
              :team="team"
              :shift-date="shift.date"
              @duplicate="onTeamDuplicate"
              @remove="onTeamRemove"
            />
          </div>
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
  shift: Object,
});

const store = useShiftStore();

// 新規チームを追加（storeの addTeam を使う）
const addTeam = (date) => {
  store.addTeam(date);
};

// 親が ShiftContainer の duplicate/remove を受けて実行
const onDuplicate = ({ item, type, context }) => {
  // shift-level duplicate: 複製は store 側の duplicateTeam/duplicatePosition では無いので
  // here we duplicate the shift object (insert new shift with same data)
  const existing = store.shifts.find((s) => s.id === item.id);
  if (!existing) return;
  const copy = structuredClone(existing);
  copy.id = `${copy.date}-${Date.now()}`;
  store.shifts.push(copy);
};

const onRemove = ({ item }) => {
  // remove entire shift
  store.shifts = store.shifts.filter((s) => s.id !== item.id);
};

// team-level handlers (bubbled from ShiftTeam)
const onTeamDuplicate = ({ team, shiftDate }) => {
  store.duplicateTeam(shiftDate, team.id);
};
const onTeamRemove = ({ team, shiftDate }) => {
  store.removeTeam(shiftDate, team.id);
};

// 幅計算：チーム数 / 最大スロット数 によって決める（簡易）
// 1チームあたりの幅（px）
const teamWidth = 360; // デフォルト幅（必要なら調整）
const calcWidth = computed(() => {
  // 親 shift コンテナ全体の幅をチーム数 * teamWidth にする（最大で 1200px くらい）
  const count = (props.shift?.teams?.length) || 1;
  return Math.min(1200, count * teamWidth);
});
</script>
