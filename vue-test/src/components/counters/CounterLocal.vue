<template>
  <CounterLayout>
    <div class="w-full max-w-xl flex flex-col gap-2 py-2">
      <button @click="handleCount('localin', 1)" class="counter-button large-counter-button w-full bg-orange-500 hover:bg-orange-600 text-white rounded-2xl p-8 text-6xl font-bold">+1</button>
      <div class="flex space-x-4">
        <button @click="handleCount('localin', 5)" class="counter-button small-counter-button flex-1 bg-gray-500 text-white rounded-2xl hover:bg-gray-600 p-6 font-bold text-6xl">+5</button>
        <button @click="handleCount('localin', 10)" class="counter-button small-counter-button flex-1 bg-gray-500 text-white rounded-2xl hover:bg-gray-600 p-6 font-bold text-6xl">+10</button>
      </div>
    </div>
  </CounterLayout>
</template>

<script setup>
import CounterLayout from "@/components/layouts/CounterLayout.vue";
import { setupCounter, logCount } from "@/composables/counter-logic.js";
await setupCounter("setapanmarketcounter");

function handleCount(type, value) {
  logCount(type, value, "setapanmarketcounter");
}
</script>
