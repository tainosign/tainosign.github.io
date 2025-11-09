<template>
  <div class="fixed right-2 top-1/2 transform -translate-y-1/2 z-50">
    <!-- タグボタン -->
    <button
      @click="showPanel = !showPanel"
      class="bg-blue-500 text-white px-3 py-2 rounded shadow"
    >
      メンバー
    </button>

    <!-- パネル -->
    <transition name="slide">
      <div
        v-if="showPanel"
        class="fixed right-0 top-0 h-full w-1/5 bg-white border-l p-3 shadow-lg overflow-y-auto"
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

        <div v-for="m in filteredMembers" :key="m.id" class="border rounded p-1 mb-1">
          {{ m.name }} <span class="text-xs text-gray-500">({{ m.team || "未配置" }})</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useMemberStore } from "@/stores/memberStore";

const showPanel = ref(false);
const filterStatus = ref("unassigned");
const store = useMemberStore();

const filteredMembers = computed(() => {
  return store.members.filter(m => {
    if (filterStatus.value === "unassigned") return !m.assigned;
    if (filterStatus.value === "assigned") return m.assigned;
    if (filterStatus.value === "resting") return m.resting;
    return true;
  });
});

const autoAssign = () => {
  console.log("自動配置機能（後で実装）");
};
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
