<script setup lang="ts">
import { computed } from "vue";
import { fmtMoney } from "../utils";

const props = defineProps<{
  /** 当前选中的日期；下面三张卡片的统计都跟着它走，而不是「今天」 */
  date: string;
  dayIncome: number;
  monthIncome: number;
  yearIncome: number;
  rangeIncome: number;
  rangeStart: string;
  rangeEnd: string;
}>();

const emit = defineEmits<{
  (e: "open-day", date: string): void;
  (e: "open-month"): void;
  (e: "open-year"): void;
  (e: "open-range"): void;
  (e: "update:rangeStart", value: string): void;
  (e: "update:rangeEnd", value: string): void;
}>();

// 用 v-model 双向绑定自定义范围的起止日期
const rangeStartModel = computed({
  get: () => props.rangeStart,
  set: (v: string) => emit("update:rangeStart", v),
});
const rangeEndModel = computed({
  get: () => props.rangeEnd,
  set: (v: string) => emit("update:rangeEnd", v),
});

// 标题直接写明是哪一段：选中别的日期后还写「本日」就名不副实了
const dayLabel = computed(() => {
  const [, m, d] = props.date.split("-");
  return `${Number(m)}月${Number(d)}日`;
});
const monthLabel = computed(() => {
  const [y, m] = props.date.split("-");
  return `${y}年${Number(m)}月`;
});
const yearLabel = computed(() => `${props.date.slice(0, 4)}年`);
</script>

<template>
  <section class="stats">
    <div class="stat-card" @click="emit('open-day', date)">
      <span class="stat-label">{{ dayLabel }}</span>
      <span class="stat-value">{{ fmtMoney(dayIncome) }} 元</span>
      <span class="stat-hint">点击查看计算过程</span>
    </div>
    <div class="stat-card" @click="emit('open-month')">
      <span class="stat-label">{{ monthLabel }}</span>
      <span class="stat-value">{{ fmtMoney(monthIncome) }} 元</span>
      <span class="stat-hint">点击查看计算过程</span>
    </div>
    <div class="stat-card" @click="emit('open-year')">
      <span class="stat-label">{{ yearLabel }}</span>
      <span class="stat-value">{{ fmtMoney(yearIncome) }} 元</span>
      <span class="stat-hint">点击查看计算过程</span>
    </div>
    <div class="stat-card range">
      <div class="range-head">
        <span class="stat-label">自定义范围</span>
      </div>
      <div class="range-inputs">
        <input type="date" v-model="rangeStartModel" />
        <span class="range-sep">至</span>
        <input type="date" v-model="rangeEndModel" />
      </div>
      <span class="stat-value">{{ fmtMoney(rangeIncome) }} 元</span>
      <span class="stat-hint" @click="emit('open-range')">点击查看计算过程</span>
    </div>
  </section>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}
.stat-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  transition: box-shadow 0.15s;
}
.stat-card:hover {
  box-shadow: 0 4px 16px rgba(79, 110, 247, 0.12);
}
.stat-label {
  font-size: 13px;
  color: var(--muted);
}
.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--money);
}
.stat-hint {
  font-size: 12px;
  color: var(--muted);
}
.range-inputs {
  display: flex;
  align-items: center;
  gap: 6px;
}
.range-inputs input {
  width: 100%;
  min-width: 0;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 4px 6px;
  font-size: 12px;
}
.range-sep {
  color: var(--muted);
  font-size: 12px;
}

@media (max-width: 1000px) {
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
