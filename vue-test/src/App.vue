<template>
  <div>
    <Header />

    <main>
      <MainMenu v-if="currentView === 'menu'" @selectView="currentView = $event" />
      <CounterEntrance v-if="currentView === 'entrance'" @back="currentView = 'menu'" />
      <CounterLocal v-if="currentView === 'local'" @back="currentView = 'menu'" />
      <CounterExit v-if="currentView === 'exit'" @back="currentView = 'menu'" />
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Header from "@/components/Header.vue";
import MainMenu from "@/components/MainMenu.vue";
import CounterEntrance from "@/components/CounterEntrance.vue";
import CounterLocal from "@/components/CounterLocal.vue";
import CounterExit from "@/components/CounterExit.vue";

const currentView = ref("menu");
</script>
