<template>
  <transition name="alert" appear>
    <div v-if="visible" :class="alertClasses" role="alert">
      <!-- 图标 -->
      <div v-if="showIcon" class="alert-icon">
        <component v-if="icon" :is="icon" />
        <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path v-if="variant === 'success'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          <path v-else-if="variant === 'warning'" fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          <path v-else-if="variant === 'error'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          <path v-else fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
      </div>

      <!-- 内容区域 -->
      <div class="alert-content">
        <!-- 标题 -->
        <div v-if="title" class="alert-title">{{ title }}</div>
        
        <!-- 消息内容 -->
        <div class="alert-message">
          <slot>{{ message }}</slot>
        </div>

        <!-- 操作按钮 -->
        <div v-if="$slots.actions || showDefaultActions" class="alert-actions">
          <slot name="actions">
            <button
              v-if="showDefaultActions"
              class="alert-action-btn alert-action-primary"
              @click="handleConfirm"
            >
              {{ confirmText }}
            </button>
            <button
              v-if="showDefaultActions && cancelable"
              class="alert-action-btn alert-action-secondary"
              @click="handleCancel"
            >
              {{ cancelText }}
            </button>
          </slot>
        </div>
      </div>

      <!-- 关闭按钮 -->
      <button
        v-if="closable"
        class="alert-close"
        @click="handleClose"
        :title="closeText"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </transition>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Alert',
  props: {
    visible: {
      type: Boolean,
      default: true
    },
    variant: {
      type: String,
      default: 'info',
      validator: (value: string) => ['info', 'success', 'warning', 'error'].includes(value)
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: ''
    },
    icon: {
      type: [String, Object],
      default: null
    },
    showIcon: {
      type: Boolean,
      default: true
    },
    closable: {
      type: Boolean,
      default: false
    },
    showDefaultActions: {
      type: Boolean,
      default: false
    },
    cancelable: {
      type: Boolean,
      default: false
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    closeText: {
      type: String,
      default: '关闭'
    },
    bordered: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    alertClasses(): string[] {
      const classes = [
        'alert',
        'flex',
        'items-start',
        'p-4',
        'rounded-lg',
        'transition-all',
        'duration-200'
      ]

      // 边框
      if (this.bordered) {
        classes.push('border')
      }

      // 变体样式
      switch (this.variant) {
        case 'success':
          classes.push(
            'bg-green-50',
            'dark:bg-green-900/20',
            'text-green-800',
            'dark:text-green-200'
          )
          if (this.bordered) {
            classes.push('border-green-200', 'dark:border-green-800')
          }
          break
        case 'warning':
          classes.push(
            'bg-yellow-50',
            'dark:bg-yellow-900/20',
            'text-yellow-800',
            'dark:text-yellow-200'
          )
          if (this.bordered) {
            classes.push('border-yellow-200', 'dark:border-yellow-800')
          }
          break
        case 'error':
          classes.push(
            'bg-red-50',
            'dark:bg-red-900/20',
            'text-red-800',
            'dark:text-red-200'
          )
          if (this.bordered) {
            classes.push('border-red-200', 'dark:border-red-800')
          }
          break
        default:
          classes.push(
            'bg-blue-50',
            'dark:bg-blue-900/20',
            'text-blue-800',
            'dark:text-blue-200'
          )
          if (this.bordered) {
            classes.push('border-blue-200', 'dark:border-blue-800')
          }
          break
      }

      return classes
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    
    handleConfirm() {
      this.$emit('confirm')
      if (!this.cancelable) {
        this.handleClose()
      }
    },
    
    handleCancel() {
      this.$emit('cancel')
      this.handleClose()
    }
  }
})
</script>

<style scoped>
.alert-icon {
  @apply flex-shrink-0 mr-3;
}

.alert-content {
  @apply flex-1 min-w-0;
}

.alert-title {
  @apply font-semibold mb-1;
}

.alert-message {
  @apply text-sm leading-relaxed;
}

.alert-actions {
  @apply flex gap-2 mt-3;
}

.alert-action-btn {
  @apply px-3 py-1 text-sm font-medium rounded transition-colors duration-200;
}

.alert-action-primary {
  @apply bg-current text-white opacity-90 hover:opacity-100;
}

.alert-action-secondary {
  @apply bg-transparent border border-current opacity-70 hover:opacity-100;
}

.alert-close {
  @apply flex-shrink-0 ml-3 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200;
}

/* 动画 */
.alert-enter-active,
.alert-leave-active {
  transition: all 0.3s ease;
}

.alert-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.alert-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
</style>
