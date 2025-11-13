// useDragManager.js
import { ref } from "vue";

const dropHandlers = ref({});
const draggingMember = ref(null);

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






  const startDragMember = (member) => {
    draggingMember.value = member;
  };

  const getDraggingMember = () => draggingMember.value;

  const clearDrag = () => {
    draggingMember.value = null;
  };


  return {
    startDrag,
    parseDrop,
    registerHandler,
    startDragMember,
    getDraggingMember,
    clearDrag,
  };
}
