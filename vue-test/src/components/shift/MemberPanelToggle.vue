<template>
  <div
    class="fixed top-1/2 transform -translate-y-1/2 z-50 flex items-center transition-all duration-300"
    :class="{ 'right-[25%]': showPanel, 'right-2': !showPanel }"
  >
    <!-- 縦書きのメンバーボタン -->
    <button
      @click="togglePanel"
      class="bg-blue-500 text-white px-2 py-6 rounded shadow text-lg writing-vertical"
    >
      メンバー
    </button>

    <!-- パネル -->
    <transition name="slide">
      <div
        v-if="showPanel"
        class="fixed right-0 top-0 h-screen w-[25%] bg-white border-l p-3 shadow-lg overflow-y-auto"
      >
        <div class="flex justify-between items-center mb-2">
          <button @click="autoAssign" class="bg-green-500 text-white px-2 py-1 rounded">
            自動配置
          </button>
          <select v-model="filterStatus" class="border rounded p-1 text-sm">
            <option value="unassigned">未配置</option>
            <option value="assigned">配置済み</option>
            <option value="resting">休憩中</option>
          </select>
        </div>

        <div v-for="m in filteredMembers" :key="m.id" class="border rounded p-2 mb-2 shadow-sm">
          <div class="font-semibold">{{ m.name }}</div>
          <div class="text-xs text-gray-500">{{ m.team || "未配置" }}</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { mockShiftData } from "@/mocks/mockShiftData";

const showPanel = ref(false);
const filterStatus = ref("unassigned");

// 🔹 ここでモックデータを直接ロード
const shift = mockShiftData();

const togglePanel = () => {
  showPanel.value = !showPanel.value;
};

// 🔹 ここで shift.members を利用
const filteredMembers = computed(() => {
  return shift.members.filter((m) => {
    if (filterStatus.value === "unassigned") return !m.teamId;
    if (filterStatus.value === "assigned") return m.teamId;
    if (filterStatus.value === "resting") return m.resting;
    return true;
  });
});

const autoAssign = () => {
  console.log("自動配置機能（後で実装）");
};
</script>

<style scoped>
/* ボタン縦書き */
.writing-vertical {
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 0.2em;
}

/* スライドアニメーション */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from {
  transform: translateX(100%);
}
.slide-leave-to {
  transform: translateX(100%);
}
</style>
