// src/composables/useShift.js
import { reactive } from 'vue'

export const shifts = reactive({})

// 日付追加
export function addDate(date) {
  if (!shifts[date]) {
    shifts[date] = {
      timeRange: { start: "06:00", end: "20:00" },
      teams: []
    }
  }
}

// チーム追加
export function addTeam(date) {
  if (!shifts[date]) return
  const index = shifts[date].teams.length + 1
  shifts[date].teams.push({
    id: `team-${Date.now()}`,
    name: `チーム${index}`,
    positions: []
  })
}

// チームコピー（同日内ユニーク番号付与）
export function copyTeam(date, teamId) {
  const teams = shifts[date].teams
  const team = teams.find(t => t.id === teamId)
  if (!team) return

  let baseName = team.name.replace(/\d+$/, '')
  let copyIndex = 1
  let newName = `${baseName}${copyIndex}`
  while (teams.some(t => t.name === newName)) {
    copyIndex++
    newName = `${baseName}${copyIndex}`
  }

  const newTeam = JSON.parse(JSON.stringify(team))
  newTeam.id = `team-${Date.now()}`
  newTeam.name = newName
  teams.push(newTeam)
}

// チーム削除
export function deleteTeam(date, teamId) {
  const teams = shifts[date].teams
  const index = teams.findIndex(t => t.id === teamId)
  if (index !== -1) teams.splice(index, 1)
                           }
