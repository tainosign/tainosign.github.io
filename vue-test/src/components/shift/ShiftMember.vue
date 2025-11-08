<!-- src/components/shift/ShiftMember.vue -->
<template>
  <div
    class="relative border border-gray-400 rounded bg-gray-100 p-1 text-center text-sm shadow-sm"
    :class="{
      'bg-blue-50': displayMode === 'slot',
      'bg-green-50': displayMode === 'list',
      'bg-yellow-50': displayMode === 'profile',
    }"
  >
    <div v-if="displayMode === 'slot'">
      <div class="font-semibold">{{ member.name }}</div>
      <div class="text-xs text-gray-500">{{ member.start }} - {{ member.end }}</div>
    </div>

    <div v-else-if="displayMode === 'list'">
      <div class="font-semibold">{{ member.name }}</div>
      <div class="text-xs">{{ member.role }}</div>
    </div>

    <div v-else-if="displayMode === 'profile'">
      <div class="text-left text-xs">
        <div><b>氏名:</b> {{ member.name }}</div>
        <div><b>役職:</b> {{ member.role }}</div>
        <div><b>勤務時間:</b> {{ member.start }}〜{{ member.end }}</div>
      </div>
    </div>

    <button
      @click="$emit('remove')"
      class="absolute top-0 right-1 text-xs text-red-500"
    >
      ×
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  member: Object,
  displayMode: {
    type: String,
    default: "slot" // 他に list / profile / edit など切り替え可能
  }
});
</script>
