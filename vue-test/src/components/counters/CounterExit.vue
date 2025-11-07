<template>
  <CounterLayout>
    <div class="main-content flex flex-col items-center">
        <div class="w-full max-w-xl flex flex-col gap-2 py-2">

            <!-- 🔴 -1（退場） -->
            <button @click="handleCount('out', 1)"
                    class="counter-button large-counter-button w-full bg-red-out text-white rounded-2xl hover:bg-red-700 p-8 flex items-center justify-center font-bold text-[8rem]">
                -1
            </button>

            <!-- -5 / -10 -->
            <div class="flex space-x-4">
                <button @click="handleCount('out', 5)"
                        class="counter-button small-counter-button flex-1 bg-gray-500 text-white rounded-2xl hover:bg-gray-600 p-6 flex items-center justify-center font-bold text-7xl">
                    -5
                </button>
                <button @click="handleCount('out', 10)"
                        class="counter-button small-counter-button flex-1 bg-gray-500 text-white rounded-2xl hover:bg-gray-600 p-6 flex items-center justify-center font-bold text-7xl">
                    -10
                </button>
            </div>

            <!-- 🟠 出口入場 +1 -->
            <button @click="handleCount('exitin', 1)"
                    class="counter-button small-counter-button w-full bg-orange-calc text-white rounded-2xl hover:bg-orange-500 p-6 flex items-center justify-center font-bold text-4xl">
                出口入場 +1
            </button>
        </div>
    </div>
  </CounterLayout>
</template>

<script setup>
import { onMounted } from "vue";
import CounterLayout from "@/components/layouts/CounterLayout.vue";
import { setupCounter, logCount } from "@/composables/counter-logic.js";

onMounted(async () => {
  await setupCounter("setapanmarketcounter");
});

function handleCount(type, value) {
  logCount(type, value, "setapanmarketcounter");
}
</script>
