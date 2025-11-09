<template>
  <ShiftContainer
    :item="slot"
    :list="slots"
  >
    <template #header>
      <input
        v-model="slot.name"
        class="border rounded p-1 text-sm w-24"
        placeholder="スロット名"
      />
    </template>

    <template #body>
      <!-- スロット本体：縦方向に時間を持つ -->
      <div class="relative border h-[840px] bg-gray-50 overflow-hidden rounded">
        <!-- 時間目盛り -->
        <div
          v-for="(t, i) in timeLabels"
          :key="i"
          class="absolute left-0 right-0 border-t border-gray-300 text-[10px] text-gray-500"
          :style="{ top: `${(i / (timeLabels.length - 1)) * 100}%` }"
        >
          <span class="absolute left-1 -top-2">{{ t }}</span>
        </div>

        <!-- ここに後でメンバーコンポーネントを配置予定 -->
        <div class="absolute inset-0">
          <!-- 例：<ShiftMember ... /> を将来配置 -->
        </div>
      </div>
    </template>
  </ShiftContainer>
</template>

<script setup>
import { computed } from "vue";
import ShiftContainer from "./ShiftContainer.vue";

const props = defineProps({
  slot: Object,
  slots: Array,
});

// 時間ラベル（6:00〜20:00まで1時間ごと）
const timeLabels = computed(() => {
  const times = [];
  for (let h = 6; h <= 20; h++) {
    times.push(`${String(h).padStart(2, "0")}:00`);
  }
  return times;
});
</script>
