<template>
  <div class="p-4">
    <div class="flex space-x-2 overflow-x-auto mb-2">
      <ShiftDate
        v-for="date in shiftDates"
        :key="date.id"
        :date="date.id"
        :timeRange="date.timeRange"
        :teams="date.teams"
        @copy-date="copyDate"
        @delete-date="deleteDate"
        @add-team="addTeam"
        @copy-team="copyTeam"
        @delete-team="deleteTeam"
        @add-position="addPosition"
        @copy-position="copyPosition"
        @delete-position="deletePosition"
        @add-slot="addSlot"
      />
      <button @click="addDate" class="bg-green-500 text-white px-3 py-1 rounded self-start">
        日付追加
      </button>
    </div>
  </div>
</template>

<script setup>
import ShiftDate from "@/components/shift/ShiftDate.vue";
import { reactive } from "vue";

const shiftDates = reactive([
  {
    id: "2025-11-07",
    timeRange: { start: "06:00", end: "20:00" },
    teams: []
  }
]);

function addDate() {
  const newId = `2025-11-${shiftDates.length + 7}`;
  shiftDates.push({ id: newId, timeRange: { start: "06:00", end: "20:00" }, teams: [] });
}

function copyDate(dateId) { console.log("copyDate", dateId) }
function deleteDate(dateId) { console.log("deleteDate", dateId) }
function addTeam(dateId) { console.log("addTeam", dateId) }
function copyTeam(teamId, dateId) { console.log("copyTeam", teamId, dateId) }
function deleteTeam(teamId, dateId) { console.log("deleteTeam", teamId, dateId) }
function addPosition(teamId, dateId) { console.log("addPosition", teamId, dateId) }
function copyPosition(positionId, teamId, dateId) { console.log("copyPosition", positionId, teamId, dateId) }
function deletePosition(positionId, teamId, dateId) { console.log("deletePosition", positionId, teamId, dateId) }
function addSlot(positionId, teamId, dateId) { console.log("addSlot", positionId, teamId, dateId) }
</script>
