<template>
  <div class="min-h-screen bg-gradient-to-b from-[#0a1128] to-[#001845] text-gray-100 font-sans p-6">
    <!-- ヘッダー -->
    <header class="flex justify-between items-center mb-8 border-b border-orange-500 pb-3">
      <h1 class="text-2xl font-bold text-orange-400 tracking-wider">
        {{ member.nickname || member.name_kanji || "メンバー情報" }}
      </h1>
      <span class="text-sm opacity-80">ID: {{ member.id }}</span>
    </header>

    <!-- ステータス表示 -->
    <section class="grid md:grid-cols-2 gap-6">
      <!-- 基本情報 -->
      <div class="bg-[#0f1e47]/70 p-4 rounded-2xl shadow-lg border border-[#1b2a5e]">
        <h2 class="text-lg font-semibold text-orange-400 mb-2">基本情報</h2>
        <p><strong>氏名：</strong>{{ member.name_kanji }}</p>
        <p><strong>ふりがな：</strong>{{ member.name_furigana }}</p>
        <p><strong>所属：</strong>{{ member.affiliation }}</p>
        <p><strong>参加歴：</strong>{{ member.participation_history }}</p>
        <p><strong>希望チーム：</strong>{{ member.preferred_teams.join("、") }}</p>
      </div>

      <!-- ステータス情報 -->
      <div class="bg-[#0f1e47]/70 p-4 rounded-2xl shadow-lg border border-[#1b2a5e]">
        <h2 class="text-lg font-semibold text-orange-400 mb-2">現在のステータス</h2>
        <p><strong>状態：</strong>
          <span
            class="px-2 py-1 rounded text-sm"
            :class="{
              'bg-green-600': member.realtime_status === 'ポジション配備',
              'bg-yellow-600': member.realtime_status === '休憩中',
              'bg-gray-600': member.realtime_status === '未配置',
            }"
          >
            {{ member.realtime_status }}
          </span>
        </p>
        <p><strong>所属チーム：</strong>{{ member.teamId || "未設定" }}</p>
        <p><strong>担当ポジション：</strong>{{ member.positionId || "未設定" }}</p>
        <p><strong>勤務時間：</strong>{{ member.position_duration }}分</p>
      </div>
    </section>

    <!-- 参加可能日・時間帯 -->
    <section class="mt-6 bg-[#0f1e47]/70 p-4 rounded-2xl border border-[#1b2a5e] shadow-lg">
      <h2 class="text-lg font-semibold text-orange-400 mb-2">参加可能日・時間帯</h2>
      <div v-if="Object.keys(member.available_times).length">
        <div
          v-for="(times, date) in member.available_times"
          :key="date"
          class="flex justify-between py-1 border-b border-[#1b2a5e]"
        >
          <span>{{ date }}</span>
          <span>{{ times.join("・") }}</span>
        </div>
      </div>
      <div v-else class="text-sm opacity-70">未登録</div>
    </section>

    <!-- 備考 -->
    <section class="mt-6 bg-[#0f1e47]/70 p-4 rounded-2xl border border-[#1b2a5e] shadow-lg">
      <h2 class="text-lg font-semibold text-orange-400 mb-2">備考</h2>
      <p class="whitespace-pre-wrap">{{ member.remarks || "なし" }}</p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const route = useRoute();
const member = ref({});

onMounted(async () => {
  const token = route.params.token;
  const q = query(
    collection(db, "artifacts/setapanmarketcounter/public/data/members"),
    where("token", "==", token)
  );
  const snap = await getDocs(q);
  if (!snap.empty) member.value = snap.docs[0].data();
});
</script>
