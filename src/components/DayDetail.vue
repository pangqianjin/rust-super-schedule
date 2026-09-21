<script setup lang="ts">
import { computed } from "vue";
import type { Entry, Kind } from "../types";
import { KIND_LABEL, KIND_ORDER, PRICE } from "../constants";
import { fmtMoney } from "../utils";

const props = defineProps<{
  title: string;
  entries: Entry[];
  income: number;
}>();

const emit = defineEmits<{
  (e: "update", entries: Entry[]): void;
  (e: "show-detail"): void;
}>();

/**
 * 面板固定三行，每行一种课型，不用再下拉选类型。
 * 同一课型如果历史数据里存了多条（旧版本一天可以记多条），
 * 这里按节数合并、备注用「、」连起来。
 */
const rows = computed(() =>
  KIND_ORDER.map((kind) => {
    const matched = props.entries.filter((e) => e.kind === kind);
    return {
      kind,
      label: KIND_LABEL[kind],
      price: PRICE[kind],
      count: matched.reduce((sum, e) => sum + e.count, 0),
      note: matched.map((e) => e.note).filter(Boolean).join("、"),
    };
  }),
);

/** 改完一行后整份重算；节数为 0 且没填备注的行不落盘 */
function commit(kind: Kind, patch: Partial<Pick<Entry, "count" | "note">>) {
  emit(
    "update",
    rows.value
      .map((r) => (r.kind === kind ? { ...r, ...patch } : r))
      .filter((r) => r.count > 0 || r.note)
      .map(({ kind, count, note }) => ({ kind, count, note })),
  );
}

function onCount(kind: Kind, e: Event) {
  const input = e.target as HTMLInputElement;
  const n = Math.round(Number(input.value));
  const count = Number.isFinite(n) ? Math.max(0, n) : 0;
  // 输入框里的值可能不规范（-3、007、乱填），打回规范值再提交
  input.value = count ? String(count) : "";
  // 节数归零即清除这一行，备注一并清掉
  commit(kind, count ? { count } : { count: 0, note: "" });
}

function onNote(kind: Kind, e: Event) {
  commit(kind, { note: (e.target as HTMLInputElement).value.trim() });
}
</script>

<template>
  <section class="detail">
    <div class="detail-head">
      <h2>{{ title }}</h2>
      <div class="detail-total" @click="emit('show-detail')">
        <span>当天收入</span>
        <strong>{{ fmtMoney(income) }} 元</strong>
        <em>点击查看计算过程</em>
      </div>
    </div>

    <div class="kind-rows">
      <div v-for="r in rows" :key="r.kind" class="kind-row">
        <span class="kind-name">{{ r.label }}</span>
        <span class="kind-price">{{ r.price }} 元/节</span>
        <input
          class="count"
          type="number"
          min="0"
          :value="r.count || ''"
          @change="onCount(r.kind, $event)"
        />
        <span class="unit">节</span>
        <input
          class="note"
          type="text"
          :value="r.note"
          placeholder="备注（可选）"
          @change="onNote(r.kind, $event)"
        />
        <span class="kind-amount">{{ r.count ? r.price * r.count + " 元" : "" }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.detail {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 16px;
  min-width: 0;
}
.detail-head {
  margin-bottom: 14px;
}
.detail-head h2 {
  margin: 0 0 10px;
  font-size: 17px;
}
.detail-total {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}
.detail-total span {
  font-size: 13px;
  color: var(--muted);
}
.detail-total strong {
  font-size: 28px;
  color: var(--money);
}
.detail-total em {
  font-size: 12px;
  color: var(--muted);
  font-style: normal;
}

/* 固定三行：早自习 / 白天课 / 晚自习 */
.kind-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px dashed var(--line);
  padding-top: 12px;
}
.kind-row {
  display: flex;
  align-items: center;
  gap: 6px;
  /* 面板被压窄时让备注换行，而不是撑破容器 */
  flex-wrap: wrap;
}
.kind-name {
  min-width: 46px;
  font-size: 13px;
  white-space: nowrap;
}
.kind-price {
  min-width: 50px;
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
}
.kind-row .count,
.kind-row .note {
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 13px;
  font-family: inherit;
}
.kind-row .count {
  width: 56px;
}
.kind-row .note {
  flex: 1;
  min-width: 70px;
}
.unit {
  color: var(--muted);
  font-size: 13px;
}
.kind-amount {
  min-width: 48px;
  text-align: right;
  color: var(--money);
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
}
</style>
