<template>
  <div class="max-w-2xl mx-auto p-4">
    <h2 class="text-xl font-bold mb-4">世田谷パン祭り サポートスタッフアンケート</h2>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- 名前 -->
      <div>
        <label>お名前（漢字）*</label>
        <input v-model="form.name_kanji" required class="input" />
      </div>

      <div>
        <label>お名前（ふりがな）*</label>
        <input v-model="form.name_furigana" required class="input" />
      </div>

      <!-- 性別 -->
      <div>
        <label>性別*</label>
        <div class="flex space-x-4">
          <label><input type="radio" value="男性" v-model="form.gender" required /> 男性</label>
          <label><input type="radio" value="女性" v-model="form.gender" /> 女性</label>
          <label><input type="radio" value="上記以外" v-model="form.gender" /> 上記以外</label>
        </div>
      </div>

      <!-- 所属 -->
      <div>
        <label>ご所属*</label>
        <select v-model="form.affiliation" required class="input">
          <option disabled value="">選択してください</option>
          <option>学生</option>
          <option>会社員／会社役員</option>
          <option>アルバイト</option>
          <option>フリーランス</option>
          <option>その他</option>
        </select>
      </div>

      <!-- 電話・メール・住所 -->
      <div>
        <label>電話番号*</label>
        <input v-model="form.phone" required class="input" placeholder="090-xxxx-xxxx" />
      </div>

      <div>
        <label>メールアドレス*</label>
        <input v-model="form.email" required type="email" class="input" />
      </div>

      <div>
        <label>ご住所（市町村まで）*</label>
        <input v-model="form.address" required class="input" />
      </div>

      <!-- 参加回数 -->
      <div>
        <label>参加回数*</label>
        <select v-model="form.participation_history" required class="input">
          <option disabled value="">選択してください</option>
          <option v-for="n in 16" :key="n">{{ n === 1 ? '初めて' : n + '回目' }}</option>
        </select>
      </div>

      <!-- チーム希望 -->
      <div>
        <label>興味のあるチーム*</label>
        <div class="flex flex-col">
          <label><input type="checkbox" value="公式グッズ販売" v-model="form.preferred_teams" /> 公式グッズ販売</label>
          <label><input type="checkbox" value="受付" v-model="form.preferred_teams" /> 受付（チェックイン、インフォメーションなど）</label>
          <label><input type="checkbox" value="パンマーケット" v-model="form.preferred_teams" /> パンマーケット</label>
          <label><input type="checkbox" value="風船・休憩所・遊軍など" v-model="form.preferred_teams" /> 風船・休憩所・遊軍など</label>
          <label><input type="checkbox" value="どこのチームでもOK" v-model="form.preferred_teams" /> どこのチームでもOK！</label>
        </div>
      </div>

      <!-- 日程 -->
      <div>
        <label>参加可能日程*</label>
        <div v-for="date in scheduleOptions" :key="date.label" class="border p-2 rounded mb-2">
          <label><input type="checkbox" v-model="date.selected" /> {{ date.label }}</label>
          <div v-if="date.selected" class="ml-4">
            <label><input type="radio" value="全部" v-model="date.timeType" /> 全部</label>
            <label><input type="radio" value="部分" v-model="date.timeType" /> 時間帯指定</label>
            <div v-if="date.timeType === '部分'" class="flex items-center space-x-2 mt-1">
              <input type="time" v-model="date.start" class="input w-28" /> ～
              <input type="time" v-model="date.end" class="input w-28" />
            </div>
          </div>
        </div>
      </div>

      <!-- 備考 -->
      <div>
        <label>備考欄</label>
        <textarea v-model="form.remarks" class="input h-24" placeholder="ご要望など"></textarea>
      </div>

      <button type="submit" class="btn">送信</button>
    </form>

    <div v-if="submitted" class="mt-6 p-4 bg-green-50 border rounded">
      <h3 class="font-semibold mb-2">送信完了</h3>
      <p>ご回答ありがとうございました。</p>
      <p>専用ページはこちら：</p>
      <p class="text-blue-700 font-mono">
        <a :href="`/${generatedId}`" class="underline">
          https://setapanmarketcounter.web.app/{{ generatedId }}
        </a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { db } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { nanoid } from "nanoid";
import { createMemberModel } from "@/models/shiftModel";

const form = ref({
  name_kanji: "",
  name_furigana: "",
  gender: "",
  affiliation: "",
  phone: "",
  email: "",
  address: "",
  participation_history: "",
  preferred_teams: [],
  remarks: "",
});

const scheduleOptions = ref([
  { label: "10月25日（土）事前準備 13:00～17:00", selected: false, timeType: "全部", start: "", end: "" },
  { label: "10月31日（金）前日準備 13:00～17:00", selected: false, timeType: "全部", start: "", end: "" },
  { label: "11月1日（土）イベント1日目 7:00～19:00", selected: false, timeType: "全部", start: "", end: "" },
  { label: "11月2日（日）イベント2日目 7:00～19:00", selected: false, timeType: "全部", start: "", end: "" },
]);

const submitted = ref(false);
const generatedId = ref("");

const handleSubmit = async () => {
  const id = nanoid(10);
  generatedId.value = id;

  const available_dates = scheduleOptions.value
    .filter(d => d.selected)
    .map(d => ({
      date: d.label,
      timeType: d.timeType,
      start: d.start,
      end: d.end,
    }));

  const memberData = createMemberModel({
    ...form.value,
    id,
    available_dates,
  });

  await setDoc(doc(db, "artifacts/setapanmarketcounter/public/data/members", id), memberData);
  submitted.value = true;
};
</script>

<style scoped>
.input {
  @apply border rounded w-full p-2 mt-1;
}
.btn {
  @apply bg-blue-600 text-white px-4 py-2 rounded;
}
</style>
