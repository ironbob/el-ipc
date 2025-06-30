<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    :aria-expanded="expanded"
    :aria-controls="ariaControls"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <!-- 展开/收起图标 -->
    <span :class="iconClasses">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </span>
    
    <!-- 前缀图标 -->
    <span v-if="icon" class="disclosure-icon">
      <component :is="icon" />
    </span>
    
    <!-- 按钮文本 -->
    <span class="disclosure-content">
      <slot />
    </span>
    
    <!-- 徽章 -->
    <span v-if="badge" class="disclosure-badge">
      {{ badge }}
    </span>
  </button>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'DisclosureButton',
  inheritAttrs: false,
  props: {
    expanded: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value: string) => ['default', 'subtle', 'ghost'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
    },
    icon: {
      type: [String, Object],
      default: null
    },
    badge: {
      type: [String, Number],
      default: null
    },
    ariaControls: {
      type: String,
      default: ''
    },
    iconPosition: {
      type: String,
      default: 'left',
      validator: (value: string) => ['left', 'right'].includes(value)
    }
  },
  computed: {
    buttonClasses(): string[] {
      const classes = [
        'disclosure-button',
        'flex',
        'items-center',
        'w-full',
        'text-left',
        'font-medium',
        'transition-all',
        'duration-200',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-blue-500',
        'focus:ring-offset-2',
        'rounded-md'
      ]

      // 尺寸
      switch (this.size) {
        case 'sm':
          classes.push('px-2', 'py-1', 'text-sm', 'gap-1')
          break
        case 'lg':
          classes.push('px-4', 'py-3', 'text-base', 'gap-3')
          break
        default:
          classes.push('px-3', 'py-2', 'text-sm', 'gap-2')
          break
      }

      // 变体
      if (this.disabled) {
        classes.push('cursor-not-allowed', 'opacity-50')
      } else {
        classes.push('cursor-pointer')
        
        switch (this.variant) {
          case 'subtle':
            classes.push('text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-100', 'dark:hover:bg-gray-800')
            break
          case 'ghost':
            classes.push('text-gray-600', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-gray-100', 'hover:bg-gray-50', 'dark:hover:bg-gray-900')
            break
          default:
            classes.push('text-gray-900', 'dark:text-gray-100', 'hover:bg-gray-50', 'dark:hover:bg-gray-800')
            break
        }
      }

      return classes
    },
    
    iconClasses(): string[] {
      const classes = ['disclosure-chevron', 'flex-shrink-0', 'transition-transform', 'duration-200']
      
      if (this.iconPosition === 'right') {
        classes.push('order-last')
      }
      
      if (this.expanded) {
        classes.push('rotate-90')
      }
      
      return classes
    }
  },
  methods: {
    handleClick(event: Event) {
      if (!this.disabled) {
        this.$emit('update:expanded', !this.expanded)
        this.$emit('toggle', !this.expanded, event)
        this.$emit('click', event)
      }
    },
    
    handleFocus(event: Event) {
      this.$emit('focus', event)
    },
    
    handleBlur(event: Event) {
      this.$emit('blur', event)
    }
  }
})
</script>

<style scoped>
.disclosure-button {
  position: relative;
  border: none;
  background: none;
}

.disclosure-chevron {
  color: currentColor;
  opacity: 0.7;
}

.disclosure-icon {
  @apply flex-shrink-0 w-4 h-4;
}

.disclosure-content {
  @apply flex-1 min-w-0 truncate;
}

.disclosure-badge {
  @apply inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex-shrink-0;
}

/* 展开状态的特殊样式 */
.disclosure-button[aria-expanded="true"] {
  @apply bg-gray-50 dark:bg-gray-800;
}

.disclosure-button[aria-expanded="true"] .disclosure-chevron {
  @apply text-blue-600 dark:text-blue-400;
}

/* 悬停效果 */
.disclosure-button:hover .disclosure-chevron {
  opacity: 1;
}

/* 焦点样式 */
.disclosure-button:focus-visible {
  @apply ring-2 ring-blue-500 ring-offset-2;
}
</style>
