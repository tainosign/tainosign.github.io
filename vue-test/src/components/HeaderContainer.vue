<template>
  <header class="bg-gray-200 p-4 flex justify-between items-center">
    <h1>{{ title }}</h1>
    <nav>
      <a href="/index.html" class="mr-2">ホーム</a>
      <a href="/counter.html">カウンター</a>
    </nav>
  </header>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: 'ヘッダー' }
})
</script>

<style scoped>
header { font-weight: bold; }
</style>
