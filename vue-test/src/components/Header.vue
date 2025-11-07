<template>
  <header class="bg-cyan-view text-white p-1 flex-shrink-0 z-10 shadow">
    <div class="max-w-4xl mx-auto flex justify-between items-start space-x-4">
      <!-- QR -->
      <div class="w-24 h-24 flex-shrink-0 bg-white p-1 rounded-lg shadow-inner flex items-center justify-center border-2 border-cyan-200">
        <img v-if="qrAvailable" src="/qr.png" alt="QRコード" class="object-contain rounded w-full h-full" />
        <div v-else class="text-xs text-gray-400 text-center">QR画像未設定</div>
      </div>

      <!-- 情報エリア -->
      <div class="flex-1 flex flex-col justify-between space-y-2 min-w-0 text-right">
        <div class="text-lg font-bold flex items-end justify-end flex-wrap gap-x-2">
          場内人数:
          <span class="ml-2 text-4xl text-yellow-400 tabular-nums">{{ currentCount }}</span>
          <span class="text-sm opacity-80">
            （内、優先入場:{{ localIn }} 出口:{{ exitIn }}）
          </span>
        </div>

        <div class="text-base font-light opacity-95">
          100人当たり待ち時間:
          <span class="font-bold tabular-nums">{{ waitTime }}分</span>
        </div>

        <div class="text-base font-light opacity-90 pt-1 border-t border-cyan-400/50">
          <span>[{{ date1 }}]</span><span class="font-bold ml-1 tabular-nums">：{{ day1Total }}人</span>
          <span class="mx-2"></span>
          <span>[{{ date2 }}]</span><span class="font-bold ml-1 tabular-nums">：{{ day2Total }}人</span>
          <span class="mx-2"></span>
          <span>[計]</span><span class="font-bold ml-1 tabular-nums">：{{ totalVisitors }}人</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useHeaderData } from "@/composables/useHeaderData.js";

const qrAvailable = true;

// データ取得
const {
  currentCount,
  localIn,
  exitIn,
  waitTime,
  date1,
  date2,
  day1Total,
  day2Total,
  totalVisitors,
  initHeaderData
} = useHeaderData();

onMounted(() => {
  initHeaderData("setapanmarketcounter");
});
</script>
