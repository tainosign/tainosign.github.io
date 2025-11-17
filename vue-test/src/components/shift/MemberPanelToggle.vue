<template>
  <!-- 日付ボタン群（top-right） -->
  <div class="fixed top-4 right-4 bg-white shadow rounded p-2 z-50 flex gap-2">
    <button
      v-for="d in shiftStore.festivalDays"
      :key="d"
      @click="shiftStore.setActiveDay(d)"
      class="px-3 py-1 rounded border"
      :class="shiftStore.activeDay === d ? 'bg-blue-500 text-white' : 'bg-gray-100'"
    >
      {{ d }}
    </button>
  </div>

  <!-- メンバー開閉ボタン -->
  <button
    @click="togglePanel"
    class="fixed top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-2 py-6 rounded shadow text-lg writing-vertical"
    :style="{ right: showPanel ? panelWidth + 'px' : '10px' }"
  >
    メンバー
  </button>

  <!-- パネル -->
  <transition name="slide">
    <div
      v-if="showPanel"
      class="fixed top-0 bottom-0 right-0 bg-white border-l p-3 shadow-lg overflow-y-auto"
      :style="{ width: panelWidth + 'px' }"
    >
      <div class="flex justify-between items-center mb-2">
        <button @click="autoAssign" class="bg-green-500 text-white px-2 py-1 rounded">自動配置</button>
        <select v-model="filterStatus" class="border rounded p-1 text-sm">
          <option value="unassigned">未配置</option>
          <option value="assigned">配置済み</option>
        </select>
      </div>

      <div>
        <div
          v-for="m in filteredMembers"
          :key="m.id"
          class="border rounded p-2 mb-2 shadow-sm bg-white cursor-move hover:bg-blue-50 transition flex items-center"
        >
          <ShiftMember :member="m" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useShiftStore } from "@/stores/shiftStore";
import { useMemberStore } from "@/stores/memberStore";
import ShiftMember from "./ShiftMember.vue";
import { useDragManager } from "@/composables/useDragManager";

const dragManager = useDragManager();
const showPanel = ref(false);
const panelWidth = 360;
const filterStatus = ref("unassigned");

const shiftStore = useShiftStore();
const memberStore = useMemberStore();

onMounted(async () => {
  await memberStore.loadMembers?.();
  await shiftStore.loadFestivalShifts?.();
});

const filteredMembers = computed(() => {
  const activeShift = shiftStore.getShiftForActiveDay?.();
  const assignedIds =
    activeShift?.teams?.flatMap((t) => t.positions?.flatMap((p) => (p.slots || []).flatMap(s => (s.members||[]).map(m=>m.id) || [])) ) || [];

  return (memberStore.members || []).filter((m) => {
    const assigned = assignedIds.includes(m.id);
    if (filterStatus.value === "unassigned") return !assigned;
    if (filterStatus.value === "assigned") return assigned;
    return true;
  });
});

const togglePanel = () => (showPanel.value = !showPanel.value);
const autoAssign = () => console.log("autoAssign TODO");
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from { transform: translateX(100%); }
.slide-leave-to { transform: translateX(100%); }
.writing-vertical { writing-mode: vertical-rl; text-orientation: upright; letter-spacing: 0.2em; }
</style>
