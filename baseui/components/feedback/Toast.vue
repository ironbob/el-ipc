<template>
  <teleport to="body">
    <div v-if="visible" class="toast-container" :class="containerClasses">
      <transition-group name="toast" tag="div" class="toast-list">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="getToastClasses(toast)"
          @click="handleToastClick(toast)"
        >
          <!-- 图标 -->
          <div v-if="toast.showIcon" class="toast-icon">
            <component v-if="toast.icon" :is="toast.icon" />
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path v-if="toast.variant === 'success'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              <path v-else-if="toast.variant === 'warning'" fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              <path v-else-if="toast.variant === 'error'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              <path v-else fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>

          <!-- 内容 -->
          <div class="toast-content">
            <div v-if="toast.title" class="toast-title">{{ toast.title }}</div>
            <div class="toast-message">{{ toast.message }}</div>
          </div>

          <!-- 关闭按钮 -->
          <button
            v-if="toast.closable"
            class="toast-close"
            @click.stop="removeToast(toast.id)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- 进度条 -->
          <div
            v-if="toast.showProgress && toast.duration > 0"
            class="toast-progress"
            :style="{ animationDuration: `${toast.duration}ms` }"
          ></div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script lang="ts">
import Vue from 'vue'

interface ToastItem {
  id: string
  variant: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message: string
  icon?: any
  showIcon: boolean
  closable: boolean
  showProgress: boolean
  duration: number
  onClick?: () => void
  timer?: number
}

export default Vue.extend({
  name: 'Toast',
  props: {
    visible: {
      type: Boolean,
      default: true
    },
    position: {
      type: String,
      default: 'top-right',
      validator: (value: string) => [
        'top-left', 'top-center', 'top-right',
        'bottom-left', 'bottom-center', 'bottom-right'
      ].includes(value)
    },
    maxCount: {
      type: Number,
      default: 5
    }
  },
  data() {
    return {
      toasts: [] as ToastItem[]
    }
  },
  computed: {
    containerClasses(): string[] {
      const classes = ['fixed', 'z-50', 'pointer-events-none']
      
      switch (this.position) {
        case 'top-left':
          classes.push('top-4', 'left-4')
          break
        case 'top-center':
          classes.push('top-4', 'left-1/2', 'transform', '-translate-x-1/2')
          break
        case 'top-right':
          classes.push('top-4', 'right-4')
          break
        case 'bottom-left':
          classes.push('bottom-4', 'left-4')
          break
        case 'bottom-center':
          classes.push('bottom-4', 'left-1/2', 'transform', '-translate-x-1/2')
          break
        case 'bottom-right':
          classes.push('bottom-4', 'right-4')
          break
      }
      
      return classes
    }
  },
  methods: {
    show(options: Partial<ToastItem> & { message: string }) {
      const toast: ToastItem = {
        id: `toast-${Date.now()}-${Math.random()}`,
        variant: options.variant || 'info',
        title: options.title,
        message: options.message,
        icon: options.icon,
        showIcon: options.showIcon !== false,
        closable: options.closable !== false,
        showProgress: options.showProgress !== false,
        duration: options.duration || 4000,
        onClick: options.onClick
      }

      // 限制最大数量
      if (this.toasts.length >= this.maxCount) {
        this.toasts.shift()
      }

      this.toasts.push(toast)

      // 自动移除
      if (toast.duration > 0) {
        toast.timer = window.setTimeout(() => {
          this.removeToast(toast.id)
        }, toast.duration)
      }

      return toast.id
    },

    removeToast(id: string) {
      const index = this.toasts.findIndex(toast => toast.id === id)
      if (index > -1) {
        const toast = this.toasts[index]
        if (toast.timer) {
          clearTimeout(toast.timer)
        }
        this.toasts.splice(index, 1)
      }
    },

    clear() {
      this.toasts.forEach(toast => {
        if (toast.timer) {
          clearTimeout(toast.timer)
        }
      })
      this.toasts = []
    },

    getToastClasses(toast: ToastItem): string[] {
      const classes = [
        'toast-item',
        'relative',
        'flex',
        'items-start',
        'p-4',
        'mb-3',
        'rounded-lg',
        'shadow-lg',
        'backdrop-blur-sm',
        'pointer-events-auto',
        'cursor-pointer',
        'transition-all',
        'duration-200',
        'hover:shadow-xl',
        'max-w-sm',
        'min-w-80'
      ]

      // 变体样式
      switch (toast.variant) {
        case 'success':
          classes.push(
            'bg-green-50/95',
            'dark:bg-green-900/90',
            'text-green-800',
            'dark:text-green-200',
            'border',
            'border-green-200',
            'dark:border-green-800'
          )
          break
        case 'warning':
          classes.push(
            'bg-yellow-50/95',
            'dark:bg-yellow-900/90',
            'text-yellow-800',
            'dark:text-yellow-200',
            'border',
            'border-yellow-200',
            'dark:border-yellow-800'
          )
          break
        case 'error':
          classes.push(
            'bg-red-50/95',
            'dark:bg-red-900/90',
            'text-red-800',
            'dark:text-red-200',
            'border',
            'border-red-200',
            'dark:border-red-800'
          )
          break
        default:
          classes.push(
            'bg-blue-50/95',
            'dark:bg-blue-900/90',
            'text-blue-800',
            'dark:text-blue-200',
            'border',
            'border-blue-200',
            'dark:border-blue-800'
          )
          break
      }

      return classes
    },

    handleToastClick(toast: ToastItem) {
      if (toast.onClick) {
        toast.onClick()
      }
    },

    // 便捷方法
    info(message: string, options?: Partial<ToastItem>) {
      return this.show({ ...options, message, variant: 'info' })
    },

    success(message: string, options?: Partial<ToastItem>) {
      return this.show({ ...options, message, variant: 'success' })
    },

    warning(message: string, options?: Partial<ToastItem>) {
      return this.show({ ...options, message, variant: 'warning' })
    },

    error(message: string, options?: Partial<ToastItem>) {
      return this.show({ ...options, message, variant: 'error' })
    }
  },
  beforeDestroy() {
    this.clear()
  }
})
</script>

<style scoped>
.toast-list {
  @apply space-y-0;
}

.toast-icon {
  @apply flex-shrink-0 mr-3;
}

.toast-content {
  @apply flex-1 min-w-0;
}

.toast-title {
  @apply font-semibold text-sm mb-1;
}

.toast-message {
  @apply text-sm leading-relaxed;
}

.toast-close {
  @apply flex-shrink-0 ml-3 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200;
}

.toast-progress {
  @apply absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b;
  animation: toast-progress linear forwards;
}

/* 动画 */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-move {
  transition: transform 0.3s ease;
}

@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>
