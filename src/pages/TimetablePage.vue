<script setup lang="ts">
import { ref } from "vue";
import SlotFormModal from "../components/SlotFormModal.vue";
import ConfirmDialog from "../components/ConfirmDialog.vue";
import { KIND_LABEL, PERIOD_BLOCKS, WEEKDAY_KEYS, WEEKDAY_LABEL } from "../constants";
import { fmtMoney, slotKey } from "../utils";
import { useTimetable } from "../composables/useTimetable";

const {
  slots,
  slotAt,
  addSlots,
  removeSlot,
  clearAll,
  totalPeriods,
  weekIncome,
  periodsByDay,
} = useTimetable();

const showForm = ref(false);
const showClearConfirm = ref(false);

function onSubmit(keys: string[], note: string) {
  addSlots(keys, note);
  showForm.value = false;
}

function onClearConfirmed() {
  clearAll();
  showClearConfirm.value = false;
}
</script>

<template>
  <div class="page">
    <!-- 吸顶栏：标题 + 统计 + 录入按钮 -->
    <header class="page-head">
      <div class="head-inner">
        <div>
          <h2>课程表</h2>
          <p class="sub">每周固定的上课安排，录好后可对照日历记录实际上课情况</p>
        </div>
        <div class="head-actions">
          <div class="summary">
            <span>每周课时 <strong>{{ totalPeriods }} 节</strong></span>
            <span>固定收入 <strong class="money">{{ fmtMoney(weekIncome) }} 元</strong></span>
          </div>
          <button v-if="totalPeriods" class="btn ghost" @click="showClearConfirm = true">清空</button>
          <button class="btn primary" @click="showForm = true">＋ 录入课程</button>
        </div>
      </div>
    </header>

    <div class="table-wrap">
      <table class="tt">
        <thead>
          <tr>
            <th class="col-block"></th>
            <th class="col-period"></th>
            <th v-for="d in WEEKDAY_KEYS" :key="d" class="col-day">
              <span class="day-name">{{ WEEKDAY_LABEL[d] }}</span>
              <span class="day-count">{{ periodsByDay[d] ?? 0 }} 节</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="block in PERIOD_BLOCKS" :key="block.id">
            <tr v-for="(p, i) in block.periods" :key="p.id">
              <!-- 分类栏：早自习 / 上午 / 下午 / 晚上，纵向合并整块 -->
              <th v-if="i === 0" :rowspan="block.periods.length" class="col-block">
                {{ block.label }}
              </th>
              <th class="col-period">{{ p.label }}</th>
              <td
                v-for="d in WEEKDAY_KEYS"
                :key="d"
                class="cell"
                :class="['k-' + p.kind, { filled: slotAt(d, p.id) }]"
              >
                <template v-if="slotAt(d, p.id)">
                  <span class="cell-note">{{ slotAt(d, p.id)!.note || KIND_LABEL[p.kind] }}</span>
                  <button
                    class="cell-del"
                    title="删除这一格"
                    @click="removeSlot(slotKey(d, p.id))"
                  >
                    ×
                  </button>
                </template>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <SlotFormModal
      v-if="showForm"
      :taken="Object.keys(slots)"
      @close="showForm = false"
      @submit="onSubmit"
    />

    <ConfirmDialog
      v-if="showClearConfirm"
      title="清空课程表"
      message="将删除课程表上全部已录入的格子，此操作不可撤销。日历里的每日记录不受影响。"
      confirm-text="清空"
      danger
      @confirm="onClearConfirmed"
      @cancel="showClearConfirm = false"
    />
  </div>
</template>

<style scoped>
.page {
  padding-bottom: 32px;
}

/* 吸顶栏：外层铺满宽度保证背景不透出，内层限宽居中 */
.page-head {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg);
  border-bottom: 1px solid var(--line);
}
.head-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 20px 24px 16px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.page-head h2 {
  margin: 0 0 4px;
  font-size: 20px;
}
.sub {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}
.head-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}
.summary {
  display: flex;
  gap: 18px;
  font-size: 13px;
  color: var(--muted);
}
.summary strong {
  font-size: 15px;
  color: var(--text);
}
.summary .money {
  color: var(--money);
}

/* 表格 */
.table-wrap {
  max-width: 1180px;
  margin: 0 auto;
  padding: 18px 24px 0;
  overflow-x: auto;
}
.tt {
  width: 100%;
  min-width: 720px;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
}
.tt th,
.tt td {
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  padding: 0;
  font-weight: normal;
}
.tt tr > *:last-child {
  border-right: none;
}
.tt tbody tr:last-child > * {
  border-bottom: none;
}

/* 左起第一列：早自习 / 上午 / 下午 / 晚上 */
.col-block {
  width: 60px;
  background: #f8fafc;
  font-size: 13px;
  color: var(--muted);
  text-align: center;
  vertical-align: middle;
  letter-spacing: 2px;
}
/* 左起第二列：节次 */
.col-period {
  width: 72px;
  background: #fcfdff;
  font-size: 12px;
  color: var(--muted);
  text-align: center;
  padding: 0 6px;
  white-space: nowrap;
}

/* 表头 */
.tt thead th {
  background: #f8fafc;
  padding: 10px 6px;
  text-align: center;
}
.day-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}
.day-count {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: var(--muted);
}

/* 课程格子 */
.cell {
  position: relative;
  height: 46px;
  text-align: center;
  vertical-align: middle;
  transition: background 0.12s;
}
.cell.filled {
  font-size: 12px;
  font-weight: 600;
}
.cell.k-morning.filled {
  background: #fef3c7;
  color: #92400e;
}
.cell.k-day.filled {
  background: #e0e7ff;
  color: #3730a3;
}
.cell.k-evening.filled {
  background: #ede9fe;
  color: #5b21b6;
}
.cell-note {
  display: inline-block;
  max-width: 100%;
  padding: 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cell-del {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  padding: 0;
  line-height: 15px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.18);
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.12s;
}
.cell:hover .cell-del {
  opacity: 1;
}
</style>
