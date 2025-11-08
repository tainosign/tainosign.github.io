<template>
  <ShiftItemWrapper
    :item="position"
    :label="position.name"
    @duplicate="$emit('duplicate', position)"
    @remove="$emit('remove', position)"
  >
    <div class="flex flex-col gap-2">
      <!-- ✅ ポジション名編集 -->
      <input v-model="position.name" class="border rounded p-1 text-sm w-28" />

      <div class="flex flex-row gap-2">
        <button @click="addSlot(position)" class="bg-yellow-500 text-white rounded px-2 py-1 text-sm">
          ＋スロット追加
        </button>

        <draggable
          v-model="position.slots"
          handle=".drag-handle"
          item-key="id"
          class="flex flex-row gap-2 overflow-x-auto"
        >
          <template #item="{ element }">
            <ShiftSlot :slot="element" />
          </template>
        </draggable>
      </div>
    </div>
  </ShiftItemWrapper>
</template>

<script setup>
import draggable from "vuedraggable"
import ShiftSlot from "./ShiftSlot.vue"
import ShiftItemWrapper from "./ShiftItemWrapper.vue"

defineProps({ position: Object })
defineEmits(["duplicate", "remove", "add-slot"])

const addSlot = (position) => {
  position.slots.push({
    id: Date.now(),
    start: "09:00",
    end: "17:00",
    members: []
  })
}
</script>
