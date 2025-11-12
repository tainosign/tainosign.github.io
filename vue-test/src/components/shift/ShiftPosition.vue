<template>
  <div class="p-2 border rounded bg-white min-w-[280px] shadow-sm">
    <div class="flex justify-between items-center mb-2">
      <input
        v-model="positionName"
        placeholder="ポジション名"
        class="border rounded px-2 py-1 text-sm"
      />
      <button
        @click="addSlot"
        class="bg-green-500 text-white text-xs px-2 py-1 rounded"
      >
        ＋スロット
      </button>
    </div>

    <div class="flex flex-col gap-2">
      <ShiftSlot
        v-for="slot in slots"
        :key="slot.slotId"
        :slot="slot"
        :slots="slots"
        @update="updateSlot"
        @delete="deleteSlot"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import ShiftSlot from "./ShiftSlot.vue";

const props = defineProps({
  position: Object,
});

const emit = defineEmits(["update", "delete"]);

const positionName = ref(props.position.name || "");
const slots = ref(props.position.slots || []);

watch([positionName, slots], () => {
  emit("update", {
    ...props.position,
    name: positionName.value,
    slots: slots.value,
  });
});

function addSlot() {
  slots.value.push({
    slotId: `slot_${Date.now()}`,
    name: `スロット ${slots.value.length + 1}`,
    members: [],
  });
}

function deleteSlot(id) {
  slots.value = slots.value.filter((s) => s.slotId !== id);
}

function updateSlot(updatedSlot) {
  slots.value = slots.value.map((s) =>
    s.slotId === updatedSlot.slotId ? updatedSlot : s
  );
}
</script>
