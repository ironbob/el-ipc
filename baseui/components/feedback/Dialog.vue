<!--
  Dialog 对话框组件
  macOS 风格的模态对话框
-->

<template>
  <teleport to="body">
    <div v-if="visible" class="dialog-overlay" @click="handleOverlayClick">
      <div class="dialog-container" :class="dialogClasses" @click.stop>
        <!-- 对话框头部 -->
        <div class="dialog-header" v-if="title || $slots.header">
          <slot name="header">
            <h3 class="dialog-title">{{ title }}</h3>
          </slot>
          <button
            v-if="showCloseButton"
            class="dialog-close-btn"
            @click="handleClose"
            :aria-label="closeButtonLabel"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 4.586L10.293.293a1 1 0 011.414 1.414L7.414 6l4.293 4.293a1 1 0 01-1.414 1.414L6 7.414l-4.293 4.293a1 1 0 01-1.414-1.414L4.586 6 .293 1.707A1 1 0 011.707.293L6 4.586z"/>
            </svg>
          </button>
        </div>

        <!-- 对话框内容 -->
        <div class="dialog-body">
          <slot>
            <p v-if="message">{{ message }}</p>
          </slot>
        </div>

        <!-- 对话框底部 -->
        <div class="dialog-footer" v-if="$slots.footer || showDefaultButtons">
          <slot name="footer">
            <div class="dialog-actions" v-if="showDefaultButtons">
              <button
                class="dialog-btn dialog-btn-secondary"
                @click="handleCancel"
                v-if="showCancelButton"
              >
                {{ cancelButtonText }}
              </button>
              <button
                class="dialog-btn dialog-btn-primary"
                @click="handleConfirm"
                :disabled="confirmDisabled"
              >
                {{ confirmButtonText }}
              </button>
            </div>
          </slot>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Dialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value: string) => ['small', 'medium', 'large'].includes(value)
    },
    showCloseButton: {
      type: Boolean,
      default: true
    },
    showDefaultButtons: {
      type: Boolean,
      default: true
    },
    showCancelButton: {
      type: Boolean,
      default: true
    },
    confirmButtonText: {
      type: String,
      default: '确定'
    },
    cancelButtonText: {
      type: String,
      default: '取消'
    },
    closeButtonLabel: {
      type: String,
      default: '关闭'
    },
    confirmDisabled: {
      type: Boolean,
      default: false
    },
    closeOnOverlayClick: {
      type: Boolean,
      default: true
    },
    closeOnEscape: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    dialogClasses(): string[] {
      return [
        'dialog',
        `dialog-${this.size}`
      ]
    }
  },
  mounted() {
    if (this.closeOnEscape) {
      document.addEventListener('keydown', this.handleKeydown)
    }
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    handleOverlayClick() {
      if (this.closeOnOverlayClick) {
        this.handleClose()
      }
    },

    handleClose() {
      this.$emit('close')
    },

    handleConfirm() {
      this.$emit('confirm')
    },

    handleCancel() {
      this.$emit('cancel')
    },

    handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape' && this.visible) {
        this.handleClose()
      }
    }
  }
})
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.dialog-container {
  background-color: var(--vscode-bg, #ffffff);
  border: 1px solid var(--vscode-border, #e5e5e5);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  max-width: 90vw;
  overflow: hidden;
  animation: dialogEnter 0.2s ease-out;
}

@keyframes dialogEnter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dialog-small {
  width: 320px;
}

.dialog-medium {
  width: 480px;
}

.dialog-large {
  width: 640px;
}

.dialog-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--vscode-border, #e5e5e5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.dialog-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--vscode-fg, #333333);
}

.dialog-close-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--vscode-fg, #333333);
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.dialog-close-btn:hover {
  background-color: var(--vscode-hover, #f0f0f0);
  opacity: 1;
}

.dialog-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  color: var(--vscode-fg, #333333);
}

.dialog-body p {
  margin: 0;
  line-height: 1.5;
}

.dialog-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--vscode-border, #e5e5e5);
  flex-shrink: 0;
}

.dialog-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.dialog-btn {
  padding: 8px 16px;
  border: 1px solid var(--vscode-border, #e5e5e5);
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 80px;
}

.dialog-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dialog-btn-secondary {
  background-color: var(--vscode-bg, #ffffff);
  color: var(--vscode-fg, #333333);
}

.dialog-btn-secondary:hover:not(:disabled) {
  background-color: var(--vscode-hover, #f0f0f0);
}

.dialog-btn-primary {
  background-color: var(--vscode-focus, #007acc);
  border-color: var(--vscode-focus, #007acc);
  color: #ffffff;
}

.dialog-btn-primary:hover:not(:disabled) {
  background-color: #106ebe;
  border-color: #106ebe;
}

/* 深色主题适配 */
.dark .dialog-container {
  background-color: var(--vscode-bg, #1e1e1e);
  border-color: var(--vscode-border, #3c3c3c);
}

.dark .dialog-title {
  color: var(--vscode-fg, #cccccc);
}

.dark .dialog-close-btn {
  color: var(--vscode-fg, #cccccc);
}

.dark .dialog-close-btn:hover {
  background-color: var(--vscode-hover, #2a2d2e);
}

.dark .dialog-body {
  color: var(--vscode-fg, #cccccc);
}

.dark .dialog-btn-secondary {
  background-color: var(--vscode-bg, #1e1e1e);
  color: var(--vscode-fg, #cccccc);
  border-color: var(--vscode-border, #3c3c3c);
}

.dark .dialog-btn-secondary:hover:not(:disabled) {
  background-color: var(--vscode-hover, #2a2d2e);
}
</style>
