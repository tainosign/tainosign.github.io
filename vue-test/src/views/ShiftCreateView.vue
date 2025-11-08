<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-3">シフト作成</h2>

    <ShiftToolbar />

    <div class="flex flex-wrap gap-4">
      <ShiftDate v-for="shift in store.shifts" :key="shift.id" :shift="shift" :shifts="store.shifts" />
    </div>
  </div>
</template>

<script setup>
import { useShiftStore } from "@/stores/shiftStore";
import ShiftDate from "@/components/shift/ShiftDate.vue";
import ShiftToolbar from "@/components/shift/ShiftToolbar.vue";

const store = useShiftStore();
</script>
