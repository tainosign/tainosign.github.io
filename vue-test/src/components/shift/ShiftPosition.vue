<template>
  <div class="p-2 border rounded-md bg-white">
    <div class="flex items-center justify-between mb-2">
      <input v-model="name" class="px-2 py-1 border rounded text-sm w-2/3" />
      <div class="flex gap-2">
        <button @click="addEmptyBlock" class="bg-green-500 text-white text-xs px-2 py-1 rounded">＋ブロック</button>
        <button @click="$emit('delete', position.positionId)" class="bg-red-500 text-white text-xs px-2 py-1 rounded">削除</button>
      </div>
    </div>

    <!-- 時間軸（ShiftSlot） -->
    <ShiftSlot
      :position="position"
      :slots="slots"
      @update-slots="onSlotsUpdate"
    />
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import ShiftSlot from "./ShiftSlot.vue";

const props = defineProps({
  dateId: String,
  teamId: String,
  position: { type: Object, required: true },
});

const emit = defineEmits(["update-position", "delete"]);

const name = ref(props.position.name || "");
const slots = ref(props.position.slots || []);

watch([name, slots], () => {
  emit("update-position", { ...props.position, name: name.value, slots: slots.value });
}, { deep: true });

function addEmptyBlock() {
  const block = {
    id: `blk_${Date.now()}`,
    memberId: null,
    memberName: null,
    start_min: 7 * 60,   // default 07:00 in minutes
    duration_min: 60,    // default 60 minutes
  };
  slots.value.push(block);
}

function onSlotsUpdate(newSlots) {
  slots.value = newSlots;
}
</script>
