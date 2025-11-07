<template>
  <ShiftItemWrapper
    showAdd
    addLabel="ポジション追加"
    @copy="$emit('copy-team', team.id)"
    @delete="$emit('delete-team', team.id)"
    @add="$emit('add-position', team.id)"
  >
    <template #content>
      <input type="text" v-model="team.name" class="border px-1 py-1 rounded w-full">
    </template>

    <div class="flex space-x-2 mt-1">
      <ShiftPosition
        v-for="pos in team.positions"
        :key="pos.id"
        :position="pos"
        @copy-position="$emit('copy-position', pos.id, team.id)"
        @delete-position="$emit('delete-position', pos.id, team.id)"
        @add-slot="$emit('add-slot', pos.id, team.id)"
      />
    </div>
  </ShiftItemWrapper>
</template>

<script setup>
import ShiftItemWrapper from "./ShiftItemWrapper.vue";
import ShiftPosition from "./ShiftPosition.vue";
import { defineProps } from "vue";

const props = defineProps({
  team: Object
});
</script>
