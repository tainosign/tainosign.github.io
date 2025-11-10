// src/stores/shiftStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { useFirestoreShifts } from "@/composables/useFirestoreShifts";
import { useFirestoreMembers } from "@/composables/useFirestoreMembers";

export const useShiftStore = defineStore("shift", () => {
  const shifts = ref([]);
  const members = ref([]);
  const isLoading = ref(false);

  // Firestore操作オブジェクト（非同期初期化）
  let firestoreShifts = null;
  let firestoreMembers = null;

  // ====== 初期化 ======
  const init = async () => {
    isLoading.value = true;

    firestoreShifts = await useFirestoreShifts();
    firestoreMembers = await useFirestoreMembers();

    // リアルタイム同期
    firestoreShifts.syncShifts((data) => (shifts.value = data));
    firestoreMembers.syncMembers((data) => (members.value = data));

    isLoading.value = false;
  };

  // ====== シフト操作 ======
  const addNewShift = async (dateStr) => {
    if (!firestoreShifts) await init();
    await firestoreShifts.addShift({ date: dateStr, slots: [] });
  };

  const assignMemberToSlot = async (memberId, slotId, teamId, positionId) => {
    if (!firestoreMembers) await init();
    const member = members.value.find((m) => m.id === memberId);
    if (!member) return;

    member.status = "配置済み";
    member.teamId = teamId;
    member.positionId = positionId;
    member.shiftIds.push(slotId);

    await firestoreMembers.updateMember(member.id, member);
  };

  const unassignMemberFromSlot = async (memberId, slotId) => {
    if (!firestoreMembers) await init();
    const member = members.value.find((m) => m.id === memberId);
    if (!member) return;

    member.status = "未配置";
    member.shiftIds = member.shiftIds.filter((id) => id !== slotId);
    member.teamId = null;
    member.positionId = null;

    await firestoreMembers.updateMember(member.id, member);
  };

  // ====== メンバー操作 ======
  const addNewMember = async (data) => {
    if (!firestoreMembers) await init();
    return await firestoreMembers.addMember(data);
  };

  const removeMember = async (id) => {
    if (!firestoreMembers) await init();
    await firestoreMembers.deleteMember(id);
  };

  return {
    shifts,
    members,
    isLoading,

    // 初期化
    init,

    // シフト操作
    addNewShift,
    assignMemberToSlot,
    unassignMemberFromSlot,

    // メンバー操作
    addNewMember,
    removeMember,
  };
});
