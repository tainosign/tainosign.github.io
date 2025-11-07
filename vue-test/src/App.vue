<template>
  <div class="flex flex-col min-h-screen bg-gray-100 font-sans">
    <!-- ヘッダーコンテナ -->
    <HeaderContainer />

    <!-- メインメニュー -->
    <div class="main-content flex flex-col justify-start items-center flex-grow overflow-y-auto p-4">
      <div class="w-full max-w-xl flex flex-col gap-4 py-6">
        <MenuLink
          href="counterlocal.html"
          label="🟠 地域優先入場カウンター"
          colorClass="bg-orange-calc hover:bg-orange-500 text-white"
        />
        <MenuLink
          href="counter.html"
          label="🟢 入場口カウンター"
          colorClass="bg-green-in hover:bg-green-700 text-white"
        />
        <MenuLink
          href="counterout.html"
          label="🔴 出口カウンター"
          colorClass="bg-red-out hover:bg-red-700 text-white"
        />
        <MenuLink
          href="report.html"
          label="📝 トラブル等記録"
          colorClass="bg-yellow-report hover:bg-yellow-500 text-gray-800"
        />
        <MenuLink
          href="wait.html"
          label="🕒 待ち時間計算"
          colorClass="bg-blue-time hover:bg-slate-300 text-black"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import HeaderContainer from './components/HeaderContainer.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
  components: {
    HeaderContainer,
    MenuLink, // ← これを登録！
  },
});

</script>

<style>
.main-content .menu-link {
  transition: all 0.2s;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  border-radius: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  height: 6rem;
}
.main-content .menu-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}
</style>
