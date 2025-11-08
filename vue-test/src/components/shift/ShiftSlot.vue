<!-- src/components/shift/ShiftSlot.vue -->
<template>
  <div class="relative border-2 border-gray-400 rounded-lg bg-white p-2"
       :style="{ height: slotHeight + 'px', width: '140px' }">
    <!-- スロットヘッダ -->
    <div class="flex justify-between items-center mb-1">
      <span class="text-sm text-gray-700 font-semibold">{{ slot.name }}</span>
      <button @click="$emit('remove')" class="text-red-500">×</button>
    </div>

    <!-- 時間目盛り -->
    <div class="absolute left-0 top-6 w-4 flex flex-col items-end text-[10px] text-gray-500">
      <template v-for="(tick, i) in tickMarks" :key="i">
        <div
          :style="{ height: tickHeight + 'px' }"
          class="w-full border-t border-gray-300"
        >
          <span v-if="i % 6 === 0" class="pr-1">{{ i / 6 }}h</span>
        </div>
      </template>
    </div>

    <!-- メンバー縦並び -->
    <div class="ml-6 flex flex-col gap-1 relative z-10">
      <ShiftMember
        v-for="(member, mIndex) in slot.members"
        :key="member.id"
        :member="member"
        :display-mode="'slot'"
        @remove="removeMember(mIndex)"
      />
      <button
        @click="addMember"
        class="bg-blue-400 text-white rounded text-sm py-1 hover:bg-blue-500"
      >
        ＋メンバー
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import ShiftMember from "./ShiftMember.vue";

const props = defineProps({
  slot: Object
});

// 分単位の長さを高さに変換（例: 1分 = 1px）
const slotHeight = computed(() => props.slot.duration);

// 10分単位のメモリ
const tickHeight = 10; // 10分 = 10px として表示
const tickMarks = computed(() => {
  const count = props.slot.duration / 10;
  return Array.from({ length: count }, (_, i) => i);
});

// メンバー追加/削除
const addMember = () => {
  props.slot.members.push({
    id: Date.now(),
    name: `M${props.slot.members.length + 1}`,
    role: "スタッフ",
    start: "09:00",
    end: "12:00",
  });
};
const removeMember = (index) => props.slot.members.splice(index, 1);
</script>
