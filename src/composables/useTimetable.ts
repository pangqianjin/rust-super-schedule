import { computed } from "vue";
import type { Slot, WeekdayKey } from "../types";
import { PERIOD_KIND, PRICE } from "../constants";
import { slotKey } from "../utils";
import { useStore } from "./useStore";

const store = useStore();

/** 从格子键 "mon-p1" 里取出节次 id */
function periodIdOf(key: string): string {
  return key.slice(key.indexOf("-") + 1);
}

export function useTimetable() {
  /** 已录入的格子：键为 "星期-节次"，如 "mon-p1" */
  const slots = computed(() => store.allSlots());

  function slotAt(weekday: WeekdayKey, periodId: string): Slot | undefined {
    return slots.value[slotKey(weekday, periodId)];
  }

  /** 批量录入；整批只落盘一次 */
  function addSlots(keys: string[], note: string) {
    store.setSlots(keys.map((k) => [k, { note }]));
  }

  function removeSlot(key: string) {
    store.setSlots([[key, null]]);
  }

  function clearAll() {
    store.setSlots(Object.keys(slots.value).map((k) => [k, null]));
  }

  // ---------- 统计 ----------
  const keys = computed(() => Object.keys(slots.value));

  /** 每周总课时 */
  const totalPeriods = computed(() => keys.value.length);

  /** 每周固定收入：早自习 6 元，其余每节 18 元 */
  function incomeOf(key: string): number {
    const kind = PERIOD_KIND[periodIdOf(key)];
    return kind ? PRICE[kind] : 0;
  }

  const weekIncome = computed(() => keys.value.reduce((sum, k) => sum + incomeOf(k), 0));

  /** 每天各有几节课，显示在表头下方 */
  const periodsByDay = computed(() => {
    const map: Record<string, number> = {};
    for (const key of keys.value) {
      const weekday = key.slice(0, key.indexOf("-"));
      map[weekday] = (map[weekday] ?? 0) + 1;
    }
    return map;
  });

  return { slots, slotAt, addSlots, removeSlot, clearAll, totalPeriods, weekIncome, periodsByDay };
}
