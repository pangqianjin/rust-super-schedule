import type { Entry, Group, WeekdayKey } from "./types";
import { KIND_LABEL, PRICE, WEEKDAYS } from "./constants";

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

// 计算过程：把一天的课程拆成逐条算式
export function entryLines(entries: Entry[]): string[] {
  if (!entries.length) return ["未记录课程"];
  return entries.map((e) => {
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

export function fmtMoney(n: number): string {
  return n.toLocaleString("zh-CN");
}
