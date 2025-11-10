<template>
  <div>
    <Header v-if="currentView !== 'shift'" />

    <main class="p-4">
      <!-- メニュー -->
      <MainMenu v-if="currentView === 'menu'" @selectView="currentView = $event" />

      <!-- メニュー内のテストメンバー登録ボタン -->
      <div v-if="currentView === 'menu'" class="mt-4">
        <router-link
          to="/test-members"
          class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          テストメンバー登録
        </router-link>
      </div>

      <!-- カウンター画面 -->
      <CounterEntrance v-if="currentView === 'entrance'" @back="currentView = 'menu'" />
      <CounterLocal v-if="currentView === 'local'" @back="currentView = 'menu'" />
      <CounterExit v-if="currentView === 'exit'" @back="currentView = 'menu'" />

      <!-- シフト管理画面 -->
      <ShiftCreateView v-if="currentView === 'shift'" @back="currentView = 'menu'" />

      <!-- ルーター表示 -->
      <router-view />
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
