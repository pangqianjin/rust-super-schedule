<script setup lang="ts">
import type { DayCell } from "../types";

defineProps<{
  title: string;
  cells: DayCell[];
}>();

const emit = defineEmits<{
  (e: "prev"): void;
  (e: "next"): void;
  (e: "today"): void;
  (e: "select", date: string): void;
}>();
</script>

<template>
  <section class="calendar">
    <div class="calendar-head">
      <span class="calendar-title">{{ title }}</span>
      <div class="calendar-nav">
        <button class="btn" @click="emit('today')">今天</button>
        <button class="btn ghost" @click="emit('prev')">‹ 上月</button>
        <button class="btn ghost" @click="emit('next')">下月 ›</button>
      </div>
    </div>
    <div class="weekdays">
      <span v-for="w in ['一', '二', '三', '四', '五', '六', '日']" :key="w">{{ w }}</span>
    </div>
    <div class="grid">
      <div
        v-for="cell in cells"
        :key="cell.date"
        class="cell"
        :class="{
          outside: !cell.inMonth,
          today: cell.isToday,
          selected: cell.isSelected,
        }"
        @click="emit('select', cell.date)"
      >
        <span class="cell-day">{{ Number(cell.date.slice(8, 10)) }}</span>
        <span v-if="cell.income > 0" class="cell-income">{{ cell.income }} 元</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.calendar {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 16px;
  /* 允许被压缩到比内容更窄，否则外层网格会被“顶”出容器 */
  min-width: 0;
}
.calendar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}
.calendar-title {
  font-size: 17px;
  font-weight: 600;
  white-space: nowrap;
}
.calendar-nav {
  display: flex;
  gap: 6px;
}
.weekdays {
  display: grid;
  /* minmax(0, 1fr) 而不是 1fr：把轨道下限显式定为 0。
     1fr 的隐含下限是 min-content，会和格子的 aspect-ratio 形成循环依赖，
     导致窗口「先放大再缩小」时列宽算不回原来的值。 */
  grid-template-columns: repeat(7, minmax(0, 1fr));
  text-align: center;
  color: var(--muted);
  font-size: 13px;
  margin-bottom: 6px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
}
.cell {
  aspect-ratio: 1 / 1;
  min-width: 0;
  overflow: hidden;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.12s;
}
.cell:hover {
  background: var(--accent-soft);
}
.cell.outside {
  color: #c3c9d6;
}
.cell.today {
  border-color: var(--accent);
}
.cell.selected {
  background: var(--accent);
  color: #fff;
}
.cell.selected .cell-income {
  color: #fff;
}
.cell-day {
  font-size: 14px;
}
.cell-income {
  font-size: 11px;
  color: var(--money);
  font-weight: 600;
  /* 格子变窄时截断，而不是把格子撑开 */
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
