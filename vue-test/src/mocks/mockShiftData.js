// src/mocks/mockShiftData.js
import { createShift, createMember } from "@/models/shiftModel";

export function mockShiftData() {
  const shift = createShift("2025-11-10");

  // メンバーを追加
  shift.members = [
    createMember("佐藤", shift.teams[0].id),
    createMember("田中", shift.teams[0].id),
    createMember("鈴木", null),
  ];

  // Aチーム1番目のポジションのスロットに割り当て
  shift.teams[0].positions[0].slots[0].members.push(shift.members[0].id);
  shift.teams[0].positions[0].slots[0].members.push(shift.members[1].id);

  return shift;
}
