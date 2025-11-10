// src/stores/shiftStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { useFirestoreShifts } from "@/composables/useFirestoreShifts";
import { useFirestoreMembers } from "@/composables/useFirestoreMembers";

export const useShiftStore = defineStore("shift", () => {
  const shifts = ref([]);
  const members = ref([]);
  const isLoading = ref(false);

  // Firestore 操作
  const { addShift, getShifts, updateShift, addSlotToShift, syncShifts } = useFirestoreShifts();
  const { addMember, getMembers, updateMember, deleteMember, syncMembers } = useFirestoreMembers();

  // 初期化・リアルタイム同期
  const initRealtimeSync = async () => {
    isLoading.value = true;
    try {
      await syncShifts((data) => (shifts.value = data));
      await syncMembers((data) => (members.value = data));
    } catch (e) {
      console.error("Realtime sync error:", e);
    } finally {
      isLoading.value = false;
    }
  };

  // シフト操作
  const addNewShift = async (dateStr) => {
    const newShift = { date: dateStr, slots: [] };
    await addShift(newShift);
  };

  // メンバー操作
  const assignMemberToSlot = async (memberId, slotId, teamId, positionId) => {
    const member = members.value.find(m => m.id === memberId);
    if (!member) return;
    member.status = "配置済み";
    member.teamId = teamId;
    member.positionId = positionId;
    member.shiftIds.push(slotId);
    await updateMember(member.id, member);
  };

  return {
    shifts,
    members,
    isLoading,
    initRealtimeSync,
    addNewShift,
    assignMemberToSlot,
  };
});
