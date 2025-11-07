<!-- src/views/ShiftCreateView.vue -->
<template>
  <div class="p-4">
    <!-- 日付追加 -->
    <div class="flex items-center space-x-2 mb-4">
      <input type="date" v-model="newDate" class="border px-2 py-1 rounded">
      <button @click="addDateHandler" class="bg-green-500 text-white px-3 py-1 rounded">日付追加</button>
    </div>

    <!-- シフト日付一覧 -->
    <div v-for="date in allDates" :key="date" class="border rounded mb-4 p-2">
      <!-- 日付ヘッダ + 時間帯 -->
      <div class="flex items-center justify-between mb-2">
        <div>
          <span class="font-bold mr-2">{{ date }}</span>
          <span class="text-sm text-gray-600">{{ shifts[date].timeRange.start }}〜{{ shifts[date].timeRange.end }}</span>
          <input type="time" v-model="shifts[date].timeRange.start" class="border px-1 py-1 rounded ml-2">
          <input type="time" v-model="shifts[date].timeRange.end" class="border px-1 py-1 rounded ml-1">
        </div>
      </div>

      <!-- チーム列 -->
      <div class="flex overflow-x-auto"
           :style="{ minWidth: shifts[date].teams.length * teamMinWidth + 'px' }">
        <div v-for="team in shifts[date].teams" :key="team.id"
             class="border rounded p-2 mr-2 flex-shrink-0" :style="{ minWidth: teamMinWidth + 'px' }">
          <!-- チーム名編集 -->
          <input type="text" v-model="team.name" class="border px-1 py-1 rounded w-full mb-1">
          <!-- コピー / 削除 -->
          <div class="flex space-x-1 mb-2">
            <button @click="copyTeamHandler(date, team.id)" class="bg-blue-500 text-white px-2 rounded">⇒</button>
            <button @click="deleteTeamHandler(date, team.id)" class="bg-red-500 text-white px-2 rounded">×</button>
          </div>

          <!-- ポジション列（最小サンプル） -->
          <div class="flex flex-col space-y-1">
            <div v-for="(pos, idx) in team.positions" :key="pos.id" class="border p-1 rounded">
              <input type="text" v-model="pos.name" class="border px-1 py-1 rounded w-full mb-1">
              <div class="flex space-x-1">
                <div v-for="slot in pos.slots" :key="slot.id"
                     class="border text-center rounded" :style="{ minWidth: slotMinWidth + 'px', height: 30 + 'px' }">
                  {{ slot.memberId || '空' }}
                </div>
              </div>
            </div>
          </div>

          <!-- ポジション追加ボタン -->
          <button @click="addPositionHandler(date, team.id)" class="mt-2 bg-purple-500 text-white px-2 py-1 rounded text-sm">
            ポジション追加
          </button>
        </div>
      </div>

      <!-- チーム追加ボタン -->
      <button @click="addTeamHandler(date)" class="mt-2 bg-green-500 text-white px-3 py-1 rounded">
        チーム追加
      </button>
    </div>
    <Footer @back="$emit('back')" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { shifts, addDate, addTeam, copyTeam, deleteTeam } from '@/composables/useShift.js'
import Footer from "@/components/Footer.vue";
// 最小幅
const teamMinWidth = 120
const slotMinWidth = 20

// 日付追加
const newDate = ref('')
const allDates = computed(() => Object.keys(shifts).sort())
function addDateHandler() {
  if (!newDate.value) return
  addDate(newDate.value)
  newDate.value = ''
}

// チーム操作
function addTeamHandler(date) { addTeam(date) }
function copyTeamHandler(date, teamId) { copyTeam(date, teamId) }
function deleteTeamHandler(date, teamId) {
  if (confirm('チームを削除しますか？')) deleteTeam(date, teamId)
}

// ポジション追加（最小サンプル）
function addPositionHandler(date, teamId) {
  const team = shifts[date].teams.find(t => t.id === teamId)
  if (!team.positions) team.positions = []
  const idx = team.positions.length + 1
  team.positions.push({
    id: `pos-${Date.now()}`,
    name: `ポジション${idx}`,
    slots: [
      { id: `slot-${Date.now()}-1`, memberId: null, fixed: false },
      { id: `slot-${Date.now()}-2`, memberId: null, fixed: false }
    ]
  })
}
</script>
