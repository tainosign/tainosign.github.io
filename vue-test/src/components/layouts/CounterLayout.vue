<template>
  <div class="bg-gray-100 min-h-screen flex flex-col">
    <Header />

    <main class="flex-grow flex flex-col justify-start items-center">
      <slot /> <!-- 👈 各カウンター画面の中身がここに入る -->
    </main>

    <Footer />
  </div>
</template>

<script setup>
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
</script>

<style scoped>
html, body {
  touch-action: manipulation;
  -ms-touch-action: manipulation;
}
button, .counter-button {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
button {
  -webkit-touch-callout: none;
}
.large-counter-button { height: 32vh; min-height: 200px; }
.small-counter-button { height: 20vh; min-height: 120px; }
</style>
