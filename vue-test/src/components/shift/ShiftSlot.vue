<template>
  <ShiftItemWrapper
    :item="slot"
    label="スロット"
    @duplicate="$emit('duplicate', slot)"
    @remove="$emit('remove', slot)"
  >
    <div class="flex">
      <!-- 左：時間メモリ -->
      <div class="w-12 border-r text-xs pr-1">
        <div v-for="(t, i) in timeline" :key="i" class="h-4 flex items-center">
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
            <div class="border rounded bg-green-50 p-1 flex items-center justify-between">
              <span>{{ element.name }}</span>
              <button @click="$emit('remove-member', { slot, member: element })" class="text-red-500">×</button>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </ShiftItemWrapper>
</template>

<script setup>
import { ref } from "vue"
import draggable from "vuedraggable"
import ShiftItemWrapper from "./ShiftItemWrapper.vue"

defineProps({ slot: Object })
defineEmits(["duplicate", "remove", "remove-member"])

const timeline = ref([])
for (let h = 9; h <= 17; h++) {
  for (let m = 0; m < 60; m += 10) {
    timeline.value.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
  }
}
</script>
