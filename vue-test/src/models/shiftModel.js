// 統一データモデル定義

export function createMember(name = "新メンバー") {
  return { id: crypto.randomUUID(), name, role: "" };
}

export function createSlot() {
  return {
    id: crypto.randomUUID(),
    start: "09:00",
    end: "18:00",
    members: [],
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

export function createTeam() {
  return {
    id: crypto.randomUUID(),
    name: "新チーム",
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
  };
}
