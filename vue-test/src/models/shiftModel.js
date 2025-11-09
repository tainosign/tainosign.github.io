// src/models/shiftModel.js
export function createMember(name = "新メンバー", teamId = null) {
  return {
    id: crypto.randomUUID(),
    name,
    role: "",
    teamId,           // 所属チーム
    assigned: false,  // シフト割り当て有無
    resting: false,   // 休憩中状態
  };
}

export function createSlot() {
  return {
    id: crypto.randomUUID(),
    name: "新スロット",
    start: "09:00",
    end: "18:00",
    members: [], // createMember() の id のみを格納
    locked: false,
    folded: false,
  };
}

export function createPosition() {
  return {
    id: crypto.randomUUID(),
    name: "新ポジション",
    slots: [createSlot()],
    locked: false,
    folded: false,
  };
}

export function createTeam(name = "新チーム") {
  return {
    id: crypto.randomUUID(),
    name,
    positions: [createPosition()],
    locked: false,
    folded: false,
  };
}

export function createShift(dateStr) {
  return {
    id: crypto.randomUUID(),
    date: dateStr,
    teams: [createTeam()],
    members: [], // ここで全メンバー一覧も管理
  };
}
