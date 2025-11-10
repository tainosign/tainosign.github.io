// src/mocks/mockShiftData.js
import { createShiftModel, createMemberModel } from "@/models/shiftModel";

export function mockShiftData() {
  const shift = createShiftModel("2025-11-10");

  // メンバーを追加
  shift.members = [
    createMemberModel("佐藤", shift.teams[0].id),
    createMemberModel("田中", shift.teams[0].id),
    createMemberModel("鈴木", null),
  ];

  // Aチーム1番目のポジションのスロットに割り当て
  shift.teams[0].positions[0].slots[0].members.push(shift.members[0].id);
  shift.teams[0].positions[0].slots[0].members.push(shift.members[1].id);

  return shift;
}
