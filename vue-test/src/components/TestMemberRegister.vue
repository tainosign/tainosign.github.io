<script setup>
import { ref, onMounted } from "vue";
import { useFirestoreMembers } from "@/composables/useFirestoreMembers";

const isRunning = ref(false);
const done = ref(false);
const error = ref("");
const registered = ref([]);
let addMember, getMembers;

const testMembers = [
  { id: "member001", name_kanji: "田中 太郎", gender: "男性" },
  { id: "member002", name_kanji: "鈴木 花子", gender: "女性" },
];

onMounted(async () => {
  const firestore = await useFirestoreMembers();
  addMember = firestore.addMember;
  getMembers = firestore.getMembers;
});

const registerTestMembers = async () => {
  if (!addMember || !getMembers) return;

  isRunning.value = true;
  error.value = "";
  registered.value = [];

  try {
    const existingMembers = await getMembers();

    for (const m of testMembers) {
      const exists = existingMembers.find(em => em.id === m.id);
      if (exists) continue;

      const member = await addMember(m);
      registered.value.push(member);
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
