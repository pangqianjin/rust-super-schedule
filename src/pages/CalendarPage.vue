<script setup lang="ts">
import StatsPanel from "../components/StatsPanel.vue";
import CalendarView from "../components/CalendarView.vue";
import DayDetail from "../components/DayDetail.vue";
import CalcModal from "../components/CalcModal.vue";
import { useSchedule } from "../composables/useSchedule";

const {
  todayStr,
  selectedDate,
  rangeStart,
  rangeEnd,
  modal,
  calendarCells,
  viewTitle,
  selectedEntries,
  selectedIncome,
  selectedTitle,
  todayIncome,
  monthStats,
  monthIncome,
  yearStats,
  yearIncome,
  rangeStats,
  rangeIncome,
  addEntry,
  removeEntry,
  onEntryChange,
  prevMonth,
  nextMonth,
  goToday,
  selectDate,
  openDayDetail,
  openStatsDetail,
  closeModal,
} = useSchedule();
</script>

<template>
  <div class="page">
    <StatsPanel
      :today-str="todayStr"
      :today-income="todayIncome"
      :month-income="monthIncome"
      :year-income="yearIncome"
      :range-income="rangeIncome"
      v-model:range-start="rangeStart"
      v-model:range-end="rangeEnd"
      @open-day="openDayDetail"
      @open-month="openStatsDetail('本月收入计算过程', monthStats)"
      @open-year="openStatsDetail('本年收入计算过程', yearStats)"
      @open-range="openStatsDetail('指定范围收入计算过程', rangeStats)"
    />

    <div class="main">
      <CalendarView
        :title="viewTitle"
        :cells="calendarCells"
        @prev="prevMonth"
        @next="nextMonth"
        @today="goToday"
        @select="selectDate"
      />

      <DayDetail
        :title="selectedTitle"
        :entries="selectedEntries"
        :income="selectedIncome"
        @add="addEntry"
        @remove="removeEntry"
        @change="onEntryChange"
        @show-detail="openDayDetail(selectedDate)"
      />
    </div>

    <CalcModal v-if="modal" :modal="modal" @close="closeModal" />
  </div>
</template>

<style scoped>
.page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 20px 24px 32px;
}
.main {
  display: grid;
  /* 同样把轨道下限设为 0，避免子元素把整个网格顶宽 */
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 18px;
}

@media (max-width: 1000px) {
  .main {
    grid-template-columns: 1fr;
  }
}
</style>
