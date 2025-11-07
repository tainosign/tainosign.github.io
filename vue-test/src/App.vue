<template>
  <div class="flex flex-col min-h-screen bg-gray-100 font-sans">
    <Header />
    <main class="flex-grow overflow-y-auto">
      <MainMenu />
    </main>
  </div>
</template>

<script setup>
import Header from "@/components/Header.vue";
import MainMenu from "@/components/MainMenu.vue";
</script>
