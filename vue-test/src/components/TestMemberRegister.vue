<template>
  <div class="p-6 max-w-md mx-auto">
    <h2 class="text-xl font-bold mb-4">テストメンバー登録</h2>

    <div v-if="done" class="text-green-600 mb-2">登録完了！</div>
    <div v-if="error" class="text-red-600 mb-2">{{ error }}</div>

    <button
      @click="registerTestMembers"
      :disabled="isRunning || done"
      class="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
    >
      登録実行
    </button>

    <ul class="mt-4">
      <li v-for="m in registered" :key="m.id">{{ m.name_kanji }} ({{ m.gender }})</li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useFirestoreMembers } from "@/composables/useFirestoreMembers";

const isRunning = ref(false);
const done = ref(false);
const error = ref("");
const registered = ref([]);

const { addMember, getMembers } = await useFirestoreMembers();

const testMembers = [
  { id: "member001", name_kanji: "田中 太郎", gender: "男性" },
  { id: "member002", name_kanji: "鈴木 花子", gender: "女性" },
];

const registerTestMembers = async () => {
  isRunning.value = true;
  error.value = "";
  registered.value = [];

  try {
    const existingMembers = await getMembers();

    for (const m of testMembers) {
      const exists = existingMembers.find(em => em.id === m.id);
      if (exists) {
        console.log(`既に存在: ${m.name_kanji}`);
        continue;
      }
      const member = await addMember(m);
      registered.value.push(member);
      console.log(`登録: ${member.name_kanji}`);
    }

    done.value = true;
  } catch (e) {
    console.error(e);
    error.value = e.message || "登録中にエラーが発生しました";
  } finally {
    isRunning.value = false;
  }
};
</script>

<style scoped>
/* 最小限のスタイル */
</style>
