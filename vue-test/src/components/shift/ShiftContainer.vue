<!-- src/components/shift/ShiftContainer.vue -->
<template>
  <div
    :class="[
      'shift-container flex flex-col bg-transparent transition-all duration-200',
      item.locked ? 'opacity-70' : ''
    ]"
    :style="containerStyle"
  >
    <!-- header row -->
    <div class="header-row" :style="{ padding: cssPad }">
      <div
        class="drag-area"
        :style="{ width: handlePx + 'px' }"
        draggable="true"
        @dragstart.stop="onHandleDragStart"
        @dragend.stop="onDragEnd"
        title="ドラッグで移動（ハンドル）"
      >
        <div class="drag-symbol">⋮</div>
      </div>

      <div class="header-actions" :style="{ marginLeft: '6px' }">
        <div class="action-row">
          <button @click.stop="toggleFold" class="btn-op" :title="item.folded ? '展開' : '折りたたみ'">
            {{ item.folded ? '＋' : '－' }}
          </button>

          <!-- 削除は type に依り処理 -->
          <button v-if="!item.locked" @click.stop="onRemove" class="btn-op btn-remove" title="削除">✖</button>

          <button @click.stop="onDuplicate" class="btn-op" title="複製">📄</button>

          <button @click.stop="toggleLock" :class="['btn-op', item.locked ? 'locked' : '']" :title="item.locked ? 'ロック解除' : 'ロック'">
            {{ item.locked ? '🔒' : '🔓' }}
          </button>
        </div>

        <div class="header-controls-slot">
          <slot name="header-controls"></slot>
        </div>
      </div>

      <div class="header-main">
        <slot name="header">
          <div class="title-text truncate">{{ item.name }}</div>
        </slot>
      </div>
    </div>

    <transition name="fade">
      <div v-show="!item.folded" class="content-area" :style="{ padding: cssPad }">
        <slot name="body"></slot>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useShiftItem } from "@/composables/useShiftItem";
import { useShiftStore } from "@/stores/shiftStore";
import { useDragManager } from "@/composables/useDragManager";

const props = defineProps({
  item: { type: Object, required: true },
  list: { type: Array, default: () => [] },
  type: { type: String, default: "generic" },
  timelineWidthPx: { type: Number, default: null },
  pad: { type: String, default: "0.1vw" },
});

const store = useShiftStore();
const dragManager = useDragManager();
const { toggleLock, toggleFold, duplicate, remove } = useShiftItem(props.item);

// css helpers
const cssPad = computed(() => props.pad || "0.1vw");
// 固定ハンドル幅（px）
const handlePx = 32;

// container width: timelineWidthPx があるときはそれに合わせる（ハンドル領域を含める）
const containerStyle = computed(() => {
  const base = {
    boxSizing: "border-box",
    padding: "0",
    margin: "0",
    flex: "0 0 auto",
    display: "block",
  };

  if (props.timelineWidthPx) {
    const totalPx = props.timelineWidthPx + handlePx + 12;
    return { ...base, width: `${totalPx}px` };
  }
  return { ...base, width: "auto", minWidth: "120px" };
});

// onDuplicate/onRemove は type によって store の該当関数を呼ぶ
const onDuplicate = () => {
  if (props.type === "team") store.duplicateTeam(props.list[0]?.date, props.item.id);
  else if (props.type === "position") store.duplicatePosition(props.list[0]?.date, props.list[0]?.teamId, props.item.positionId);
  else if (props.type === "shift") {
    // shift の複製（簡易）： store に複製処理が無ければ単純に createNewShift を使う
    if (props.item?.date) {
      store.createNewShift([props.item.date + "-copy-" + Date.now()]);
    }
  } else {
    duplicate(props.list);
  }
};

const onRemove = () => {
  if (props.type === "team") store.removeTeam(props.list[0]?.date, props.item.id);
  else if (props.type === "position") store.removePosition(props.list[0]?.date, props.list[0]?.teamId, props.item.positionId);
  else if (props.type === "shift") {
    // shift 削除：store 側に removeShift(date) を追加している想定
    if (props.item?.date) store.removeShift(props.item.date);
  } else {
    // fallback: try to remove from provided list
    remove(props.list);
  }
};

// drag handle
const onHandleDragStart = (e) => {
  const payload = { type: props.type, item: props.item, sourceDate: props.list[0]?.date };
  if (e?.dataTransfer) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/json", JSON.stringify({ dragType: "shiftItem", payload }));
  }
  dragManager.startDrag("shiftItem", payload, e);
};
const onDragEnd = () => {
  dragManager.clearDrag();
};
</script>

<style scoped>
:root { --pad: 0.1vw; --mar: 0.1vw; }

.shift-container {
  margin: var(--mar);
  box-sizing: border-box;
  border-radius: 6px;
  border: 1px solid transparent;
}

/* 日付やチームごとの視認性のため、親側で枠線を付けたい場合はここで上書きできます */
.header-row {
  display: flex;
  gap: 0.4vw;
  align-items: flex-start;
}

.drag-area { height: 36px; display:flex; align-items:center; justify-content:center; cursor:grab; user-select:none; }
.drag-symbol { font-size:16px; color:#666; }

.header-actions { display:flex; flex-direction:column; align-items:flex-start; justify-content:flex-start; }
.action-row { display:flex; gap:6px; align-items:center; }

.btn-op { font-size:12px; padding:4px 6px; border-radius:6px; border:1px solid #e6e6e6; background:#f7f7f7; cursor:pointer; }
.btn-op.locked { background:#444; color:white; }
.btn-op.btn-remove { background:#fff4f4; border-color:#f5c6cb; color:#c53030; }

.header-main { flex:1 1 auto; min-width:0; }
.title-text { font-weight:600; font-size:0.95rem; }

.content-area { margin-top:6px; }

.truncate { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity:0; }
</style>
