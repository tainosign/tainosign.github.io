<template>
  <div>
    <!-- ヘッダーは currentView が shift の場合は非表示 -->
    <Header v-if="currentView !== 'shift'" />

    <main>
      <!-- メニュー -->
      <MainMenu v-if="currentView === 'menu'" @selectView="currentView = $event" />

      <!-- カウンター画面 -->
      <CounterEntrance v-if="currentView === 'entrance'" @back="currentView = 'menu'" />
      <CounterLocal v-if="currentView === 'local'" @back="currentView = 'menu'" />
      <CounterExit v-if="currentView === 'exit'" @back="currentView = 'menu'" />

      <!-- シフト管理画面 -->
      <ShiftCreateView v-if="currentView === 'shift'" @back="currentView = 'menu'" />
      <router-link to="/test-members" class="px-2 py-1 bg-gray-200 rounded">
  テスト登録
</router-link>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Header from "@/components/Header.vue";
import MainMenu from "@/components/MainMenu.vue";
import CounterEntrance from "@/components/counters/CounterEntrance.vue";
import CounterLocal from "@/components/counters/CounterLocal.vue";
import CounterExit from "@/components/counters/CounterExit.vue";
import ShiftCreateView from "@/views/ShiftCreateView.vue";

const currentView = ref("menu");
</script>
