<template>
  <div class="spinner" :class="containerClasses">
    <!-- 加载图标 -->
    <div :class="spinnerClasses">
      <!-- 默认圆形加载器 -->
      <svg v-if="type === 'circle'" class="spinner-svg" viewBox="0 0 50 50">
        <circle
          class="spinner-circle"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          stroke-width="4"
          stroke-linecap="round"
          stroke-dasharray="31.416"
          stroke-dashoffset="31.416"
        />
      </svg>

      <!-- 点状加载器 -->
      <div v-else-if="type === 'dots'" class="spinner-dots">
        <div class="spinner-dot"></div>
        <div class="spinner-dot"></div>
        <div class="spinner-dot"></div>
      </div>

      <!-- 脉冲加载器 -->
      <div v-else-if="type === 'pulse'" class="spinner-pulse"></div>

      <!-- 条形加载器 -->
      <div v-else-if="type === 'bars'" class="spinner-bars">
        <div class="spinner-bar"></div>
        <div class="spinner-bar"></div>
        <div class="spinner-bar"></div>
        <div class="spinner-bar"></div>
        <div class="spinner-bar"></div>
      </div>

      <!-- 环形加载器 -->
      <div v-else-if="type === 'ring'" class="spinner-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>

      <!-- 自定义图标 -->
      <component v-else-if="icon" :is="icon" class="spinner-icon" />
    </div>

    <!-- 加载文本 -->
    <div v-if="text || $slots.default" class="spinner-text">
      <slot>{{ text }}</slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Spinner',
  props: {
    type: {
      type: String,
      default: 'circle',
      validator: (value: string) => ['circle', 'dots', 'pulse', 'bars', 'ring'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
    },
    color: {
      type: String,
      default: 'primary',
      validator: (value: string) => ['primary', 'secondary', 'success', 'warning', 'error', 'white'].includes(value)
    },
    text: {
      type: String,
      default: ''
    },
    icon: {
      type: [String, Object],
      default: null
    },
    centered: {
      type: Boolean,
      default: false
    },
    overlay: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    containerClasses(): string[] {
      const classes = ['flex', 'items-center']

      if (this.centered) {
        classes.push('justify-center')
      }

      if (this.text || this.$slots.default) {
        classes.push('gap-3')
      }

      if (this.overlay) {
        classes.push(
          'fixed',
          'inset-0',
          'z-50',
          'bg-white/80',
          'dark:bg-gray-900/80',
          'backdrop-blur-sm'
        )
      }

      return classes
    },

    spinnerClasses(): string[] {
      const classes = ['spinner-element', 'flex-shrink-0']

      // 尺寸
      switch (this.size) {
        case 'xs':
          classes.push('w-3', 'h-3')
          break
        case 'sm':
          classes.push('w-4', 'h-4')
          break
        case 'md':
          classes.push('w-6', 'h-6')
          break
        case 'lg':
          classes.push('w-8', 'h-8')
          break
        case 'xl':
          classes.push('w-12', 'h-12')
          break
      }

      // 颜色
      switch (this.color) {
        case 'secondary':
          classes.push('text-gray-600', 'dark:text-gray-400')
          break
        case 'success':
          classes.push('text-green-600', 'dark:text-green-500')
          break
        case 'warning':
          classes.push('text-yellow-600', 'dark:text-yellow-500')
          break
        case 'error':
          classes.push('text-red-600', 'dark:text-red-500')
          break
        case 'white':
          classes.push('text-white')
          break
        default:
          classes.push('text-blue-600', 'dark:text-blue-500')
          break
      }

      return classes
    }
  }
})
</script>

<style scoped>
.spinner-element {
  animation-duration: 1s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

.spinner-text {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

/* 圆形加载器 */
.spinner-svg {
  @apply w-full h-full;
  animation: spin 1s linear infinite;
}

.spinner-circle {
  animation: spinner-circle 1.5s ease-in-out infinite;
}

/* 点状加载器 */
.spinner-dots {
  @apply flex gap-1;
}

.spinner-dot {
  @apply w-1.5 h-1.5 bg-current rounded-full;
  animation: spinner-dots 1.4s ease-in-out infinite both;
}

.spinner-dot:nth-child(1) { animation-delay: -0.32s; }
.spinner-dot:nth-child(2) { animation-delay: -0.16s; }

/* 脉冲加载器 */
.spinner-pulse {
  @apply w-full h-full bg-current rounded-full;
  animation: spinner-pulse 1s ease-in-out infinite;
}

/* 条形加载器 */
.spinner-bars {
  @apply flex items-end gap-0.5 h-full;
}

.spinner-bar {
  @apply w-0.5 bg-current;
  animation: spinner-bars 1.2s ease-in-out infinite;
}

.spinner-bar:nth-child(1) { animation-delay: -1.2s; }
.spinner-bar:nth-child(2) { animation-delay: -1.1s; }
.spinner-bar:nth-child(3) { animation-delay: -1.0s; }
.spinner-bar:nth-child(4) { animation-delay: -0.9s; }
.spinner-bar:nth-child(5) { animation-delay: -0.8s; }

/* 环形加载器 */
.spinner-ring {
  @apply relative w-full h-full;
}

.spinner-ring div {
  @apply absolute border-2 border-current rounded-full;
  animation: spinner-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: currentColor transparent transparent transparent;
}

.spinner-ring div:nth-child(1) {
  @apply w-full h-full;
  animation-delay: -0.45s;
}

.spinner-ring div:nth-child(2) {
  @apply w-5/6 h-5/6 top-1/12 left-1/12;
  animation-delay: -0.3s;
}

.spinner-ring div:nth-child(3) {
  @apply w-4/6 h-4/6 top-1/6 left-1/6;
  animation-delay: -0.15s;
}

.spinner-ring div:nth-child(4) {
  @apply w-3/6 h-3/6 top-1/4 left-1/4;
}

/* 自定义图标 */
.spinner-icon {
  @apply w-full h-full;
  animation: spin 1s linear infinite;
}

/* 动画定义 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes spinner-circle {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

@keyframes spinner-dots {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes spinner-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

@keyframes spinner-bars {
  0%, 40%, 100% {
    height: 20%;
  }
  20% {
    height: 100%;
  }
}

@keyframes spinner-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
