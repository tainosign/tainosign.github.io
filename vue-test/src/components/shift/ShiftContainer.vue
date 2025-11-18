<template>
  <div class="shift-container">
    <!-- 日付 / チーム / ポジションを縦並びで追加 -->
    <div class="info-column">
      <ShiftDate
        v-for="(d, i) in dates"
        :key="'date-' + i"
        :date="d"
      />

      <ShiftTeam
        v-for="(t, i) in teams"
        :key="'team-' + i"
        :team="t"
      />

      <ShiftPosition
        v-for="(p, i) in positions"
        :key="'pos-' + i"
        :position="p"
      />
    </div>

    <!-- スロットを配置するタイムライン -->
    <div class="timeline-container">

      <!-- 時間メモリ（下部に表示） -->
      <div class="timeline-scale">
        <div
          v-for="h in hourLabels"
          :key="h"
          class="scale-item"
          :style="{ width: hourWidth + 'px' }"
        >
          {{ h }}
        </div>
      </div>

      <!-- スロット本体 -->
      <div class="slots-area">
        <ShiftSlot
          v-for="slot in slots"
          :key="slot.id"
          :slot="slot"
          :hourWidth="hourWidth"
          @delete="deleteSlot(slot.id)"
          @copy="copySlot(slot)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import ShiftDate from "./ShiftDate.vue";
import ShiftTeam from "./ShiftTeam.vue";
import ShiftPosition from "./ShiftPosition.vue";
import ShiftSlot from "./ShiftSlot.vue";

const hourWidth = 36;

// 表示したい時間帯（06〜20）
const hourLabels = Array.from({ length: 15 }, (_, i) => String(i + 6).padStart(2, '0'));

const dates = ["2025-11-20"];
const teams = ["Aチーム", "Bチーム"];
const positions = ["ポジション1", "ポジション2"];

// デモ用スロット
const slots = [
  {
    id: 1,
    start: 7,
    end: 10,
    label: "メンバーA"
  },
  {
    id: 2,
    start: 12,
    end: 16,
    label: "メンバーB"
  }
];

const deleteSlot = (id) => {
  const index = slots.findIndex(s => s.id === id);
  if (index >= 0) slots.splice(index, 1);
};

const copySlot = (slot) => {
  const newSlot = {
    ...slot,
    id: Date.now()
  };
  slots.push(newSlot);
};
</script>

<style scoped>
.shift-container {
  display: flex;
  gap: 16px;
}

.info-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-container {
  width: calc(36px * 15); /* 06〜20 →15時間 */
}

.timeline-scale {
  display: flex;
  border-bottom: 1px solid #ccc;
}

.scale-item {
  text-align: center;
  font-size: 12px;
  border-left: 1px solid #ddd;
}

.slots-area {
  position: relative;
  height: 300px;
}
</style>
