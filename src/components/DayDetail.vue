<script setup lang="ts">
import { reactive } from "vue";
import type { Entry, Kind } from "../types";
import { KIND_LABEL, KIND_OPTIONS, PRICE } from "../constants";
import { fmtMoney } from "../utils";

withDefaults(
  defineProps<{
    title: string;
    entries: Entry[];
    income: number;
    /** 收入框上方的说明文字，日历页与课程表页用词不同 */
    totalLabel?: string;
    emptyText?: string;
  }>(),
  {
    totalLabel: "当天收入",
    emptyText: "这一天还没有记录课程",
  },
);

const emit = defineEmits<{
  (e: "add", entry: Entry): void;
  (e: "remove", index: number): void;
  (e: "change"): void;
  (e: "show-detail"): void;
}>();

// 新增课程的临时表单
const form = reactive<{ kind: Kind; count: number; note: string }>({
  kind: "day",
  count: 1,
  note: "",
});

function addEntry() {
  emit("add", {
    kind: form.kind,
    count: Math.max(1, Math.round(form.count)),
    note: form.note.trim(),
  });
  form.kind = "day";
  form.count = 1;
  form.note = "";
}
</script>

<template>
  <section class="detail">
    <div class="detail-head">
      <h2>{{ title }}</h2>
      <div class="detail-total" @click="emit('show-detail')">
        <span>{{ totalLabel }}</span>
        <strong>{{ fmtMoney(income) }} 元</strong>
        <em>点击查看计算过程</em>
      </div>
    </div>

    <ul class="entry-list">
      <li v-if="!entries.length" class="empty">{{ emptyText }}</li>
      <li v-for="(e, i) in entries" :key="i" class="entry">
        <select v-model="e.kind" @change="emit('change')">
          <option v-for="k in KIND_OPTIONS" :key="k" :value="k">{{ KIND_LABEL[k] }}</option>
        </select>
        <input
          class="count"
          type="number"
          min="1"
          v-model.number="e.count"
          @change="emit('change')"
        />
        <span class="unit">节</span>
        <input
          class="note"
          type="text"
          v-model="e.note"
          placeholder="备注（可选）"
          @change="emit('change')"
        />
        <span class="entry-amount">{{ PRICE[e.kind] * e.count }} 元</span>
        <button class="btn danger" @click="emit('remove', i)">删除</button>
      </li>
    </ul>

    <form class="add-form" @submit.prevent="addEntry">
      <select v-model="form.kind">
        <option v-for="k in KIND_OPTIONS" :key="k" :value="k">{{ KIND_LABEL[k] }}</option>
      </select>
      <input class="count" type="number" min="1" v-model.number="form.count" />
      <span class="unit">节</span>
      <input class="note" type="text" v-model="form.note" placeholder="备注（可选）" />
      <button class="btn primary" type="submit">添加</button>
    </form>
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
.entry-list {
  list-style: none;
  margin: 0 0 14px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.entry-list .empty {
  color: var(--muted);
  font-size: 13px;
  text-align: center;
  padding: 16px 0;
}
.entry {
  display: flex;
  align-items: center;
  gap: 6px;
  /* 面板被压窄时让备注换行，而不是撑破容器 */
  flex-wrap: wrap;
}
.entry select,
.entry input,
.add-form select,
.add-form input {
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 13px;
  font-family: inherit;
}
.entry .count,
.add-form .count {
  width: 56px;
}
.entry .note,
.add-form .note {
  flex: 1;
  min-width: 0;
}
.unit {
  color: var(--muted);
  font-size: 13px;
}
.entry-amount {
  color: var(--money);
  font-weight: 600;
  white-space: nowrap;
}
.add-form {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  border-top: 1px dashed var(--line);
  padding-top: 12px;
}
</style>
