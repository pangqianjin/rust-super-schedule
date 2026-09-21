import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import type { AppData, Entry, Slot } from "../types";

/**
 * 整个应用只有一份数据（日历 + 课程表），都保存在同一个 schedule.json 里。
 * 因此所有写入都必须经过这里 —— 如果每个页面各自持有一份副本再分别保存，
 * 后保存的那一份会把另一份的修改覆盖掉。
 */

const data = ref<AppData>({ days: {}, timetable: {} });
let loaded = false;

export function useStore() {
  /** 首次调用时从磁盘读取数据，之后复用内存中的副本 */
  async function load() {
    if (loaded) return;
    const raw = await invoke<AppData>("load_data");
    data.value = { days: raw.days ?? {}, timetable: raw.timetable ?? {} };
    loaded = true;
  }

  async function persist() {
    await invoke("save_data", { data: data.value });
  }

  // ---------- 日历：按日期存一节课列表 ----------
  function dayEntries(date: string): Entry[] {
    return data.value.days[date] ?? [];
  }

  function setDayEntries(date: string, entries: Entry[]) {
    // 清空最后一条记录时把这一天整个删掉，不留下空壳
    const days = { ...data.value.days };
    if (entries.length) days[date] = entries;
    else delete days[date];
    data.value = { ...data.value, days };
    void persist();
  }

  function allDays(): Array<[string, Entry[]]> {
    return Object.entries(data.value.days);
  }

  // ---------- 课程表：按「星期-节次」存单个格子 ----------
  function allSlots(): Record<string, Slot> {
    return data.value.timetable;
  }

  /** 批量写格子；值为 null 表示删除该格子。整批只落盘一次。 */
  function setSlots(pairs: Array<[string, Slot | null]>) {
    const timetable = { ...data.value.timetable };
    for (const [key, slot] of pairs) {
      if (slot) timetable[key] = slot;
      else delete timetable[key];
    }
    data.value = { ...data.value, timetable };
    void persist();
  }

  return { data, load, persist, dayEntries, setDayEntries, allDays, allSlots, setSlots };
}
