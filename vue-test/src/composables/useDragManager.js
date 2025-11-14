// src/composables/useDragManager.js
import { ref } from "vue";

const dropHandlers = ref({});
const draggingMember = ref(null);

export function useDragManager() {
  // 汎用 startDrag: 呼び出し側は e を渡すこと
  function startDrag(dragType, payload, e) {
    if (e && e.dataTransfer) {
      e.dataTransfer.effectAllowed = "copyMove";
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({
          dragType,
          payload,
        })
      );
    }
    // 特殊保持（必要なら）
    if (dragType === "member") {
      draggingMember.value = payload;
    }
  }

  // Drop のときに呼ぶ（ShiftSlot などが呼ぶ）
  // extraContext は任意でドロップ先情報などを渡せる
  function parseDrop(e, extraContext = null) {
    try {
      const raw = e.dataTransfer.getData("application/json");
      if (!raw) return;
      const { dragType, payload } = JSON.parse(raw);
      const handler = dropHandlers.value[dragType];
      if (handler) {
        handler(payload, e, extraContext);
      } else {
        console.warn("useDragManager: handler not found for dragType:", dragType);
      }
    } catch (err) {
      console.error("useDragManager.parseDrop error:", err);
    } finally {
      // clear ephemeral draggingMember
      draggingMember.value = null;
    }
  }

  // handler 登録
  function registerHandler(dragType, fn) {
    dropHandlers.value[dragType] = fn;
  }

  function unregisterHandler(dragType) {
    delete dropHandlers.value[dragType];
  }

  // member 用の簡易 API（任意）
  const startDragMember = (member, e) => {
    startDrag("member", member, e);
  };

  const getDraggingMember = () => draggingMember.value;
  const clearDrag = () => {
    draggingMember.value = null;
  };

  return {
    startDrag,
    parseDrop,
    registerHandler,
    unregisterHandler,
    startDragMember,
    getDraggingMember,
    clearDrag,
  };
}
