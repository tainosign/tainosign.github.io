<template>
  <ShiftContainer :item="slot" :list="slots" :foldedWidth="computeFoldedWidth">
    <template #header>
      <input v-model="slot.name" class="border rounded p-1 text-sm w-20" />
    </template>

    <template #body>
      <div class="flex">
        <!-- 左：時間メモリ -->
        <div v-if="!slot.folded" class="w-12 border-r text-xs pr-1">
          <div v-for="t in timeline" :key="t" class="h-4 flex items-center">
            <span v-if="t.endsWith('00')">{{ t }}</span>
            <span v-else class="opacity-30">─</span>
          </div>
        </div>

        <!-- メンバー一覧 -->
        <div v-if="!slot.folded" class="flex-1 flex flex-col gap-1 ml-2">
          <draggable v-model="slot.members" group="members" item-key="id" handle=".drag-handle">
            <template #item="{ element }">
              <ShiftMember :member="element" />
            </template>
          </draggable>
        </div>

        <!-- 折りたたみ時の簡易表示 -->
        <div v-else class="h-6 bg-blue-100 text-xs flex items-center justify-center">
          {{ slot.start }}〜{{ slot.end }}
        </div>
      </div>
    </template>
</ShiftContainer>
</template>

<script setup>
import { computed } from "vue";
import draggable from "vuedraggable";
import ShiftContainer from "./ShiftContainer.vue";
import ShiftMember from "./ShiftMember.vue";

const props = defineProps({
  slot: Object,
  slots: Array
});

// タイムライン 6:00〜20:00
const timeline = computed(() => {
  const list = [];
  for (let t = 6 * 60; t <= 20 * 60; t += 10) {
    const h = String(Math.floor(t / 60)).padStart(2, "0");
    const m = String(t % 60).padStart(2, "0");
    list.push(`${h}:${m}`);
  }
  return list;
});

// 折りたたみ時の幅を時間幅に応じて計算
const computeFoldedWidth = computed(() => {
  const startMin = parseTime(props.slot.start);
  const endMin = parseTime(props.slot.end);
  const ratio = (endMin - startMin) / (14 * 60); // 6:00〜20:00が100%
  return Math.max(50, ratio * 400); // 最小50px, 最大400px
});

function parseTime(str) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}
</script>
