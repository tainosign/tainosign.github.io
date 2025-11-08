<template>
  <ShiftContainer :item="slot" :list="slots">
    <template #header>
      <input v-model="slot.name" class="border rounded p-1 text-sm w-20" />
    </template>

    <template #body>
      <div class="flex">
        <!-- 時間メモリ -->
        <div class="w-12 border-r text-xs pr-1">
          <div v-for="t in timeline" :key="t" class="h-4 flex items-center">
            <span v-if="t.endsWith('00')">{{ t }}</span>
            <span v-else class="opacity-30">─</span>
          </div>
        </div>

        <!-- メンバー一覧 -->
        <div class="flex-1 flex flex-col gap-1 ml-2">
          <draggable v-model="slot.members" group="members" item-key="id" handle=".drag-handle">
            <template #item="{ element }">
              <ShiftMember :member="element" />
            </template>
          </draggable>
        </div>
      </div>
    </ShiftContainer>
</template>

<script setup>
import { computed } from "vue";
import draggable from "vuedraggable";
import ShiftContainer from "./ShiftContainer.vue";
import ShiftMember from "./ShiftMember.vue";

const props = defineProps({
  slot: Object,
  slots: Array,
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
</script>
