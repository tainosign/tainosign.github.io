// useDragManager.js
import { ref } from "vue";

const dropHandlers = ref({});

export function useDragManager() {
  // Drag開始
  function startDrag(dragType, payload, e) {
    e.dataTransfer.effectAllowed = "copyMove";
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        dragType,
        payload,
      })
    );
  }

  // Drop解析＆呼び出し
  function parseDrop(e, extraContext = null) {
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    const { dragType, payload } = JSON.parse(raw);

    const handler = dropHandlers.value[dragType];
    if (handler) {
      handler(payload, e, extraContext);
    } else {
      console.warn("Handler not found for dragType:", dragType);
    }
  }

  // handler登録
  function registerHandler(dragType, fn) {
    dropHandlers.value[dragType] = fn;
  }

  return {
    startDrag,
    parseDrop,
    registerHandler,
  };
}
