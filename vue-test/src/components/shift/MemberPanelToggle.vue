<template>
  <!-- ボタン固定 -->
  <button
    @click="togglePanel"
    class="fixed top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-2 py-6 rounded shadow text-lg writing-vertical transition-all duration-300"
    :style="{ right: showPanel ? panelWidth + 'px' : '10px' }"
  >
    メンバー
  </button>

  <!-- パネル固定 -->
  <transition name="slide">
    <div
      v-if="showPanel"
      class="fixed top-0 bottom-0 right-0 bg-white border-l p-3 shadow-lg overflow-y-auto"
      :style="{ width: panelWidth + 'px' }"
    >
      <div class="flex justify-between items-center mb-2">
        <button
          @click="autoAssign"
          class="bg-green-500 text-white px-2 py-1 rounded"
        >
          自動配置
        </button>

        <select v-model="filterStatus" class="border rounded p-1 text-sm">
          <option value="unassigned">未配置</option>
          <option value="assigned">配置済み</option>
          <option value="resting">休憩中</option>
        </select>
      </div>

      <!-- 🔹 フィルタされたメンバー一覧 -->
      <div
        v-for="m in filteredMembers"
        :key="m.id"
        class="border rounded p-2 mb-2 shadow-sm bg-white cursor-move hover:bg-blue-50 transition"
        draggable="true"
        @dragstart="onDragStart(m)"
      >
        <div class="font-semibold">{{ m.name }}</div>
        <div class="text-xs text-gray-500">{{ m.team || '未配置' }}</div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useShiftStore } from "@/stores/shiftStore";

const showPanel = ref(false);
const panelWidth = 400;
const filterStatus = ref("unassigned");

const shiftStore = useShiftStore();

// 🔹 初回ロードで Firebase から取得
onMounted(async () => {
  if (!shiftStore.members.length) {
    await shiftStore.init();
  }
});

// 🔹 フィルタリング
const filteredMembers = computed(() => {
  return shiftStore.members.filter((m) => {
    if (filterStatus.value === "unassigned") return !m.teamId;
    if (filterStatus.value === "assigned") return m.teamId;
    if (filterStatus.value === "resting") return m.resting;
    return true;
  });
});

const togglePanel = () => {
  showPanel.value = !showPanel.value;
};

const onDragStart = (member) => (e) => {
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("application/json", JSON.stringify(member));
  console.log(`ドラッグ開始: ${member.name}`);
};

const autoAssign = () => {
  console.log("自動配置機能（後で実装）");
};
</script>


<style scoped>
.writing-vertical {
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 0.2em;
}

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
