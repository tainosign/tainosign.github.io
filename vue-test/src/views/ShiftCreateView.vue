<template>
  <div class="p-4 space-y-4">
    <!-- 日付追加コントロール -->
    <div class="flex items-center gap-2">
      <input v-model="selectedDate" type="date" class="border p-2 rounded" />
      <button
        @click="addDate"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        日付を追加
      </button>
    </div>

    <!-- 日付コンポーネントを横に表示 -->
    <div class="flex flex-wrap gap-4 overflow-x-auto">
      <ShiftDate
        v-for="(dateItem, dIndex) in dates"
        :key="dIndex"
        :date="dateItem"
        @remove="removeDate(dIndex)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import ShiftDate from "@/components/shift/ShiftDate.vue";
import { getJSTDateString } from "@/composables/useJST";

const selectedDate = ref(getJSTDateString());
const dates = ref([]);

// 日付追加
const addDate = () => {
  if (!selectedDate.value) return;
  dates.value.push({
    id: Date.now(),
    date: selectedDate.value,
    teams: [],
  });
};

// 日付削除
const removeDate = (index) => {
  dates.value.splice(index, 1);
};
</script>
