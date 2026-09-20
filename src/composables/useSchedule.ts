import { computed, ref } from "vue";
import type { DayCell, DayStat, Entry, ModalState } from "../types";
import { buildDayGroup, dayIncome, toDateStr, weekdayName } from "../utils";
import { useStore } from "./useStore";

const store = useStore();

// 界面状态放在模块作用域，这样在页面之间来回切换时不会丢失
// （比如切到课程表再切回来，仍然是之前选中的日期和月份）。
const now = new Date();

const todayStr = ref(toDateStr(now));
const selectedDate = ref(todayStr.value);
const viewYear = ref(now.getFullYear());
const viewMonth = ref(now.getMonth()); // 0-11

const rangeStart = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`);
const rangeEnd = ref(todayStr.value);
const modal = ref<ModalState | null>(null);

export function useSchedule() {
  // ---------- 数据读写 ----------
  function entriesOf(dateStr: string): Entry[] {
    return store.dayEntries(dateStr);
  }

  function setEntries(dateStr: string, entries: Entry[]) {
    store.setDayEntries(dateStr, entries);
  }

  // ---------- 日历 ----------
  const calendarCells = computed<DayCell[]>(() => {
    const first = new Date(viewYear.value, viewMonth.value, 1);
    const lead = (first.getDay() + 6) % 7; // 周一作为第一列
    const start = new Date(viewYear.value, viewMonth.value, 1 - lead);
    const cells: DayCell[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const ds = toDateStr(d);
      cells.push({
        date: ds,
        inMonth: d.getMonth() === viewMonth.value,
        isToday: ds === todayStr.value,
        isSelected: ds === selectedDate.value,
        income: dayIncome(entriesOf(ds)),
      });
    }
    return cells;
  });

  const viewTitle = computed(() => `${viewYear.value} 年 ${viewMonth.value + 1} 月`);

  function prevMonth() {
    viewMonth.value--;
    if (viewMonth.value < 0) {
      viewMonth.value = 11;
      viewYear.value--;
    }
  }

  function nextMonth() {
    viewMonth.value++;
    if (viewMonth.value > 11) {
      viewMonth.value = 0;
      viewYear.value++;
    }
  }

  function goToday() {
    viewYear.value = now.getFullYear();
    viewMonth.value = now.getMonth();
    selectedDate.value = todayStr.value;
  }

  function selectDate(ds: string) {
    selectedDate.value = ds;
    const d = new Date(ds + "T00:00:00");
    viewYear.value = d.getFullYear();
    viewMonth.value = d.getMonth();
  }

  // ---------- 选中日期的编辑 ----------
  const selectedEntries = computed(() => entriesOf(selectedDate.value));
  const selectedIncome = computed(() => dayIncome(selectedEntries.value));
  const selectedTitle = computed(
    () => `${selectedDate.value} ${weekdayName(selectedDate.value)}`,
  );

  function addEntry(entry: Entry) {
    setEntries(selectedDate.value, [...selectedEntries.value, entry]);
  }

  function removeEntry(index: number) {
    setEntries(selectedDate.value, selectedEntries.value.filter((_, i) => i !== index));
  }

  function onEntryChange() {
    void store.persist();
  }

  // ---------- 统计 ----------
  function daysInRange(pred: (date: string) => boolean): DayStat[] {
    return store
      .allDays()
      .filter(([date]) => pred(date))
      .map(([date, entries]) => ({ date, entries }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  const todayIncome = computed(() => dayIncome(entriesOf(todayStr.value)));

  const monthStats = computed(() => {
    const prefix = todayStr.value.slice(0, 7);
    return daysInRange((d) => d.startsWith(prefix));
  });
  const monthIncome = computed(() =>
    monthStats.value.reduce((s, x) => s + dayIncome(x.entries), 0),
  );

  const yearStats = computed(() => {
    const prefix = todayStr.value.slice(0, 4);
    return daysInRange((d) => d.startsWith(prefix));
  });
  const yearIncome = computed(() =>
    yearStats.value.reduce((s, x) => s + dayIncome(x.entries), 0),
  );

  const rangeStats = computed(() =>
    daysInRange((d) => d >= rangeStart.value && d <= rangeEnd.value),
  );
  const rangeIncome = computed(() =>
    rangeStats.value.reduce((s, x) => s + dayIncome(x.entries), 0),
  );

  // ---------- 计算过程弹窗 ----------
  function openDayDetail(dateStr: string) {
    const group = buildDayGroup(dateStr, entriesOf(dateStr));
    modal.value = { title: "每日收入计算过程", groups: [group], total: group.total };
  }

  function openStatsDetail(title: string, stats: DayStat[]) {
    const groups = stats.map((s) => buildDayGroup(s.date, s.entries));
    const total = groups.reduce((s, g) => s + g.total, 0);
    modal.value = { title, groups, total };
  }

  function closeModal() {
    modal.value = null;
  }

  return {
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
  };
}
