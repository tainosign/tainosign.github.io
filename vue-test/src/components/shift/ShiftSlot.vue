<!-- src/components/shift/ShiftSlot.vue -->
<template>
  <div
    class="shift-slot border rounded p-slot bg-white relative"
    :style="{ padding: cssPad }"
  >
    <!-- タイトル -->
    <div class="text-[10px] text-gray-600 font-semibold mb-0.5 text-center">
      タイムライン（{{ fmtHour(startHour) }}〜{{ fmtHour(endHour) }}）
    </div>

    <!-- タイムライン領域（横スクロール可） -->
    <div
      class="timeline relative bg-gray-50 border overflow-auto"
      ref="timelineRef"
      @dragover.prevent="onDragOver"
      @drop.prevent="onDrop"
      :style="{ height: timelineHeight + 'px' }"
    >
      <!-- 時間ラベル（上部ではなく下に表示するのでここでは薄い罫線だけ） -->
      <div
        v-for="(label, idx) in timeGrid"
        :key="idx"
        class="absolute top-0 left-0 pointer-events-none"
        :style="{
          left: (idx * gridStepPx) + 'px',
          width: gridStepPx + 'px'
        }"
      >
        <!-- 補助線 -->
        <div
          :class="label.endsWith(':00') ? 'hour-line' : 'minor-line'"
          :style="{ height: '100%' }"
        ></div>
      </div>

      <!-- 既に配置されたブロック（縦に積む） -->
      <div
        v-for="(block, i) in localSlots"
        :key="block.id"
        class="placed-block absolute bg-white border rounded shadow-sm"
        :style="blockInlineStyle(block, i)"
        draggable="true"
        @dragstart="onBlockDragStart(block, $event)"
        @mousedown.prevent="selectBlock(block, $event)"
      >
        <div class="block-body flex items-center justify-between px-1">
          <div class="truncate text-[11px]">{{ block.memberName || '未割当' }}</div>
          <!-- 小さい操作群 -->
          <div class="flex items-center gap-1">
            <button class="btn-small" @click.stop="changeDuration(block, -10)">-</button>
            <button class="btn-small" @click.stop="changeDuration(block, 10)">+</button>
            <button class="btn-small text-red-600" @click.stop="removeBlock(block.id)">✖</button>
          </div>
        </div>

        <!-- 時間ラベルはブロック下部に表示 -->
        <div class="block-time text-[10px] text-gray-500 text-center mt-1 select-none">
          {{ minutesToHHMM(block.start_min) }} → {{ minutesToHHMM(block.start_min + block.duration_min) }}
        </div>
      </div>
    </div>

    <!-- 選択中表示 -->
    <div v-if="selectedBlock" class="mt-1 text-[10px]">
      <div>選択中: <strong>{{ selectedBlock.memberName || '未割当' }}</strong></div>
      <div class="text-gray-600">
        開始: {{ minutesToHHMM(selectedBlock.start_min) }} /
        長さ: {{ selectedBlock.duration_min }}分
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useDragManager } from "@/composables/useDragManager";
import { useShiftStore } from "@/stores/shiftStore";

// props
const props = defineProps({
  shiftDate: { type: String, required: false },
  teamId: { type: String, required: false },
  positionId: { type: String, required: false },
  position: Object,
  slots: { type: Array, default: () => [] },
  // 10分あたりのピクセル（デフォルト 6px）
  unitPer10Min: { type: Number, default: 6 },
  // スロット高さ（px）
  slotHeight: { type: Number, default: 40 },
  startHour: { type: Number, default: 7 },
  endHour: { type: Number, default: 20 },
});

const emit = defineEmits(["update-slots"]);

const dragManager = useDragManager();
const store = useShiftStore();

const timelineRef = ref(null);
const selectedBlock = ref(null);

// constants derived
const totalMinutes = computed(() => (props.endHour - props.startHour) * 60);
const gridStepPx = computed(() => props.unitPer10Min); // 10分ごとの幅
const stepsCount = computed(() => totalMinutes.value / 10);
const timelineWidthPx = computed(() => Math.max(stepsCount.value * gridStepPx.value, 320)); // 最低幅保障
const timelineHeight = computed(() => props.slotHeight * Math.max((props.slots || []).length, 1) + 24); // 各ブロック縦積み分 + 下部余白

// local copy of slots so we can edit visually then emit
const localSlots = ref((props.slots || []).map((s) => ({ ...s })));

// time grid labels for rendering guide lines
const timeGrid = computed(() => {
  const arr = [];
  for (let t = 0; t < stepsCount.value; t++) {
    const minutes = props.startHour * 60 + t * 10;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    arr.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
  return arr;
});

// CSS small helpers
const cssPad = computed(() => `calc(var(--pad, 0.1vw))`); // container padding variable (applied)
const startHour = props.startHour;
const endHour = props.endHour;

// drag over
function onDragOver(e) {
  e.dataTransfer.dropEffect = "move";
}

// drop from MemberPanel or other drag source
function onDrop(e) {
  try {
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;
    const { dragType, payload } = JSON.parse(raw);

    // only handle 'member' drops here
    if (dragType === "member") {
      const rect = timelineRef.value.getBoundingClientRect();
      const x = e.clientX - rect.left;

      // clamp x
      const clampedX = Math.max(0, Math.min(x, timelineWidthPx.value - 1));

      // compute minutes from left (rounded to nearest gridUnit)
      const minutesFromLeft = Math.round((clampedX / gridStepPx.value) * 10); // pixels -> 10min steps *10 => minutes
      const start_min = props.startHour * 60 + minutesFromLeft;

      // create block
      const block = {
        id: `blk_${Date.now()}`,
        memberId: payload.id || payload.uid || null,
        memberName: payload.name_kanji || payload.name || "メンバー",
        start_min,
        duration_min: 60, // default 60min (adjustable)
      };

      localSlots.value.push(block);
      emit("update-slots", localSlots.value);

      // reflect to store if shiftDate/teamId/positionId provided
      if (props.shiftDate && props.teamId && props.positionId && store.assignMemberToSlot) {
        store.assignMemberToSlot(
          props.shiftDate,
          props.teamId,
          props.positionId,
          {
            id: block.id,
            memberId: block.memberId,
            memberName: block.memberName,
            start_min: block.start_min,
            duration_min: block.duration_min,
          }
        );
      }
    }
  } catch (err) {
    console.error("ShiftSlot.onDrop parse error:", err);
  }
}

// compute left/width style for a block and vertical stacking top offset (index)
function blockInlineStyle(block, idx) {
  const leftPx = ((block.start_min - props.startHour * 60) / 10) * gridStepPx.value;
  const widthPx = (block.duration_min / 10) * gridStepPx.value;
  const topPx = idx * (props.slotHeight + 6); // vertical gap 6px
  return {
    left: `${leftPx}px`,
    width: `${Math.max(6, widthPx)}px`,
    top: `${topPx}px`,
    height: `${props.slotHeight}px`,
    padding: "2px 6px",
    boxSizing: "border-box",
  };
}

function minutesToHHMM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function fmtHour(h) {
  return `${String(h).padStart(2, "0")}:00`;
}
function formatBlockTime(block) {
  return `${minutesToHHMM(block.start_min)}〜${minutesToHHMM(block.start_min + block.duration_min)}`;
}

function formatBlockTimeShort(block) {
  return minutesToHHMM(block.start_min);
}

function changeDuration(block, delta) {
  // delta in minutes (±10)
  block.duration_min = Math.max(10, Math.round((block.duration_min + delta) / 10) * 10);
  emit("update-slots", localSlots.value);
}

function removeBlock(id) {
  // remove locally
  localSlots.value = localSlots.value.filter((b) => b.id !== id);
  emit("update-slots", localSlots.value);

  // also try to remove from store if we can find it
  if (props.shiftDate && props.teamId && props.positionId) {
    // try to find position in store and remove slot by id if exists
    const shift = store.shifts.find((s) => s.date === props.shiftDate);
    if (shift) {
      const team = shift.teams.find((t) => t.id === props.teamId);
      if (team) {
        const pos = team.positions.find((p) => p.positionId === props.positionId);
        if (pos && Array.isArray(pos.slots)) {
          pos.slots = pos.slots.filter((s) => s.slotId !== id && s.id !== id);
        }
      }
    }
  }
}

function selectBlock(block) {
  selectedBlock.value = block;
}

// dragging an existing block (for move)
function onBlockDragStart(block, e) {
  // set transfer data so other drop targets can pick it up
  dragManager.startDrag("slotBlock", block, e);
  // also set native JSON so drop handlers relying on dataTransfer can parse
  e.dataTransfer.setData("application/json", JSON.stringify({ dragType: "slotBlock", payload: block }));
}

// sync props -> local
watch(
  () => props.slots,
  (v) => {
    localSlots.value = (v || []).map((s) => ({ ...s }));
  },
  { deep: true }
);

// expose some values to template style binding
const gridStepPxValue = gridStepPx;
</script>

<style scoped>
/* CSS variables for global spacing */
:root {
  --pad: 0.1vw;
  --mar: 0.1vw;
  --pad-v: 0.1vh;
}

/* container */
.shift-slot {
  margin: var(--mar);
  box-sizing: border-box;
}

/* timeline base */
.timeline {
  min-width: 320px;
  width: 100%;
  /* set large width via inline style if parent sets it; we position children absolutely with px */
  position: relative;
  white-space: nowrap;
  overflow-x: auto;
  padding-left: 1vw; /* leave space for drag-handle alignment with containers */
}

/* guide lines */
.hour-line {
  border-left: 1px solid rgba(120,120,120,0.25);
}
.minor-line {
  border-left: 1px solid rgba(200,200,200,0.12);
}

/* placed block */
.placed-block {
  box-sizing: border-box;
  border-radius: 6px;
  overflow: visible;
  background: #fff;
}

/* block body & buttons */
.block-body {
  height: calc(100% - 18px); /* leave space for time label below */
  align-items: center;
}
.btn-small {
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: #f7f7f7;
}

/* block time under block */
.block-time {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -18px; /* sits under block */
  font-size: 10px;
  line-height: 12px;
}

/* selected highlight (optional) */
.placed-block[draggable="true"]:active {
  opacity: 0.9;
}

/* utility */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
