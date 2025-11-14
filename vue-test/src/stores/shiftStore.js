// src/stores/shiftStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { useFirestoreShifts } from "@/composables/useFirestoreShifts";

export const useShiftStore = defineStore("shiftStore", () => {
  const shifts = ref([]);
  const festivalDays = ref([]);
  const activeDay = ref("");
  const isLoading = ref(false);

  const loadFestivalShifts = async () => {
    const { getFestivalDays, getAllFestivalShifts } = await useFirestoreShifts();
    isLoading.value = true;
    festivalDays.value = await getFestivalDays();
    shifts.value = await getAllFestivalShifts();
    if (!activeDay.value && festivalDays.value.length > 0) {
      activeDay.value = festivalDays.value[0];
    }
    isLoading.value = false;
  };

  const getShiftForActiveDay = () =>
    shifts.value.find((s) => s.day === activeDay.value);

  const setActiveDay = (date) => {
    activeDay.value = date;
  };

  const createNewShift = (dates) => {
    for (const date of dates) {
      if (!shifts.value.some((s) => s.date === date)) {
        shifts.value.push({
          id: `${date}-${Date.now()}`,
          date,
          teams: [],
        });
      }
    }
  };

  const getShiftsByDates = async (dates) => {
    const { getShiftByDate } = await useFirestoreShifts();
    const result = [];
    for (const d of dates) {
      const shift = await getShiftByDate(d);
      if (shift) result.push(shift);
    }
    return result;
  };

  const saveShiftsByDates = async (shiftList, fileName = "shift") => {
    const { saveShift } = await useFirestoreShifts();
    const jst = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
    const timestamp = jst.replace(/[/: ]/g, "-");
    for (const s of shiftList) {
      const saveName = `${fileName}-${s.date}-${timestamp}`;
      await saveShift(saveName, s);
    }
  };

  // -------------------
  // チーム / ポジション / スロット 操作
  // -------------------
  const addTeam = (date) => {
    const shift = shifts.value.find((s) => s.date === date);
    if (!shift) return;
    shift.teams.push({
      id: `team_${Date.now()}`,
      name: `新しいチーム ${shift.teams.length + 1}`,
      folded: false,
      locked: false,
      positions: [],
    });
  };

  const removeTeam = (date, teamId) => {
    const shift = shifts.value.find((s) => s.date === date);
    if (!shift) return;
    shift.teams = shift.teams.filter((t) => t.id !== teamId);
  };

  const duplicateTeam = (date, teamId) => {
    const shift = shifts.value.find((s) => s.date === date);
    if (!shift) return;
    const team = shift.teams.find((t) => t.id === teamId);
    if (!team) return;
    const newTeam = structuredClone(team);
    newTeam.id = `team_${Date.now()}`;
    shift.teams.push(newTeam);
  };

  const moveTeam = (fromDate, toDate, teamId) => {
    const fromShift = shifts.value.find((s) => s.date === fromDate);
    const toShift = shifts.value.find((s) => s.date === toDate);
    if (!fromShift || !toShift) return;
    const idx = fromShift.teams.findIndex((t) => t.id === teamId);
    if (idx === -1) return;
    const [team] = fromShift.teams.splice(idx, 1);
    toShift.teams.push(team);
  };

  const addPosition = (date, teamId) => {
    const team = shifts.value.find((s) => s.date === date)?.teams.find((t) => t.id === teamId);
    if (!team) return;
    team.positions.push({
      positionId: `pos_${Date.now()}`,
      name: `新しいポジション ${team.positions.length + 1}`,
      folded: false,
      locked: false,
      slots: [],
    });
  };

  const removePosition = (date, teamId, positionId) => {
    const team = shifts.value.find((s) => s.date === date)?.teams.find((t) => t.id === teamId);
    if (!team) return;
    team.positions = team.positions.filter((p) => p.positionId !== positionId);
  };

  const duplicatePosition = (date, teamId, positionId) => {
    const team = shifts.value.find((s) => s.date === date)?.teams.find((t) => t.id === teamId);
    if (!team) return;
    const pos = team.positions.find((p) => p.positionId === positionId);
    if (!pos) return;
    const newPos = structuredClone(pos);
    newPos.positionId = `pos_${Date.now()}`;
    team.positions.push(newPos);
  };

  const addSlot = (date, teamId, positionId) => {
    const pos = shifts.value.find((s) => s.date === date)
      ?.teams.find((t) => t.id === teamId)
      ?.positions.find((p) => p.positionId === positionId);
    if (!pos) return;
    pos.slots.push({
      slotId: `slot_${Date.now()}`,
      name: `スロット ${pos.slots.length + 1}`,
      members: [],
    });
  };

  const removeSlot = (date, teamId, positionId, slotId) => {
    const pos = shifts.value.find((s) => s.date === date)
      ?.teams.find((t) => t.id === teamId)
      ?.positions.find((p) => p.positionId === positionId);
    if (!pos) return;
    pos.slots = pos.slots.filter((s) => s.slotId !== slotId);
  };

  // -------------------
  // assignMemberToSlot: ドラッグで配置したメンバーをストアに反映する
  // blockData: { id, memberId, memberName, start_min, duration_min }
  // -------------------
  const assignMemberToSlot = (date, teamId, positionId, blockData) => {
    const shift = shifts.value.find((s) => s.date === date);
    if (!shift) {
      console.warn("assignMemberToSlot: shift not found", date);
      return;
    }
    const team = shift.teams.find((t) => t.id === teamId);
    if (!team) {
      console.warn("assignMemberToSlot: team not found", teamId);
      return;
    }
    const pos = team.positions.find((p) => p.positionId === positionId);
    if (!pos) {
      console.warn("assignMemberToSlot: position not found", positionId);
      return;
    }

    // pos.members? pos.slots? 既存データ形に合わせる
    // ここでは pos.slots の中に block を追加する（簡易実装）
    if (!Array.isArray(pos.slots)) pos.slots = [];
    pos.slots.push({
      slotId: blockData.id || `slot_${Date.now()}`,
      memberId: blockData.memberId,
      memberName: blockData.memberName,
      start_min: blockData.start_min,
      duration_min: blockData.duration_min,
    });
  };

  return {
    shifts,
    festivalDays,
    activeDay,
    isLoading,
    loadFestivalShifts,
    getShiftForActiveDay,
    setActiveDay,
    createNewShift,
    getShiftsByDates,
    saveShiftsByDates,

    addTeam,
    removeTeam,
    duplicateTeam,
    moveTeam,
    addPosition,
    removePosition,
    duplicatePosition,
    addSlot,
    removeSlot,

    // 新規 API
    assignMemberToSlot,
  };
});
