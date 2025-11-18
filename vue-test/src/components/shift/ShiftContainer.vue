<!-- src/components/shift/ShiftContainer.vue -->
<template>
  <div
    :class="[
      'shift-container flex flex-col bg-transparent transition-all duration-200',
      item.locked ? 'opacity-70' : ''
    ]"
    :style="containerStyle"
  >
    <!-- header row: left drag handle, left-top buttons, title -->
    <div class="header-row" :style="{ padding: cssPad }">
      <!-- ハンドル（ここだけ draggable） -->
      <div
        class="drag-area"
        :style="{ width: handlePx + 'px' }"
        draggable="true"
        @dragstart.stop="onHandleDragStart"
        @dragend.stop="onDragEnd"
        title="ドラッグで移動（ハンドルを長押し／ドラッグ）"
      >
        <div class="drag-symbol">⋮</div>
      </div>

      <!-- 左上操作ボタン群（縦寄せ） -->
      <div class="header-actions" :style="{ marginLeft: '6px' }">
        <div class="action-row">
          <button @click.stop="toggleFold" class="btn-op" :title="item.folded ? '展開' : '折りたたみ'">
            {{ item.folded ? '＋' : '－' }}
          </button>

          <button v-if="!item.locked" @click.stop="onRemove" class="btn-op btn-remove" title="削除">✖</button>

          <button @click.stop="onDuplicate" class="btn-op" title="複製">📄</button>

          <button @click.stop="toggleLock" :class="['btn-op', item.locked ? 'locked' : '']" :title="item.locked ? 'ロック解除' : 'ロック'">
            {{ item.locked ? '🔒' : '🔓' }}
          </button>
        </div>

        <!-- 補助領域（追加ボタンなどを slot で差し込める） -->
        <div class="header-controls-slot">
          <slot name="header-controls"></slot>
        </div>
      </div>

      <!-- 中央タイトル -->
      <div class="header-main">
        <slot name="header">
          <div class="title-text truncate">{{ item.name }}</div>
        </slot>
      </div>
    </div>

    <!-- body -->
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

// store / composables
const store = useShiftStore();
const dragManager = useDragManager();
const { toggleLock, toggleFold, duplicate, remove } = useShiftItem(props.item);

// CSS helpers
const cssPad = computed(() => props.pad || "0.1vw");

// 固定ハンドル幅（px） - 32px に設定（見た目とクリックエリアが安定）
const handlePx = 32;

// container width: タイムライン幅が与えられていればそれに合わせる（ハンドル領域 + バッファを含む）
const containerStyle = computed(() => {
  const base = {
    boxSizing: "border-box",
    padding: "0",
    margin: "0",
    flex: "0 0 auto",
    display: "inline-block",
  };

  if (props.timelineWidthPx) {
    const totalPx = props.timelineWidthPx + handlePx + 12; // buffer
    return { ...base, width: `${totalPx}px` };
  }
  // フォールバック：auto 幅（親コンテナ側で並べる）
  return { ...base, width: "auto", minWidth: "120px" };
});

// 操作ハンドラ（store 呼び出し）
const onDuplicate = () => {
  if (props.type === "team") store.duplicateTeam(props.list[0]?.date, props.item.id);
  else if (props.type === "position") store.duplicatePosition(props.list[0]?.date, props.list[0]?.teamId, props.item.positionId);
  else duplicate(props.list);
};

const onRemove = () => {
  if (props.type === "team") store.removeTeam(props.list[0]?.date, props.item.id);
  else if (props.type === "position") store.removePosition(props.list[0]?.date, props.list[0]?.teamId, props.item.positionId);
  else remove(props.list);
};

// ドラッグはハンドルのみで開始（他の要素と衝突しない）
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
:root {
  --pad: 0.1vw;
  --mar: 0.1vw;
}

/* ベース */
.shift-container {
  margin: var(--mar);
  box-sizing: border-box;
  border-radius: 6px;
}

/* header row */
.header-row {
  display: flex;
  gap: 0.4vw;
  align-items: flex-start;
}

/* ハンドル（左端） */
.drag-area {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
  background: transparent;
}
.drag-area:active { cursor: grabbing; }
.drag-symbol { font-size: 16px; color: #666; }

/* 左上操作群 */
.header-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
}
.action-row { display: flex; gap: 6px; align-items: center; }

/* small buttons */
.btn-op {
  font-size: 12px;
  padding: 4px 6px;
  border-radius: 6px;
  border: 1px solid #e6e6e6;
  background: #f7f7f7;
  cursor: pointer;
}
.btn-op.locked { background: #444; color: white; }
.btn-op.btn-remove { background: #fff4f4; border-color: #f5c6cb; color: #c53030; }

/* header main */
.header-main { flex: 1 1 auto; min-width: 0; }
.title-text { font-weight: 600; font-size: 0.95rem; }

/* content */
.content-area { margin-top: 6px; }

/* truncate helper */
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
