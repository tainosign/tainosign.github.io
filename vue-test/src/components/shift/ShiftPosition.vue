<template>
  <div class="p-2 my-2 border border-gray-200 rounded-md bg-white shadow-sm">
    <div class="flex justify-between items-center mb-2">
      <input
        v-model="positionName"
        type="text"
        placeholder="ポジション名を入力"
        class="border px-2 py-1 rounded text-sm w-2/3"
      />
      <div class="flex gap-2">
        <button
          @click="addSlot"
          class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md text-sm"
        >
          + スロット
        </button>
        <button
          @click="$emit('delete', position.positionId)"
          class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-sm"
        >
          削除
        </button>
      </div>
    </div>

    <p v-if="slots.length === 0" class="text-gray-400 text-sm ml-2">
      スロットがありません
    </p>

    <div class="grid grid-cols-2 gap-2">
      <div
        v-for="slot in slots"
        :key="slot.slotId"
        class="border rounded-md p-2 text-sm bg-gray-50 flex justify-between items-center"
      >
        <div>
          <span class="font-medium">{{ slot.time }}</span>
          <span v-if="slot.member" class="text-gray-500 ml-2">
            ({{ slot.member }})
          </span>
        </div>
        <div class="flex gap-1">
          <button
            @click="editSlot(slot.slotId)"
            class="text-blue-500 text-xs underline"
          >
            編集
          </button>
          <button
            @click="deleteSlot(slot.slotId)"
            class="text-red-500 text-xs underline"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface Slot {
  slotId: string;
  time: string;
  member: string | null;
}

interface Position {
  positionId: string;
  name: string;
  slots: Slot[];
}

const props = defineProps<{
  dateId: string;
  teamId: string;
  position: Position;
}>();

const emit = defineEmits<{
  (e: "update", position: Position): void;
  (e: "delete", positionId: string): void;
}>();

const positionName = ref(props.position.name || "");
const slots = ref<Slot[]>(props.position.slots || []);

watch(
  [positionName, slots],
  () => {
    emit("update", {
      ...props.position,
      name: positionName.value,
      slots: slots.value,
    });
  },
  { deep: true }
);

function addSlot() {
  const newSlot: Slot = {
    slotId: `slot_${Date.now()}`,
    time: "10:00",
    member: null,
  };
  slots.value.push(newSlot);
}

function deleteSlot(slotId: string) {
  slots.value = slots.value.filter((s) => s.slotId !== slotId);
}

function editSlot(slotId: string) {
  const slot = slots.value.find((s) => s.slotId === slotId);
  if (!slot) return;
  const newTime = prompt("新しい時間を入力（例: 09:30）", slot.time);
  if (newTime) slot.time = newTime;
}
</script>
