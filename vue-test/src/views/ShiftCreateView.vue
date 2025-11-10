<!-- vue-test/src/views/ShiftCreateView.vue -->
<template>
  <div class="relative p-4 h-screen overflow-hidden">
    <h2 class="text-xl font-bold mb-3">シフト作成</h2>

    <!-- ローディング表示 -->
    <div v-if="store.isLoading" class="text-gray-500">読み込み中...</div>

    <!-- ツールバー -->
    <ShiftToolbar v-else />

    <!-- シフト全体 -->
    <ScrollableRow v-if="!store.isLoading">
      <ShiftDate
        v-for="shift in store.shifts"
        :key="shift.id"
        :shift="shift"
        :shifts="store.shifts"
      />
    </ScrollableRow>

    <!-- メンバーパネルとトグルボタン -->
    <MemberPanelToggle v-if="!store.isLoading" />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useShiftStore } from "@/stores/shiftStore";
import ShiftDate from "@/components/shift/ShiftDate.vue";
import ShiftToolbar from "@/components/shift/ShiftToolbar.vue";
import ScrollableRow from "@/components/common/ScrollableRow.vue";
import MemberPanelToggle from "@/components/shift/MemberPanelToggle.vue";

const store = useShiftStore();

// 画面描画時に Firestore からシフトとメンバーを取得
onMounted(async () => {
  try {
    await store.init(); // ← initRealtimeSync() ではなく init() に変更
  } catch (e) {
    console.error("シフト初期化エラー:", e);
  }
});
</script>
