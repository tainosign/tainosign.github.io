<template>
  <div class="bg-yellow-100 rounded px-2 py-1 text-sm">{{ member.name }}</div>
</template>

<script setup>
const props = defineProps({
  member: Object,
});
</script>
