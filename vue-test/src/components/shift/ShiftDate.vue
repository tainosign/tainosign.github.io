<template>
  <ShiftItemWrapper
    showAdd
    addLabel="チーム追加"
    @copy="$emit('copy-date', date)"
    @delete="$emit('delete-date', date)"
    @add="$emit('add-team', date)"
  >
    <template #content>
      <div class="flex items-center space-x-2">
        <span class="font-bold">{{ date }}</span>
        <span class="text-sm text-gray-600">{{ timeRange.start }}〜{{ timeRange.end }}</span>
      </div>
    </template>

    <div class="flex space-x-2 mt-1">
      <ShiftTeam
        v-for="team in teams"
        :key="team.id"
        :team="team"
        @copy-team="$emit('copy-team', team.id, date)"
        @delete-team="$emit('delete-team', team.id, date)"
        @add-position="$emit('add-position', team.id, date)"
        @copy-position="$emit('copy-position', $event, team.id, date)"
        @delete-position="$emit('delete-position', $event, team.id, date)"
        @add-slot="$emit('add-slot', $event, team.id, date)"
      />
    </div>
  </ShiftItemWrapper>
</template>

<script setup>
import ShiftItemWrapper from "./ShiftItemWrapper.vue";
import ShiftTeam from "./ShiftTeam.vue";
import { defineProps } from "vue";

const props = defineProps({
  date: String,
  timeRange: Object,
  teams: Array
});
</script>
