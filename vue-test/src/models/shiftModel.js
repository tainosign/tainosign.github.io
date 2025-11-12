// src/models/shiftModel.js
import { v4 as uuidv4 } from "uuid";
import { firestoreTimestampJST, toJSTISOStringFromInput } from "@/composables/useJST.js";

export const createMemberModel = (data = {}) => ({
  id: data.id || uuidv4(),
  token: data.token || "",
  name_kanji: data.name_kanji || "",
  name_furigana: data.name_furigana || "",
  gender: data.gender || "",
  affiliation: data.affiliation || "",
  phone: data.phone || "",
  email: data.email || "",
  address: data.address || "",
  participation_history: data.participation_history || "初めて",
  preferred_teams: data.preferred_teams || [],
  available_dates: data.available_dates || [],
  available_times: data.available_times || {},
  remarks: data.remarks || "",

  status: data.status || "未配置",
  teamId: data.teamId || null,
  positionId: data.positionId || null,
  shiftIds: data.shiftIds || [],
  assigned_tasks: data.assigned_tasks || [],
  fixed: data.fixed || false,
  position_start_time: data.position_start_time || null,
  position_end_time: data.position_end_time || null,
  position_duration: data.position_duration || 0,
  shift_summary: data.shift_summary || {},

  realtime_status: data.realtime_status || "未配置",
  realtime_updated_at: data.realtime_updated_at || null,
  location: data.location || null,
  is_active: data.is_active ?? true,

  tasks_history: data.tasks_history || [],
  current_task: data.current_task || null,
  task_points: data.task_points || 0,

  avatar: data.avatar || {},
  nickname: data.nickname || "",
  joined_line: data.joined_line || false,
  line_openchat_id: data.line_openchat_id || "",
  last_contacted_at: data.last_contacted_at || null,

  participation_logs: data.participation_logs || [],
  feedback: data.feedback || "",

  // ✅ JST記録
  joined_at: data.joined_at || firestoreTimestampJST(),
  updated_at: firestoreTimestampJST(),
  change_logs: data.change_logs || [],

  tags: data.tags || [],
});

export const createShiftModel = (data = {}) => ({
  id: data.id || uuidv4(),
  name: data.name || "",
  day: data.day || "",
  slots: data.slots || [],
  created_at: firestoreTimestampJST(),
  updated_at: firestoreTimestampJST(),
});

export const createSlotModel = (data = {}) => ({
  id: data.id || uuidv4(),
  name: data.name || "スロット",
  teamId: data.teamId || null,
  members: data.members || [],
  start_time: data.start_time || toJSTISOStringFromInput("2025-01-01", "06:00"),
  end_time: data.end_time || toJSTISOStringFromInput("2025-01-01", "20:00"),
  position: data.position || "",
  created_at: firestoreTimestampJST(),
  updated_at: firestoreTimestampJST(),
});

export function createPosition() {
  return {
    id: crypto.randomUUID(),
    name: "新ポジション",
    slots: [createSlotModel()],
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
