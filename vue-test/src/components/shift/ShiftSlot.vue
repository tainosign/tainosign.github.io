<template>
  <div class="border rounded p-2 bg-gray-50 mb-2">
    <div class="flex gap-2 items-center mb-2">
      <label>開始:</label>
      <input type="time" v-model="slot.start" class="border rounded p-1 text-sm" />
      <label>終了:</label>
      <input type="time" v-model="slot.end" class="border rounded p-1 text-sm" />
    </div>

    <draggable v-model="slot.members" item-key="id" class="flex flex-col gap-1">
      <template #item="{ element }">
        <ShiftMember :member="element" />
      </template>
    </draggable>

    <button
      @click="addMember"
      class="bg-yellow-400 text-white px-2 py-1 text-xs rounded mt-2"
    >
      メンバー追加
    </button>
  </div>
</template>

<script setup>
import draggable from "vuedraggable"
import ShiftMember from "./ShiftMember.vue"

const props = defineProps({ slot: Object })

function addMember() {
  props.slot.members.push({
    id: Date.now() + Math.random(),
    name: "新メンバー",
  })
}
</script>
