// src/stores/shiftStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { useFirestoreShifts } from "@/composables/useFirestoreShifts";
import { useFirestoreMembers } from "@/composables/useFirestoreMembers";

export const useShiftStore = defineStore("shift", () => {
  // ====== 状態 ======
  const shifts = ref([]);
  const members = ref([]);
  const isLoading = ref(false);

  // ====== Firestore 操作層 ======
  const { addShift, getShifts, updateShift, addSlotToShift, syncShifts } = await useFirestoreShifts();
  const { addMember, getMembers, updateMember, deleteMember, syncMembers } = await useFirestoreMembers();

  // ====== 初期化 ======
  const initRealtimeSync = async () => {
    isLoading.value = true;

    // リアルタイム同期
    syncShifts((data) => (shifts.value = data));
    syncMembers((data) => (members.value = data));

    isLoading.value = false;
  };

  // ====== シフト操作 ======
  const addNewShift = async (dateStr) => {
    const newShift = { date: dateStr, slots: [] };
    await addShift(newShift);
  };

  const assignMemberToSlot = async (memberId, slotId, teamId, positionId) => {
    const member = members.value.find((m) => m.id === memberId);
    if (!member) return;

    member.status = "配置済み";
    member.teamId = teamId;
    member.positionId = positionId;
    member.shiftIds.push(slotId);

    await updateMember(member.id, member);
  };

  const unassignMemberFromSlot = async (memberId, slotId) => {
    const member = members.value.find((m) => m.id === memberId);
    if (!member) return;

    member.status = "未配置";
    member.shiftIds = member.shiftIds.filter((id) => id !== slotId);
    member.teamId = null;
    member.positionId = null;

    await updateMember(member.id, member);
  };

  // ====== メンバー操作 ======
  const addNewMember = async (data) => {
    return await addMember(data);
  };

  const removeMember = async (id) => {
    await deleteMember(id);
  };

  return {
    // 状態
    shifts,
    members,
    isLoading,

    // 初期化
    initRealtimeSync,

    // シフト操作
    addNewShift,
    assignMemberToSlot,
    unassignMemberFromSlot,

    // メンバー操作
    addNewMember,
    removeMember,
  };
});
