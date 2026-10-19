import type { Entry, Group, MonthIncome, WeekdayKey } from "./types";
import { KIND_LABEL, MIN_SCHOOL_FEE, MONTHLY_FREE_PERIODS, PRICE, SUBSIDY, WEEKDAYS } from "./constants";

/** 课程表格子的键：星期 + 节次，如 ("mon", "p1") → "mon-p1" */
export function slotKey(weekday: WeekdayKey, periodId: string): string {
  return `${weekday}-${periodId}`;
}

export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function weekdayName(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return "周" + WEEKDAYS[d.getDay()];
}

export function dayIncome(entries: Entry[]): number {
  return entries.reduce((sum, e) => sum + PRICE[e.kind] * e.count, 0);
}

/** 一批课的总课时数（节） */
export function periodCount(entries: Entry[]): number {
  return entries.reduce((sum, e) => sum + e.count, 0);
}

/** 单月收入：政府补贴 + 学校课时费（保底 300） */
export function monthIncome(entries: Entry[]): MonthIncome {
  const hours = periodCount(entries);
  const deductHours = MONTHLY_FREE_PERIODS;
  const billableHours = hours - deductHours;
  // 三种课型单价统一为 10，直接用任一单价
  const rawFee = billableHours * PRICE.day;
  const schoolFee = Math.max(MIN_SCHOOL_FEE, rawFee);
  return {
    subsidy: SUBSIDY,
    hours,
    deductHours,
    billableHours,
    rawFee,
    schoolFee,
    total: SUBSIDY + schoolFee,
  };
}

// 计算过程：把一天的课程拆成逐条算式；收入为 0 的行（比如只填了备注）不展示
export function entryLines(entries: Entry[]): string[] {
  const billable = entries.filter((e) => PRICE[e.kind] * e.count > 0);
  if (!billable.length) return ["未记录课程"];
  return billable.map((e) => {
    const label = KIND_LABEL[e.kind];
    const price = PRICE[e.kind];
    let line = `${label} × ${e.count} 节 × ${price} 元 = ${price * e.count} 元`;
    if (e.note) line += `（${e.note}）`;
    return line;
  });
}

export function buildDayGroup(dateStr: string, entries: Entry[]): Group {
  return {
    title: `${dateStr} ${weekdayName(dateStr)}`,
    lines: entryLines(entries),
    total: dayIncome(entries),
  };
}

/** 单月计算过程：一个月 = 一个 Group */
export function buildMonthGroup(month: string, entries: Entry[]): Group {
  const r = monthIncome(entries);
  const [y, m] = month.split("-");
  const lines = [
    `政府补贴 ${fmtMoney(r.subsidy)} 元`,
    `总课时 ${r.hours} 节 − ${r.deductHours} 节 = ${r.billableHours} 节`,
    `${r.billableHours} 节 × ${PRICE.day} 元 = ${r.rawFee} 元`,
    r.rawFee < r.schoolFee
      ? `课时费不足 ${fmtMoney(MIN_SCHOOL_FEE)} 元，按保底 ${fmtMoney(r.schoolFee)} 元计`
      : `课时费 ${fmtMoney(r.schoolFee)} 元`,
  ];
  return { title: `${y}年${Number(m)}月`, lines, total: r.total };
}

export function fmtMoney(n: number): string {
  return n.toLocaleString("zh-CN");
}
