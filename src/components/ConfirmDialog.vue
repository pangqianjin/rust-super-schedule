<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    /** 危险操作（如删除）用红色确认按钮 */
    danger?: boolean;
  }>(),
  {
    confirmText: "确定",
    cancelText: "取消",
    danger: false,
  },
);

const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();
</script>

<template>
  <div class="overlay" @click.self="emit('cancel')">
    <div class="dialog">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="actions">
        <button class="btn ghost" @click="emit('cancel')">{{ cancelText }}</button>
        <button class="btn" :class="danger ? 'danger' : 'primary'" @click="emit('confirm')">
          {{ confirmText }}
        </button>
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
  z-index: 200;
}
.dialog {
  background: var(--panel);
  border-radius: 14px;
  width: 380px;
  max-width: calc(100vw - 40px);
  padding: 22px;
}
.dialog h3 {
  margin: 0 0 10px;
  font-size: 16px;
}
.dialog p {
  margin: 0 0 20px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--muted);
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
