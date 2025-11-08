<template>
  <div class="flex gap-2 items-center mb-3">
    <input type="date" v-model="selectedDate" class="border rounded p-1" />
    <button @click="addShift(selectedDate)" class="bg-blue-500 text-white px-2 py-1 rounded">日付追加</button>
    <button @click="saveToLocal" class="bg-green-500 text-white px-2 py-1 rounded">保存</button>
    <button @click="loadFromLocal" class="bg-gray-300 px-2 py-1 rounded">読込</button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useShiftStore } from "@/stores/shiftStore";
import { getJSTDateString } from "@/composables/useJST.js"; // 任意

const store = useShiftStore();
const selectedDate = ref(new Date().toISOString().split("T")[0]);

const addShift = (date) => store.addShift(date);
const saveToLocal = () => store.saveToLocal();
const loadFromLocal = () => store.loadFromLocal();
</script>
