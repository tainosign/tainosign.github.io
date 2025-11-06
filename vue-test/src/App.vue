<template>
  <div>
    <HeaderContainer :title="'来場者カウンター'" />
    <main class="p-4">
      <button @click="increment">カウント +1</button>
      <p>現在のカウント: {{ count }}</p>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import HeaderContainer from './components/HeaderContainer.vue'

const count = ref(0)
const increment = () => { count.value++ }
</script>

<style>
main { background: #f9f9f9; }
</style>
