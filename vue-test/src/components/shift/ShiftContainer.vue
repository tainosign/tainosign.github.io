<!-- src/components/shift/ShiftContainer.vue -->
<template>
  <div
    :class="[
      'shift-container flex flex-col bg-transparent transition-all duration-200',
      item.locked ? 'opacity-70' : ''
    ]"
    :style="containerStyle"
  >
    <!-- ヘッダー行： 左：ドラッグハンドル / 左寄せボタン群 / 中央タイトル / 右は空（将来的拡張） -->
    <div class="header-row flex items-start gap-1" :style="{ padding: cssPad }">
      <!-- ドラッグハンドル（左端 固定幅） -->
      <div
        class="drag-area flex-shrink-0"
        :style="{ width: dragAreaWidth }"
        draggable="true"
        @dragstart.stop="onHandleDragStart"
        @dragend.stop="onDragEnd"
        title="ドラッグで移動（ハンドルを長押し／ドラッグ）"
      >
        <div class="drag-symbol select-none">⋮</div>
      </div>

      <!-- 左上に集めた操作ボタン（折りたたみ / 削除） -->
      <div class="header-actions flex flex-col items-start" style="margin-left:4px;">
        <div class="flex gap-1 items-center">
          <!-- 折りたたみ -->
          <button
            @click.stop="toggleFold"
            class="btn-op"
            :title="item.folded ? '展開' : '折りたたみ'"
          >{{ item.folded ? '＋' : '－' }}</button>

          <!-- 削除（ロックされている場合は非表示） -->
          <button
            v-if="!item.locked"
            @click.stop="onRemove"
            class="btn-op text-red-600"
            title="削除"
          >✖</button>
        </div>

        <!-- 補助領域（追加ボタン等をここにスロットで入れられる） -->
        <div class="mt-1">
          <slot name="header-controls"></slot>
        </div>
      </div>

      <!-- 中央：ヘッダー本文（名前など） -->
      <div class="header-main flex-1 ml-2">
        <slot name="header">
          <div class="font-bold text-sm truncate">{{ item.name }}</div>
        </slot>
      </div>
    </div>

    <!-- コンテンツ（折りたたみ） -->
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
  list: { type: Array, default: () => [] },
  type: { type: String, default: "generic" },
  timelineWidthPx: { type: Number, default: null }, // optional: align to timeline width
  pad: { type: String, default: "0.1vw" },
});

const store = useShiftStore();
const dragManager = useDragManager();
const { toggleLock, toggleFold, duplicate, remove } = useShiftItem(props.item);

// css helpers
const cssPad = computed(() => props.pad || "0.1vw");
// drag handle width (1vw recommended). Use px fallback if needed.
const dragAreaWidth = computed(() => "1vw");

// container style: if timelineWidthPx provided, make container width = timeline + drag area + small buffer
const containerStyle = computed(() => {
  const base = {
    boxSizing: "border-box",
    padding: "0",
    margin: "0",
    // prevent shrinking in a flex row of shifts; let parent decide scroll
    flex: "0 0 auto",
    display: "inline-block",
  };

  if (props.timelineWidthPx) {
    // convert 1vw approx px for consistent total: use window width to approximate
    const handlePx = pxFromString(dragAreaWidth.value);
    const totalPx = props.timelineWidthPx + handlePx + 8; // +8px buffer
    return { ...base, width: `${totalPx}px` };
  }

  // otherwise allow width to be auto (fill parent)
  return { ...base, width: "auto", minWidth: "120px" };
});

// 操作：削除／複製など。type によって store の該当メソッドを呼ぶ
const onDuplicate = () => {
  // 既にコピー機能は廃止方針のため、必要なら実装を切り替えてください
  if (props.type === "team") {
    store.duplicateTeam(props.list[0]?.date, props.item.id);
  } else if (props.type === "position") {
    store.duplicatePosition(props.list[0]?.date, props.list[0]?.teamId, props.item.positionId);
  } else {
    duplicate(props.list);
  }
};

const onRemove = () => {
  // 削除は type に応じて store のメソッドを呼ぶ
  if (props.type === "team") {
    store.removeTeam(props.list[0]?.date, props.item.id);
  } else if (props.type === "position") {
    store.removePosition(props.list[0]?.date, props.list[0]?.teamId, props.item.positionId);
  } else {
    remove(props.list);
  }
};

// ドラッグハンドルからのみドラッグを開始
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

// 小さなユーティリティ — '1vw' 等を px に変換（おおよそ）
function pxFromString(str) {
  if (!str) return 0;
  if (typeof window === "undefined") return 16;
  if (str.endsWith("px")) return Number(str.replace("px", ""));
  if (str.endsWith("vw")) {
    const vw = Number(str.replace("vw", ""));
    return Math.round((vw / 100) * window.innerWidth);
  }
  if (str.endsWith("vh")) {
    const vh = Number(str.replace("vh", ""));
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

/* ベース */
.shift-container {
  margin: var(--mar);
  box-sizing: border-box;
  border-radius: 6px;
  /* outer border は取り払って軽い見た目に */
}

/* header row */
.header-row {
  display: flex;
  align-items: flex-start;
  gap: 0.4vw;
}

/* ドラッグハンドル（左端）*/
.drag-area {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
}
.drag-area:active { cursor: grabbing; }
.drag-symbol { font-size: 14px; color: #666; }

/* 左寄せボタン群（折りたたみ・削除） */
.header-actions {
  /* 左寄せで縦に並べる（追加コントロールは slot で下に出せる） */
}
.btn-op {
  font-size: 11px;
  padding: 4px 6px;
  border-radius: 6px;
  border: 1px solid #e6e6e6;
  background: #f3f3f3;
  cursor: pointer;
}
.btn-op.text-red-600 { color: #c53030; border-color: #f5c6cb; }

/* header main (title) */
.header-main {
  padding-left: 0.2vw;
}

/* content area */
.content-area {
  margin-top: 0.25vh;
}

/* トランジション */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* テキストの切り詰め */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
