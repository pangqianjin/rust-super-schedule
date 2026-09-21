<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import CalendarPage from "./pages/CalendarPage.vue";
import TimetablePage from "./pages/TimetablePage.vue";
import { useStore } from "./composables/useStore";

const { load } = useStore();

// 侧边栏导航项，新增页面时在这里加一条即可
const pages = [
  { key: "calendar", label: "日历", icon: "📅", component: CalendarPage },
  { key: "timetable", label: "课程表", icon: "📋", component: TimetablePage },
] as const;

const current = ref<string>(pages[0].key);
const currentComponent = computed(
  () => pages.find((p) => p.key === current.value)?.component ?? CalendarPage,
);

onMounted(load);
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-icon">📘</span>
        <span class="brand-name">超级课程表</span>
      </div>

      <nav class="nav">
        <button
          v-for="p in pages"
          :key="p.key"
          class="nav-item"
          :class="{ active: current === p.key }"
          @click="current = p.key"
        >
          <span class="nav-icon">{{ p.icon }}</span>
          <span>{{ p.label }}</span>
        </button>
      </nav>
    </aside>

    <main class="content">
      <component :is="currentComponent" />
    </main>
  </div>
</template>

<style>
:root {
  --bg: #f4f6fb;
  --panel: #ffffff;
  --text: #1f2430;
  --muted: #8a93a6;
  --line: #e6e9f0;
  --accent: #4f6ef7;
  --accent-soft: #eef1ff;
  --money: #16a34a;
  --danger: #e5484d;

  font-family: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
  font-size: 15px;
  color: var(--text);
  background-color: var(--bg);
  -webkit-font-smoothing: antialiased;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

/* 按钮（全局，各页面与组件共用） */
.btn {
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  background: var(--accent-soft);
  color: var(--accent);
  transition: filter 0.15s;
}
.btn:hover {
  filter: brightness(0.96);
}
.btn.primary {
  background: var(--accent);
  color: #fff;
}
.btn.ghost {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--text);
}
.btn.danger {
  background: #fdecec;
  color: var(--danger);
}

/* 整体布局：侧边栏用 fixed 钉在视口上，页面滚动时不会跟着动 */
.layout {
  min-height: 100vh;
}
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 190px;
  background: var(--panel);
  border-right: 1px solid var(--line);
  padding: 20px 12px;
  overflow-y: auto;
  z-index: 20;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px 20px;
  font-size: 15px;
  font-weight: 600;
}
.brand-icon {
  font-size: 18px;
}
.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}
.nav-item:hover {
  background: var(--accent-soft);
}
.nav-item.active {
  background: var(--accent);
  color: #fff;
  font-weight: 600;
}
.nav-icon {
  font-size: 16px;
}
.content {
  margin-left: 190px;
  min-height: 100vh;
}

@media (max-width: 760px) {
  .sidebar {
    position: static;
    width: auto;
    border-right: none;
    border-bottom: 1px solid var(--line);
    overflow-y: visible;
  }
  .content {
    margin-left: 0;
  }
  .nav {
    flex-direction: row;
  }
}
</style>
