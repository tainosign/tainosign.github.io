<template>
  <ShiftItemWrapper :item="slot" label="スロット">
    <div class="flex flex-col gap-2">
      <!-- ✅ 開始・終了時刻 -->
      <div class="flex gap-2 items-center">
        <label>開始:</label>
        <input type="time" v-model="slot.start" class="border rounded p-1 text-sm" />
        <label>終了:</label>
        <input type="time" v-model="slot.end" class="border rounded p-1 text-sm" />
      </div>

      <!-- ✅ タイムライン -->
      <div class="flex">
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

        <div class="flex-1 flex flex-col gap-1 ml-2">
          <draggable
            v-model="slot.members"
            handle=".drag-handle"
            item-key="id"
          >
            <template #item="{ element }">
              <div class="border rounded bg-green-50 p-1 flex items-center justify-between">
                <span>{{ element.name }}</span>
                <button
                  @click="$emit('remove-member', { slot, member: element })"
                  class="text-red-500"
                >×</button>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>
  </ShiftItemWrapper>
</template>

<script setup>
import { computed } from "vue"
import draggable from "vuedraggable"
import ShiftItemWrapper from "./ShiftItemWrapper.vue"

const props = defineProps({ slot: Object })

// ✅ 開始・終了時刻からタイムラインを生成
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
