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
  const { fetchShifts, syncShifts, addShiftToFirestore, updateShiftInFirestore } = useFirestoreShifts();
  const { fetchMembers, syncMembers, updateMemberInFirestore } = useFirestoreMembers();

  // ====== 初期化 ======
  const initRealtimeSync = async () => {
    isLoading.value = true;
    await Promise.all([
      syncShifts((data) => (shifts.value = data)),
      syncMembers((data) => (members.value = data)),
    ]);
    isLoading.value = false;
  };

  // ====== シフト操作 ======
  const addShift = async (dateStr) => {
    const newShift = { date: dateStr, slots: [] };
    await addShiftToFirestore(newShift);
  };

  // ====== メンバー操作 ======
  const assignMemberToSlot = async (memberId, slotId, teamId, positionId) => {
    const member = members.value.find((m) => m.id === memberId);
    if (!member) return;

    member.status = "配置済み";
    member.teamId = teamId;
    member.positionId = positionId;
    member.shiftIds.push(slotId);
    await updateMemberInFirestore(member);
  };

  return {
    shifts,
    members,
    isLoading,
    addShift,
    assignMemberToSlot,
    initRealtimeSync,
  };
});
