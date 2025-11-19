<template>
  <div
    :class="[
      'shift-container flex flex-col bg-transparent transition-all duration-200',
      extraBoxClass,
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

          <!-- 削除は type によって扱いを分ける -->
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
          <div class="title-text truncate">{{ item.name || item.date || '（無題）' }}</div>
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
// fixed handle width
const handlePx = 32;

// box class for visual separation (date/team/position)
const extraBoxClass = computed(() => {
  if (props.type === "shift") return "box-shift";
  if (props.type === "team") return "box-team";
  if (props.type === "position") return "box-position";
  return "";
});

// container style: if timelineWidthPx provided, set width accordingly (include handle)
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

// onDuplicate/onRemove with explicit handling of shift/team/position
const onDuplicate = () => {
  if (props.type === "team") store.duplicateTeam(props.list[0]?.date, props.item.id);
  else if (props.type === "position") store.duplicatePosition(props.list[0]?.date, props.list[0]?.teamId, props.item.positionId);
  else if (props.type === "shift") {
    // simple duplicate by creating new shift with same date + suffix
    if (props.item?.date) {
      store.createNewShift([`${props.item.date}-copy-${Date.now()}`]);
    }
  } else {
    // fallback: use composable duplicate if parent list contains real object reference
    duplicate(props.list);
  }
};

const onRemove = () => {
  if (props.type === "team") store.removeTeam(props.list[0]?.date, props.item.id);
  else if (props.type === "position") store.removePosition(props.list[0]?.date, props.list[0]?.teamId, props.item.positionId);
  else if (props.type === "shift") {
    if (props.item?.date) store.removeShift(props.item.date);
  } else {
    // fallback: try composable remove (works when list contains real object reference)
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

/* base */
.shift-container { margin: var(--mar); box-sizing: border-box; border-radius: 6px; }

/* distinct box styles for visual separation */
.box-shift { border: 1px solid #dbeafe; padding: 6px; background: #fbfdff; }
.box-team { border: 1px dashed #e6f4ea; padding: 6px; background: #fcfffb; }
.box-position { border: 1px dotted #fff7ed; padding: 6px; background: #fffdfa; }

.header-row { display: flex; gap: 0.4vw; align-items: flex-start; }

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

/* transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity:0; }
</style>
