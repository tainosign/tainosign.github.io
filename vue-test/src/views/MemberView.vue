<template>
  <div class="min-h-screen bg-gradient-to-b from-[#0a1128] to-[#001845] text-gray-100 font-sans p-6">
    <header class="flex justify-between items-center mb-8 border-b border-orange-500 pb-3">
      <h1 class="text-2xl font-bold text-orange-400 tracking-wider">
        {{ member.nickname || member.name_kanji || "メンバー情報" }}
      </h1>
      <span class="text-sm opacity-80">ID: {{ member.id }}</span>
    </header>

    <section class="grid md:grid-cols-2 gap-6">
      <div class="bg-[#0f1e47]/70 p-4 rounded-2xl shadow-lg border border-[#1b2a5e]">
        <h2 class="text-lg font-semibold text-orange-400 mb-2">基本情報</h2>
        <p><strong>氏名：</strong>{{ member.name_kanji }}</p>
        <p><strong>ふりがな：</strong>{{ member.name_furigana }}</p>
        <p><strong>所属：</strong>{{ member.affiliation }}</p>
        <p><strong>参加歴：</strong>{{ member.participation_history }}</p>
        <p><strong>希望チーム：</strong>{{ member.preferred_teams.join("、") }}</p>
      </div>

      <div class="bg-[#0f1e47]/70 p-4 rounded-2xl shadow-lg border border-[#1b2a5e]">
        <h2 class="text-lg font-semibold text-orange-400 mb-2">現在のステータス</h2>
        <p><strong>状態：</strong> {{ member.realtime_status }}</p>
        <p><strong>所属チーム：</strong>{{ member.teamId || "未設定" }}</p>
        <p><strong>担当ポジション：</strong>{{ member.positionId || "未設定" }}</p>
        <p><strong>勤務時間：</strong>{{ member.position_duration }}分</p>
      </div>
    </section>

    <section class="mt-6 bg-[#0f1e47]/70 p-4 rounded-2xl border border-[#1b2a5e] shadow-lg">
      <h2 class="text-lg font-semibold text-orange-400 mb-2">参加可能日・時間帯</h2>
      <div v-if="Object.keys(member.available_times).length">
        <div v-for="(times, date) in member.available_times" :key="date" class="flex justify-between py-1 border-b border-[#1b2a5e]">
          <span>{{ date }}</span>
          <span>{{ times.join("・") }}</span>
        </div>
      </div>
      <div v-else class="text-sm opacity-70">未登録</div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useFirebase } from "@/composables/useFirebase";
import { doc, getDoc } from "firebase/firestore";
import { toJSTStringFromFirestore } from "@/composables/useJST.js";

const route = useRoute();
const member = ref({});

onMounted(async () => {
  const { db } = await useFirebase();
  const docRef = doc(db, "artifacts/setapanmarketcounter/public/data/members", route.params.memberId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data();
    data.joined_at = toJSTStringFromFirestore(data.joined_at);
    member.value = data;
  }
});
</script>
