<template>
  <div class="p-3 my-2 border rounded-lg bg-gray-50">
    <div class="flex justify-between items-center mb-2">
      <h4 class="font-semibold text-gray-700">
        チーム: {{ team.name || team.teamId }}
      </h4>
      <button
        @click="addPosition"
        class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-sm"
      >
        + ポジション
      </button>
    </div>

    <p v-if="positions.length === 0" class="text-gray-400 text-sm">
      まだポジションがありません
    </p>

    <ShiftPosition
      v-for="position in positions"
      :key="position.positionId"
      :date-id="dateId"
      :team-id="team.teamId"
      :position="position"
      @update="updatePosition"
      @delete="deletePosition"
    />
  </div>
</template>

<script setup>
import
