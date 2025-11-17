<template>
  <div
    :class="[
      'shift-container flex flex-col bg-transparent transition-all duration-200',
      item.locked ? 'opacity-70' : ''
    ]"
    :style="containerStyle"
  >
    <!-- ヘッダー行: 左ドラッグエリア / 中央ラベル領域 / 右ボタン群 -->
    <div class="header-row flex items-start gap-1" :style="{ padding: cssPad }">
      <!-- 左: 固定ドラッグエリア (1vw) -->
      <div
        class="drag-area flex-shrink-0"
        :style="{ width: dragAreaWidth }"
        draggable="true"
        @dragstart.stop="onHandleDragStart"
        @dragend.stop="onDragEnd"
        title="ドラッグ（長押し可）"
      >
        <div class="drag-symbol select-none">⋮</div>
      </div>

      <!-- 中央: 名前等 -->
      <div class="header-main flex-1">
        <slot name="header">
          <div class="font-bold text-sm truncate">{{ item.name }}</div>
        </slot>
      </div>

      <!-- 右: 操作ボタン群（左上に固める） -->
      <div class="header-actions flex flex-col gap-1 items-start">
        <div class="flex gap-1">
          <button @click.stop="toggleFold" class="btn-op" title="折りたたみ"> {{ item.folded ? '＋' : '－' }} </button>
          <button @click.stop="toggleLock" :class="['btn-op', item.locked ? 'locked' : '']" title="ロック">
            {{ item.locked ? '🔒' : '🔓' }}
          </button>
          <button @click.stop="onDuplicate" class="btn-op" title="複製">📄</button>
          <button v-if="!item.locked" @click.stop="onRemove" class="btn-op text-red-600" title="削除">✖</button>
        </div>

        <!-- 下段: 補助領域（追加ボタンなど） -->
        <div class="mt-1">
          <slot name="header-controls"></slot>
        </div>
      </div>
    </div>

    <!-- 内容部分 -->
    <transition name="fade">
      <div v-show="!item.folded" class="content-area overflow-visible" :style="{ padding: cssPad }">
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
  list: { type: Array, default: () => [] }, // parent reference (used by duplications/removals)
  type: { type: String, default: "generic" },
  // timelineWidthPx: when provided, compute container width so the timeline fits without inner scroll
  timelineWidthPx: { type: Number, default: null },
  pad: { type: String, default: "0.1vw" },
});

const store = useShiftStore();
const dragManager = useDragManager();
const { toggleLock, toggleFold, duplicate, remove } = useShiftItem(props.item);

const cssPad = computed(() => props.pad || "0.1vw");
const dragAreaWidth = computed(() => "1vw");

// compute container width: timelineWidthPx + dragAreaWidth + small buffer
const containerStyle = computed(() => {
  const base = {
    boxSizing: "border-box",
    padding: "0",
    margin: "0",
    overflow: "visible",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  };

  if (props.timelineWidthPx && Number.isFinite(props.timelineWidthPx)) {
    const extra = pxFromString(dragAreaWidth.value) + 12; // handle + padding buffer
    const totalPx = props.timelineWidthPx + extra;
    return { ...base, width: `${totalPx}px` };
  }

  // fallback to flexible width
  return { ...base, width: "100%" };
});

// helpers to call duplicate/remove
const onDuplicate = () => {
  if (props.type === "team") {
    store.duplicateTeam(props.list[0]?.date, props.item.id);
  } else if (props.type === "position") {
    store.duplicatePosition(props.list[0]?.date, props.list[0]?.teamId, props.item.positionId);
  } else {
    duplicate(props.list);
  }
};
const onRemove = () => {
  if (props.type === "team") {
    store.removeTeam(props.list[0]?.date, props.item.id);
  } else if (props.type === "position") {
    store.removePosition(props.list[0]?.date, props.list[0]?.teamId, props.item.positionId);
  } else {
    remove(props.list);
  }
};

// drag handle start
const onHandleDragStart = (e) => {
  const payload = { type: props.type, item: props.item, sourceDate: props.list[0]?.date };
  if (e?.dataTransfer) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/json", JSON.stringify({ dragType: "shiftItem", payload }));
  }
  dragManager.startDrag("shiftItem", payload, e);
};
const onDragEnd = (e) => {
  dragManager.clearDrag();
};

// small utility to convert px/vw/vh string to px
function pxFromString(str) {
  if (!str) return 0;
  if (typeof str === "number") return str;
  if (String(str).endsWith("px")) return Number(String(str).replace("px", ""));
  if (String(str).endsWith("vw")) {
    const vw = Number(String(str).replace("vw", ""));
    return Math.round((vw / 100) * window.innerWidth);
  }
  if (String(str).endsWith("vh")) {
    const vh = Number(String(str).replace("vh", ""));
    return Math.round((vh / 100) * window.innerHeight);
  }
  return Number(str) || 0;
}
</script>

<style scoped>
:root {
  --pad: 0.1vw;
  --mar: 0.1vw;
}

/* container baseline */
.shift-container {
  margin: var(--mar);
  box-sizing: border-box;
  border-radius: 6px;
}

/* header row */
.header-row {
  display: flex;
  align-items: flex-start;
  gap: 0.2vw;
  width: 100%;
}

/* drag area */
.drag-area {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
}
.drag-area:active { cursor: grabbing; }
.drag-symbol {
  font-size: 14px;
  color: #666;
}

/* header main */
.header-main {
  padding-left: 0.2vw;
}

/* actions */
.header-actions .btn-op {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid #e6e6e6;
  background: #f3f3f3;
  cursor: pointer;
}
.header-actions .btn-op.locked {
  background: #444;
  color: white;
}

/* content area */
.content-area {
  margin-top: 0.25vh;
  width: 100%;
}

/* truncate helper */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
