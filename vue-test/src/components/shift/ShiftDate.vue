<!-- vue-test/src/components/shift/ShiftDate.vue -->
<template>
  <ShiftItemWrapper
    :item="date"
    label="日付"
    @duplicate="$emit('duplicate', $event)"
    @remove="$emit('remove', $event)"
  >
    <div class="space-y-2">
      <div class="flex justify-between items-center">
        <label>日付選択：</label>
        <input type="date" v-model="date.date" class="border rounded px-2 py-1" />
        <button @click="$emit('add-team', date)" class="bg-green-500 text-white rounded px-3 py-1">＋チーム追加</button>
      </div>

      <!-- チーム一覧 -->
      <draggable
        v-model="date.teams"
        handle=".drag-handle"
        item-key="id"
        class="flex flex-wrap gap-2"
      >
        <template #item="{ element }">
          <ShiftTeam
            :team="element"
            @duplicate="$emit('duplicate-team', { date, team: element })"
            @remove="$emit('remove-team', { date, team: element })"
          />
        </template>
      </draggable>
    </div>
  </ShiftItemWrapper>
</template>

<script setup>
import draggable from "vuedraggable"
import ShiftTeam from "./ShiftTeam.vue"
import ShiftItemWrapper from "./ShiftItemWrapper.vue"

defineProps({
  date: Object
})
defineEmits(["duplicate", "remove", "add-team", "duplicate-team", "remove-team"])
</script>
