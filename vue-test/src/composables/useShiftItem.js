// src/composables/useShiftItem.js
import { ref } from "vue";

export function useShiftItem(item) {
  const toggleLock = () => {
    item.locked = !item.locked;
  };

  const toggleFold = () => {
    item.folded = !item.folded;
  };

  const duplicate = (list) => {
    if (!Array.isArray(list)) return;
    const copy = JSON.parse(JSON.stringify(item));
    copy.id = Date.now(); // 一意なIDを付与
    list.splice(list.indexOf(item) + 1, 0, copy);
  };

  const remove = (list) => {
    if (!Array.isArray(list)) return;
    const index = list.indexOf(item);
    if (index !== -1) {
      list.splice(index, 1); // 対象だけ削除
    }
  };

  return {
    toggleLock,
    toggleFold,
    duplicate,
    remove,
  };
}
