import { reactive } from "vue";

export function useShiftItem(item) {
  const toggleLock = () => (item.locked = !item.locked);
  const toggleFold = () => (item.folded = !item.folded);

  const duplicate = (list) => {
    const copy = JSON.parse(JSON.stringify(item));
    copy.id = crypto.randomUUID();
    list.push(copy);
  };

  const remove = (list) => {
    const idx = list.findIndex((x) => x.id === item.id);
    if (idx !== -1) list.splice(idx, 1);
  };

  return { toggleLock, toggleFold, duplicate, remove };
}
