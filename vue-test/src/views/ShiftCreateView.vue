<!-- vue-test/src/views/ShiftCreateView.vue -->
<template>
  <div class="relative p-4 h-screen overflow-hidden">
    <h2 class="text-xl font-bold mb-3">シフト作成</h2>

    <!-- ツールバー -->
    <ShiftToolbar />

    <!-- シフト全体 -->
    <ScrollableRow>
      <ShiftDate
        v-for="shift in store.shifts"
        :key="shift.id"
        :shift="shift"
        :shifts="store.shifts"
      />
    </ScrollableRow>

    <!-- メンバーパネルとトグルボタン -->
    <MemberPanelToggle />
  </div>
</template>

<script setup>
import { useShiftStore } from "@/stores/shiftStore";
import ShiftDate from "@/components/shift/ShiftDate.vue";
import ShiftToolbar from "@/components/shift/ShiftToolbar.vue";
import ScrollableRow from "@/components/common/ScrollableRow.vue";
import MemberPanelToggle from "@/components/shift/MemberPanelToggle.vue"; // ←ここを追加！

const store = useShiftStore();
</script>
