export type Kind = "morning" | "day" | "evening";

/** 课程表按星期索引，周一为一周的开始 */
export type WeekdayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface Entry {
  kind: Kind;
  count: number;
  note: string;
}

/** 课程表上的一个格子。课型由所在行决定，不单独存。 */
export interface Slot {
  /** 备注，比如班级名称 */
  note: string;
}

export interface AppData {
  /** 每天实际记录的课程，键为 YYYY-MM-DD */
  days: Record<string, Entry[]>;
  /** 课程表已填的格子，键形如 "mon-p1"（星期-节次） */
  timetable: Record<string, Slot>;
}

/** 课程表里的一节课（如「第1节」），kind 决定它值多少钱 */
export interface PeriodDef {
  id: string;
  label: string;
  kind: Kind;
}

/** 课程表的分组（早自习 / 上午 / 下午 / 晚上） */
export interface BlockDef {
  id: string;
  label: string;
  periods: PeriodDef[];
}

export interface DayCell {
  date: string;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  income: number;
}

export interface Group {
  title: string;
  lines: string[];
  total: number;
}

export interface ModalState {
  title: string;
  groups: Group[];
  total: number;
}

export interface DayStat {
  date: string;
  entries: Entry[];
}
