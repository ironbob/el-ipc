<template>
  <div class="progress-bar" :class="containerClasses">
    <!-- 标签 -->
    <div v-if="label || showPercentage" class="progress-label">
      <span v-if="label" class="progress-label-text">{{ label }}</span>
      <span v-if="showPercentage" class="progress-percentage">{{ Math.round(percentage) }}%</span>
    </div>

    <!-- 进度条容器 -->
    <div class="progress-track" :class="trackClasses">
      <!-- 进度条填充 -->
      <div
        class="progress-fill"
        :class="fillClasses"
        :style="fillStyle"
        role="progressbar"
        :aria-valuenow="value"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-label="ariaLabel || label"
      >
        <!-- 条纹动画 -->
        <div v-if="striped" class="progress-stripes"></div>
        
        <!-- 内部文本 -->
        <span v-if="showInnerText" class="progress-inner-text">
          {{ innerText || `${Math.round(percentage)}%` }}
        </span>
      </div>

      <!-- 缓冲进度 -->
      <div
        v-if="bufferValue !== null"
        class="progress-buffer"
        :style="bufferStyle"
      ></div>
    </div>

    <!-- 描述文本 -->
    <div v-if="description" class="progress-description">
      {{ description }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ProgressBar',
  props: {
    value: {
      type: Number,
      default: 0
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    bufferValue: {
      type: Number,
      default: null
    },
    variant: {
      type: String,
      default: 'primary',
      validator: (value: string) => ['primary', 'secondary', 'success', 'warning', 'error'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
    },
    label: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    showPercentage: {
      type: Boolean,
      default: false
    },
    showInnerText: {
      type: Boolean,
      default: false
    },
    innerText: {
      type: String,
      default: ''
    },
    striped: {
      type: Boolean,
      default: false
    },
    animated: {
      type: Boolean,
      default: false
    },
    indeterminate: {
      type: Boolean,
      default: false
    },
    rounded: {
      type: Boolean,
      default: true
    },
    ariaLabel: {
      type: String,
      default: ''
    }
  },
  computed: {
    percentage(): number {
      if (this.indeterminate) return 100
      const range = this.max - this.min
      return range > 0 ? ((this.value - this.min) / range) * 100 : 0
    },

    bufferPercentage(): number {
      if (this.bufferValue === null) return 0
      const range = this.max - this.min
      return range > 0 ? ((this.bufferValue - this.min) / range) * 100 : 0
    },

    containerClasses(): string[] {
      const classes = ['space-y-1']
      return classes
    },

    trackClasses(): string[] {
      const classes = ['relative', 'overflow-hidden', 'bg-gray-200', 'dark:bg-gray-700']

      // 尺寸
      switch (this.size) {
        case 'xs':
          classes.push('h-1')
          break
        case 'sm':
          classes.push('h-2')
          break
        case 'md':
          classes.push('h-3')
          break
        case 'lg':
          classes.push('h-4')
          break
        case 'xl':
          classes.push('h-6')
          break
      }

      // 圆角
      if (this.rounded) {
        classes.push('rounded-full')
      }

      return classes
    },

    fillClasses(): string[] {
      const classes = [
        'h-full',
        'transition-all',
        'duration-300',
        'ease-out',
        'flex',
        'items-center',
        'justify-center',
        'relative',
        'overflow-hidden'
      ]

      // 变体颜色
      switch (this.variant) {
        case 'secondary':
          classes.push('bg-gray-600', 'dark:bg-gray-400')
          break
        case 'success':
          classes.push('bg-green-600', 'dark:bg-green-500')
          break
        case 'warning':
          classes.push('bg-yellow-600', 'dark:bg-yellow-500')
          break
        case 'error':
          classes.push('bg-red-600', 'dark:bg-red-500')
          break
        default:
          classes.push('bg-blue-600', 'dark:bg-blue-500')
          break
      }

      // 圆角
      if (this.rounded) {
        classes.push('rounded-full')
      }

      // 不确定状态
      if (this.indeterminate) {
        classes.push('progress-indeterminate')
      }

      return classes
    },

    fillStyle(): Record<string, string> {
      if (this.indeterminate) {
        return {}
      }
      return {
        width: `${Math.max(0, Math.min(100, this.percentage))}%`
      }
    },

    bufferStyle(): Record<string, string> {
      return {
        width: `${Math.max(0, Math.min(100, this.bufferPercentage))}%`
      }
    }
  }
})
</script>

<style scoped>
.progress-label {
  @apply flex items-center justify-between text-sm;
}

.progress-label-text {
  @apply font-medium text-gray-700 dark:text-gray-300;
}

.progress-percentage {
  @apply text-gray-500 dark:text-gray-400 font-mono;
}

.progress-track {
  @apply w-full;
}

.progress-fill {
  @apply relative;
}

.progress-buffer {
  @apply absolute top-0 left-0 h-full bg-gray-300 dark:bg-gray-600 opacity-50;
}

.progress-stripes {
  @apply absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent;
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.1) 10px,
    rgba(255, 255, 255, 0.1) 20px
  );
}

.progress-inner-text {
  @apply text-xs font-medium text-white px-2 truncate;
}

.progress-description {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

/* 不确定状态动画 */
.progress-indeterminate {
  animation: progress-indeterminate 2s infinite linear;
  background: linear-gradient(
    90deg,
    transparent 0%,
    currentColor 50%,
    transparent 100%
  );
  background-size: 200% 100%;
}

/* 条纹动画 */
.progress-stripes {
  animation: progress-stripes 1s linear infinite;
}

@keyframes progress-indeterminate {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes progress-stripes {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 40px 0;
  }
}
</style>
