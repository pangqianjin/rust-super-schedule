<script setup lang="ts">
import type { ModalState } from "../types";
import { fmtMoney } from "../utils";

defineProps<{ modal: ModalState }>();

const emit = defineEmits<{
  (e: "close"): void;
}>();
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-head">
        <h3>{{ modal.title }}</h3>
        <button class="btn ghost" @click="emit('close')">关闭</button>
      </div>
      <div class="modal-body">
        <div v-for="(g, i) in modal.groups" :key="i" class="group">
          <div class="group-title">
            <span>{{ g.title }}</span>
            <strong>{{ fmtMoney(g.total) }} 元</strong>
          </div>
          <div v-for="(line, j) in g.lines" :key="j" class="line">{{ line }}</div>
        </div>
      </div>
      <div class="modal-foot">
        <span>合计</span>
        <strong>{{ fmtMoney(modal.total) }} 元</strong>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 24, 34, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: var(--panel);
  border-radius: 14px;
  width: 520px;
  max-width: calc(100vw - 40px);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--line);
}
.modal-head h3 {
  margin: 0;
  font-size: 16px;
}
.modal-body {
  padding: 12px 18px;
  overflow-y: auto;
}
.group {
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
}
.group:last-child {
  border-bottom: none;
}
.group-title {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  margin-bottom: 6px;
}
.group-title strong {
  color: var(--money);
}
.line {
  font-size: 13px;
  color: #4b5466;
  padding: 2px 0 2px 10px;
}
.modal-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-top: 1px solid var(--line);
  font-size: 15px;
}
.modal-foot strong {
  font-size: 22px;
  color: var(--money);
}
</style>
