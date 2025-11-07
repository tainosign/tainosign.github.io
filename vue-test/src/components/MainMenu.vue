<template>
  <div class="main-content flex flex-col justify-start items-center p-4">
    <div class="w-full max-w-xl flex flex-col gap-4 py-6">
      <button
        @click="$emit('selectView', 'local')"
        class="menu-link bg-orange-calc hover:bg-orange-500 text-white p-8 rounded-2xl text-2xl font-bold flex justify-center items-center h-24"
      >
        🟠 地域優先入場カウンター
      </button>

      <button
        @click="$emit('selectView', 'entrance')"
        class="menu-link bg-green-in hover:bg-green-700 text-white p-8 rounded-2xl text-2xl font-bold flex justify-center items-center h-24"
      >
        🟢 入場口カウンター
      </button>

      <button
        @click="$emit('selectView', 'exit')"
        class="menu-link bg-red-out hover:bg-red-700 text-white p-8 rounded-2xl text-2xl font-bold flex justify-center items-center h-24"
      >
        🔴 出口カウンター
      </button>

      <!-- 追加: シフト管理ボタン -->
      <button
        @click="$emit('selectView', 'shift')"
        class="menu-link bg-blue-500 hover:bg-blue-700 text-white p-8 rounded-2xl text-2xl font-bold flex justify-center items-center h-24"
      >
        🟦 シフト管理
      </button>
    </div>
  </div>
</template>
