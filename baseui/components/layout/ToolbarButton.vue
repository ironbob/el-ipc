<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    :title="tooltip"
    @click="handleClick"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <!-- 图标 -->
    <span v-if="icon" class="toolbar-button-icon">
      <component :is="icon" />
    </span>
    
    <!-- 文本 -->
    <span v-if="$slots.default" class="toolbar-button-text">
      <slot />
    </span>
    
    <!-- 下拉箭头 -->
    <span v-if="dropdown" class="toolbar-button-dropdown">
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </span>
  </button>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ToolbarButton',
  inheritAttrs: false,
  props: {
    icon: {
      type: [String, Object],
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value: string) => ['default', 'primary', 'secondary', 'ghost'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
    },
    dropdown: {
      type: Boolean,
      default: false
    },
    tooltip: {
      type: String,
      default: ''
    }
  },
  computed: {
    buttonClasses(): string[] {
      const classes = [
        'toolbar-button',
        'inline-flex',
        'items-center',
        'justify-center',
        'font-medium',
        'rounded-md',
        'transition-all',
        'duration-200',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-offset-2',
        'focus:ring-blue-500'
      ]
      
      // 尺寸
      switch (this.size) {
        case 'sm':
          if (this.$slots.default) {
            classes.push('px-2', 'py-1', 'text-xs', 'gap-1')
          } else {
            classes.push('p-1', 'w-6', 'h-6')
          }
          break
        case 'lg':
          if (this.$slots.default) {
            classes.push('px-4', 'py-2', 'text-base', 'gap-2')
          } else {
            classes.push('p-2', 'w-10', 'h-10')
          }
          break
        default:
          if (this.$slots.default) {
            classes.push('px-3', 'py-1.5', 'text-sm', 'gap-1.5')
          } else {
            classes.push('p-1.5', 'w-8', 'h-8')
          }
          break
      }
      
      // 状态和变体
      if (this.disabled) {
        classes.push('opacity-50', 'cursor-not-allowed')
      } else {
        classes.push('cursor-pointer')
        
        if (this.active) {
          switch (this.variant) {
            case 'primary':
              classes.push('bg-blue-600', 'text-white', 'hover:bg-blue-700')
              break
            case 'secondary':
              classes.push('bg-gray-600', 'text-white', 'hover:bg-gray-700')
              break
            default:
              classes.push('bg-blue-100', 'dark:bg-blue-900/30', 'text-blue-700', 'dark:text-blue-300')
              break
          }
        } else {
          switch (this.variant) {
            case 'primary':
              classes.push('bg-blue-600', 'text-white', 'hover:bg-blue-700')
              break
            case 'secondary':
              classes.push('bg-gray-600', 'text-white', 'hover:bg-gray-700')
              break
            case 'ghost':
              classes.push('text-gray-600', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-gray-100', 'hover:bg-gray-100', 'dark:hover:bg-gray-800')
              break
            default:
              classes.push('text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-100', 'dark:hover:bg-gray-800', 'hover:text-gray-900', 'dark:hover:text-gray-100')
              break
          }
        }
      }
      
      return classes
    }
  },
  methods: {
    handleClick(event: Event) {
      if (!this.disabled) {
        this.$emit('click', event)
      }
    }
  }
})
</script>

<style scoped>
.toolbar-button {
  position: relative;
  border: none;
  background: transparent;
}

.toolbar-button-icon {
  @apply flex-shrink-0 w-4 h-4;
}

.toolbar-button-text {
  @apply truncate;
}

.toolbar-button-dropdown {
  @apply flex-shrink-0;
}

/* 工具提示样式 */
.toolbar-button[title]:hover::after {
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

.toolbar-button[title]:hover::before {
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
