<template>
  <label
    :class="labelClasses"
    :for="htmlFor"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <!-- 必填标记 -->
    <span v-if="required" class="label-required">*</span>
    
    <!-- 标签文本 -->
    <span class="label-text">
      <slot />
    </span>
    
    <!-- 可选标记 -->
    <span v-if="optional" class="label-optional">(可选)</span>
    
    <!-- 帮助图标 -->
    <span v-if="help" class="label-help" :title="help">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </span>
  </label>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Label',
  inheritAttrs: false,
  props: {
    htmlFor: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
    },
    weight: {
      type: String,
      default: 'medium',
      validator: (value: string) => ['normal', 'medium', 'semibold', 'bold'].includes(value)
    },
    color: {
      type: String,
      default: 'default',
      validator: (value: string) => ['default', 'muted', 'primary', 'secondary', 'success', 'warning', 'error'].includes(value)
    },
    required: {
      type: Boolean,
      default: false
    },
    optional: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    help: {
      type: String,
      default: ''
    }
  },
  computed: {
    labelClasses(): string[] {
      const classes = ['label', 'inline-flex', 'items-center', 'gap-1']
      
      // 尺寸
      switch (this.size) {
        case 'sm':
          classes.push('text-xs')
          break
        case 'lg':
          classes.push('text-base')
          break
        default:
          classes.push('text-sm')
          break
      }
      
      // 字重
      switch (this.weight) {
        case 'normal':
          classes.push('font-normal')
          break
        case 'medium':
          classes.push('font-medium')
          break
        case 'semibold':
          classes.push('font-semibold')
          break
        case 'bold':
          classes.push('font-bold')
          break
      }
      
      // 颜色
      if (this.disabled) {
        classes.push('text-gray-400', 'dark:text-gray-600', 'cursor-not-allowed')
      } else {
        switch (this.color) {
          case 'muted':
            classes.push('text-gray-600', 'dark:text-gray-400')
            break
          case 'primary':
            classes.push('text-blue-700', 'dark:text-blue-300')
            break
          case 'secondary':
            classes.push('text-gray-700', 'dark:text-gray-300')
            break
          case 'success':
            classes.push('text-green-700', 'dark:text-green-300')
            break
          case 'warning':
            classes.push('text-yellow-700', 'dark:text-yellow-300')
            break
          case 'error':
            classes.push('text-red-700', 'dark:text-red-300')
            break
          default:
            classes.push('text-gray-900', 'dark:text-gray-100')
            break
        }
        classes.push('cursor-pointer')
      }
      
      return classes
    }
  }
})
</script>

<style scoped>
.label {
  position: relative;
}

.label-required {
  @apply text-red-500 font-medium;
}

.label-text {
  @apply flex-1;
}

.label-optional {
  @apply text-gray-500 dark:text-gray-400 text-xs font-normal;
}

.label-help {
  @apply text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help transition-colors duration-200;
}

/* 工具提示样式 */
.label-help[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 1000;
  margin-bottom: 0.25rem;
  pointer-events: none;
}

.label-help[title]:hover::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  margin-bottom: -4px;
  pointer-events: none;
}
</style>
