<template>
  <div class="p-2">
    <!-- 複数日付の読み込み・保存 -->

    <!-- 各日付のシフト一覧 -->
    <div v-for="shift in shiftStore.shifts" :key="shift.date" class="mb-4">
      <ShiftContainer :item="shift" :list="shiftStore.shifts">
        <!-- ヘッダー -->
        <template #header>
          <div class="flex items-center gap-2">
            <span class="font-bold">{{ shift.date }}</span>
            <button
              @click="addTeam(shift)"
              class="bg-green-500 text-white text-xs px-2 py-1 rounded"
            >
              ＋チーム
            </button>
          </div>
        </template>

        <!-- ボディ -->
        <template #body>
          <ScrollableRow>
            <ShiftTeam
              v-for="team in shift.teams"
              :key="team.id"
              :team="team"
              :teams="shift.teams"
            />
          </ScrollableRow>
        </template>
      </ShiftContainer>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useShiftStore } from "@/stores/shiftStore";
import ShiftContainer from "./ShiftContainer.vue";
import ShiftTeam from "./ShiftTeam.vue";
import ScrollableRow from "../common/ScrollableRow.vue";
import { createTeam, createShift } from "@/models/shiftModel";

const shiftStore = useShiftStore();
const newDate = ref("");

// チーム追加
const addTeam = (shift) => {
  shift.teams.push(createTeam());
};


</script>
