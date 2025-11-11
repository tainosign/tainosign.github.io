<template>
  <div class="p-6 text-white bg-slate-800 min-h-screen flex flex-col items-center justify-center">
    <h2 class="text-2xl font-bold mb-4">メンバーアンケート</h2>

    <form @submit.prevent="submitSurvey" class="w-full max-w-md bg-slate-700 p-6 rounded-2xl shadow-md">
      <label class="block mb-2 font-semibold">名前</label>
      <input v-model="form.name" class="w-full p-2 rounded mb-4 bg-slate-600 text-white" required />

      <label class="block mb-2 font-semibold">ポジション</label>
      <input v-model="form.position" class="w-full p-2 rounded mb-4 bg-slate-600 text-white" />

      <label class="block mb-2 font-semibold">連絡先</label>
      <input v-model="form.contact" class="w-full p-2 rounded mb-4 bg-slate-600 text-white" />

      <label class="block mb-2 font-semibold">参加可能時間帯</label>
      <textarea v-model="form.availableTimes" class="w-full p-2 rounded mb-4 bg-slate-600 text-white"
        placeholder="例: 9:00-12:00, 14:00-17:00"></textarea>

      <button type="submit" class="bg-orange-600 hover:bg-orange-500 transition px-4 py-2 rounded w-full font-semibold">
        送信
      </button>
    </form>

    <div v-if="completed" class="mt-8 text-center">
      <p class="text-lg font-semibold mb-4">アンケート送信完了しました！</p>
      <button
        @click="goToMemberPage"
        class="bg-indigo-600 hover:bg-indigo-500 transition px-6 py-3 rounded-xl font-bold">
        専用ページに進む
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { db } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const router = useRouter();
const form = ref({
  name: "",
  position: "",
  contact: "",
  availableTimes: "",
});
const completed = ref(false);
let newDocId = "";

const submitSurvey = async () => {
  try {
    const docRef = await addDoc(collection(db, "shiftMembers"), {
      ...form.value,
      availableTimes: form.value.availableTimes.split(",").map(s => s.trim()),
      createdAt: serverTimestamp(),
    });

    newDocId = docRef.id;
    completed.value = true;
  } catch (e) {
    console.error("送信失敗:", e);
  }
};

const goToMemberPage = () => {
  router.push(`/member/${newDocId}`);
};
</script>
