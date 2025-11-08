<template>
  <ShiftItemWrapper
    :item="slot"
    label="スロット"
    :showDuplicate="true"
    :showRemove="true"
    :showDrag="true"
    :showLock="true"
    @duplicate="$emit('duplicate', slot)"
    @remove="$emit('remove', slot)"
  >
    <div class="flex">
      <!-- 左：時間メモリ -->
      <div class="w-12 border-r text-xs pr-1">
        <div
          v-for="(t, i) in timeline"
          :key="i"
          class="h-4 flex items-center"
        >
          <span v-if="t.endsWith('00')">{{ t }}</span>
          <span v-else class="opacity-30">─</span>
        </div>
      </div>

      <!-- 右：メンバー一覧 -->
      <div class="flex-1 flex flex-col gap-1 ml-2">
        <draggable
          v-model="slot.members"
          handle=".drag-handle"
          item-key="id"
        >
          <template #item="{ element }">
            <ShiftMember :member="element" />
          </template>
        </draggable>
      </div>
    </div>
  </ShiftItemWrapper>
</template>

<script setup>
import { computed } from "vue"
import draggable from "vuedraggable"
import ShiftItemWrapper from "./ShiftItemWrapper.vue"
import ShiftMember from "./ShiftMember.vue"

const props = defineProps({ slot: Object })

// 10分単位タイムライン生成
const timeline = computed(() => {
  const list = []
  const start = parseTime(props.slot.start)
  const end = parseTime(props.slot.end)
  for (let t = start; t <= end; t += 10) {
    const h = String(Math.floor(t / 60)).padStart(2, "0")
    const m = String(t % 60).padStart(2, "0")
    list.push(`${h}:${m}`)
  }
  return list
})

function parseTime(str) {
  const [h, m] = str.split(":").map(Number)
  return h * 60 + m
}
</script>
