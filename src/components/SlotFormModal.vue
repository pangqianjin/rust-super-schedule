<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import type { WeekdayKey } from "../types";
import { PERIOD_BLOCKS, WEEKDAY_KEYS, WEEKDAY_LABEL } from "../constants";
import { slotKey } from "../utils";

const props = defineProps<{
  /** 当前已经有内容的格子键，用来提示哪些会被覆盖 */
  taken: string[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "submit", keys: string[], note: string): void;
}>();

const pickedDays = reactive<WeekdayKey[]>([]);
const pickedPeriods = reactive<string[]>([]);
const note = ref("");

function toggle<T>(list: T[], value: T) {
  const i = list.indexOf(value);
  if (i >= 0) list.splice(i, 1);
  else list.push(value);
}

/** 星期 × 节次 的全部组合 */
const keys = computed(() =>
  pickedDays.flatMap((d) => pickedPeriods.map((p) => slotKey(d, p))),
);

const overwriteCount = computed(
  () => keys.value.filter((k) => props.taken.includes(k)).length,
);

function submit() {
  if (!keys.value.length) return;
  emit("submit", keys.value, note.value.trim());
}
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-head">
        <h3>录入课程</h3>
        <button class="btn ghost" @click="emit('close')">关闭</button>
      </div>

      <div class="modal-body">
        <div class="field">
          <label>星期<span class="tip">可多选</span></label>
          <div class="chips">
            <button
              v-for="d in WEEKDAY_KEYS"
              :key="d"
              class="chip"
              :class="{ on: pickedDays.includes(d) }"
              @click="toggle(pickedDays, d)"
            >
              {{ WEEKDAY_LABEL[d] }}
            </button>
          </div>
        </div>

        <div class="field">
          <label>节次<span class="tip">可多选</span></label>
          <div v-for="block in PERIOD_BLOCKS" :key="block.id" class="period-row">
            <span class="period-block">{{ block.label }}</span>
            <div class="chips">
              <button
                v-for="p in block.periods"
                :key="p.id"
                class="chip"
                :class="{ on: pickedPeriods.includes(p.id) }"
                @click="toggle(pickedPeriods, p.id)"
              >
                {{ p.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="field">
          <label>备注<span class="tip">可选，比如班级</span></label>
          <input class="note-input" type="text" v-model="note" placeholder="高一(2)班" />
        </div>
      </div>

      <div class="modal-foot">
        <span class="hint">
          将录入 {{ keys.length }} 个格子
          <template v-if="overwriteCount">（{{ overwriteCount }} 个已有内容，会被覆盖）</template>
        </span>
        <div class="foot-btns">
          <button class="btn ghost" @click="emit('close')">取消</button>
          <button class="btn primary" :disabled="!keys.length" @click="submit">添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 24, 34, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: var(--panel);
  border-radius: 14px;
  width: 560px;
  max-width: calc(100vw - 40px);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--line);
}
.modal-head h3 {
  margin: 0;
  font-size: 16px;
}
.modal-body {
  padding: 16px 18px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.field label {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}
.tip {
  font-size: 12px;
  font-weight: 400;
  color: var(--muted);
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chip {
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 13px;
  font-family: inherit;
  color: var(--text);
  cursor: pointer;
  transition: all 0.12s;
}
.chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.chip.on {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  font-weight: 600;
}
.period-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
}
.period-row:last-child {
  margin-bottom: 0;
}
.period-block {
  flex-shrink: 0;
  width: 44px;
  padding-top: 6px;
  font-size: 12px;
  color: var(--muted);
}
.note-input {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
  font-family: inherit;
}
.note-input:focus {
  outline: none;
  border-color: var(--accent);
}
.modal-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-top: 1px solid var(--line);
}
.hint {
  font-size: 12px;
  color: var(--muted);
}
.foot-btns {
  display: flex;
  gap: 8px;
}
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
