<template>
  <ShiftContainer
    :item="slot"
    :list="slots"
    :foldedWidth="computeFoldedWidth"
  >
    <template #header>
      <input v-model="slot.name" class="border rounded p-1 text-sm w-20" />
    </template>

    <template #body>
      <div class="flex items-center h-6">
        <template v-if="!slot.folded">
          <!-- 通常表示：縦に展開 -->
          ...
        </template>

        <template v-else>
          <!-- 折りたたみ時：横長表示、縦は潰さない -->
          <div
            class="flex items-center h-6 overflow-hidden bg-blue-100 text-xs px-1 gap-1"
          >
            <span class="text-gray-600">{{ slot.start }}〜{{ slot.end }}</span>
            <div class="flex gap-0.5 ml-1">
              <template v-for="member in slot.members" :key="member.id">
                <div
                  class="bg-green-400 text-white text-[0.55rem] rounded px-0.5"
                  :title="member.name"
                >
                  {{ member.name[0] }}
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </template>
  </ShiftContainer>
</template>

<script setup>
import ShiftContainer from "./ShiftContainer.vue";

const props = defineProps({
  slot: Object,
  slots: Array,
  computeFoldedWidth: [Number, String],
});
</script>
