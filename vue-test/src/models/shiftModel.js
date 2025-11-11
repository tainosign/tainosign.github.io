// src/models/shiftModel.js
import { v4 as uuidv4 } from "uuid";

// src/models/shiftModel.js
import { v4 as uuidv4 } from "uuid";

export const createMemberModel = (data = {}) => ({
  // === ① 基本情報（Googleフォーム等のアンケート由来） ===
  id: data.id || uuidv4(),
  token: data.token || "", // 個人ページ用URLトークン
  name_kanji: data.name_kanji || "",
  name_furigana: data.name_furigana || "",
  gender: data.gender || "",
  affiliation: data.affiliation || "", // 所属（学生・会社員など）
  phone: data.phone || "",
  email: data.email || "",
  address: data.address || "", // 市町村まで
  participation_history: data.participation_history || "初めて",
  preferred_teams: data.preferred_teams || [], // 希望チーム
  available_dates: data.available_dates || [], // 参加可能日（例: ["2025-10-31", "2025-11-01"]）
  available_times: data.available_times || {}, 
  // 例: { "2025-10-31": ["午前", "午後"], "2025-11-01": ["午前"] }
  remarks: data.remarks || "", // 備考

  // === ② シフト関連 ===
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

  // === ③ リアルタイム状態 ===
  realtime_status: data.realtime_status || "未配置",
  realtime_updated_at: data.realtime_updated_at || null,
  location: data.location || null,
  is_active: data.is_active ?? true,

  // === ④ タスク関連 ===
  tasks_history: data.tasks_history || [],
  current_task: data.current_task || null,
  task_points: data.task_points || 0,

  // === ⑤ 表示・UI関連 ===
  avatar: data.avatar || {},
  nickname: data.nickname || "",
  joined_line: data.joined_line || false,
  line_openchat_id: data.line_openchat_id || "",
  last_contacted_at: data.last_contacted_at || null,

  // === ⑥ 参加履歴・評価関連 ===
  participation_logs: data.participation_logs || [],
  feedback: data.feedback || "",

  // === ⑦ 管理メタ情報 ===
  joined_at: data.joined_at || new Date(),
  updated_at: new Date(),
  change_logs: data.change_logs || [],

  // === ⑧ 拡張フィールド ===
  tags: data.tags || [],
});



export const createShiftModel = (data = {}) => ({
  id: data.id || uuidv4(),
  name: data.name || "",
  day: data.day || "",//YYYY-MM-DD
  slots: data.slots || [], // 各スロット情報を配列で保持
  created_at: new Date(),
  updated_at: new Date(),
});

export const createSlotModel = (data = {}) => ({
  id: data.id || uuidv4(),
  name: data.name || "スロット",
  teamId: data.teamId || null,
  members: data.members || [], // memberId 配列
  start_time: data.start_time || "06:00",
  end_time: data.end_time || "20:00",
  position: data.position || "",
  created_at: new Date(),
  updated_at: new Date(),
});

export function createPosition() {
  return {
    id: crypto.randomUUID(),
    name: "新ポジション",
    slots: [createSlotModel()], // createSlotModel() を呼ぶよう修正
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

export const createTaskModel = (data = {}) => ({
  id: data.id || uuidv4(),
  task_name: data.task_name || "",
  task_description: data.task_description || "",
  teamId: data.teamId || null,
  positionId: data.positionId || null,
  status: data.status || "未発行",
  issued_to: data.issued_to || [], // memberId 配列
  required_people: data.required_people || 1,
  task_type: data.task_type || "通常", // "常時" | "突発"
  created_at: new Date(),
  updated_at: new Date(),
});

export const createHistoryModel = (data = {}) => ({
  id: data.id || uuidv4(),
  type: data.type || "member_update", // member_update, shift_assign, task_issue など
  targetId: data.targetId || null,
  detail: data.detail || "",
  notified: data.notified || false,
  created_at: new Date(),
});
