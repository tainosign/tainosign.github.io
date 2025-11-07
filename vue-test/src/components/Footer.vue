<template>
  <footer class="p-4 bg-gray-200 text-gray-700 border-t border-gray-300">
    <button
      @click="$emit('back')"
      class="block w-full text-center bg-gray-400 hover:bg-gray-500 py-3 rounded-lg shadow-md text-white font-semibold text-lg"
    >
      メニューへ戻る
    </button>
  </footer>
</template>
