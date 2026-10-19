import type { BlockDef, Kind, WeekdayKey } from "./types";

// 每种课对应的价格（元）
export const PRICE: Record<Kind, number> = {
  morning: 10,
  day: 10,
  evening: 10,
};

// 收入规则：月收入 = 政府补贴（固定）+ 学校课时费（保底）
export const SUBSIDY = 1780; // 政府补贴（元/月，固定）
export const WEEKLY_FREE_PERIODS = 8; // 每周固定扣除课时数
export const MONTHLY_FREE_PERIODS = 32; // 每月固定扣除课时 = 8 × 4
export const MIN_SCHOOL_FEE = 300; // 学校课时费保底（元/月）

export const KIND_LABEL: Record<Kind, string> = {
  morning: "早自习",
  day: "白天课",
  evening: "晚自习",
};

// 日历页右侧录入面板的显示顺序，按一天的时间先后排列
export const KIND_ORDER: Kind[] = ["morning", "day", "evening"];

// getDay() 返回 0=周日，以此类推
export const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

// 课程表按周一到周日排列
export const WEEKDAY_KEYS: WeekdayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const WEEKDAY_LABEL: Record<WeekdayKey, string> = {
  mon: "周一",
  tue: "周二",
  wed: "周三",
  thu: "周四",
  fri: "周五",
  sat: "周六",
  sun: "周日",
};

/**
 * 课程表的行结构：早自习 1 节 + 上午 4 节 + 下午 5 节 + 晚上 3 节 = 共 13 行。
 * 想调整作息（比如上午改成 3 节），改这里就行，表格和统计都会跟着变。
 */
export const PERIOD_BLOCKS: BlockDef[] = [
  {
    id: "morning",
    label: "早自习",
    periods: [{ id: "m", label: "早自习", kind: "morning" }],
  },
  {
    id: "am",
    label: "上午",
    periods: [
      { id: "p1", label: "第1节", kind: "day" },
      { id: "p2", label: "第2节", kind: "day" },
      { id: "p3", label: "第3节", kind: "day" },
      { id: "p4", label: "第4节", kind: "day" },
    ],
  },
  {
    id: "pm",
    label: "下午",
    periods: [
      { id: "p5", label: "第5节", kind: "day" },
      { id: "p6", label: "第6节", kind: "day" },
      { id: "p7", label: "第7节", kind: "day" },
      { id: "p8", label: "第8节", kind: "day" },
      { id: "p9", label: "第9节", kind: "day" },
    ],
  },
  {
    id: "evening",
    label: "晚上",
    periods: [
      { id: "e1", label: "晚1", kind: "evening" },
      { id: "e2", label: "晚2", kind: "evening" },
      { id: "e3", label: "晚3", kind: "evening" },
    ],
  },
];

/** 节次 id → 课型，用来把课程表格子换算成收入 */
export const PERIOD_KIND: Record<string, Kind> = Object.fromEntries(
  PERIOD_BLOCKS.flatMap((b) => b.periods.map((p) => [p.id, p.kind])),
);

/** 节次 id → 显示名（如 p1 → 第1节） */
export const PERIOD_LABEL: Record<string, string> = Object.fromEntries(
  PERIOD_BLOCKS.flatMap((b) => b.periods.map((p) => [p.id, p.label])),
);
