<template>
  <CounterLayout>
    <div class="w-full max-w-xl flex flex-col gap-2 py-2">
      <button @click="handleCount('in', 1)" class="counter-button large-counter-button w-full bg-green-in hover:bg-green-700 text-white rounded-2xl p-8 text-6xl font-bold" :disabled="!ready">+1</button>
      <div class="flex space-x-4">
        <button @click="handleCount('in', 5)" class="counter-button small-counter-button flex-1 bg-gray-500 text-white rounded-2xl hover:bg-gray-600 p-6 flex items-center justify-center font-bold text-6xl">+5</button>
        <button @click="handleCount('in', 10)" class="counter-button small-counter-button flex-1 bg-gray-500 text-white rounded-2xl hover:bg-gray-600 p-6 flex items-center justify-center font-bold text-6xl">+10</button>
      </div>
    </div>
  </CounterLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { setupCounter, logCount } from "@/composables/counter-logic.js";

const ready = ref(false);

onMounted(async () => {
  await setupCounter("setapanmarketcounter");
  ready.value = true;
});

function handleCount(type, value) {
  if (!ready.value) return; // db が準備できるまで無視
  logCount(type, value, "setapanmarketcounter");
}
</script>
