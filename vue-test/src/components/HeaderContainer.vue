<template>
  <header class="w-full bg-white shadow-md p-4 flex justify-between items-center">
    <h1 class="text-xl font-bold">メインメニュー</h1>
    <img src="/qr.png" alt="QRコード" class="h-10 w-10" />
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HeaderContainer',
});
</script>

<style scoped>
</style>
