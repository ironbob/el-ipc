<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    :type="type"
    :aria-pressed="pressed"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <!-- 图标 -->
    <span v-if="icon" class="toggle-icon" :class="{ 'mr-2': $slots.default }">
      <component :is="icon" />
    </span>
    
    <!-- 文本内容 -->
    <span v-if="$slots.default" class="toggle-content">
      <slot />
    </span>
    
    <!-- 切换指示器 -->
    <span v-if="showIndicator" class="toggle-indicator">
      <svg v-if="pressed" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
    </span>
  </button>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ToggleButton',
  inheritAttrs: false,
  props: {
    pressed: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value: string) => ['default', 'primary', 'secondary', 'success', 'warning', 'danger'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'button',
      validator: (value: string) => ['button', 'submit', 'reset'].includes(value)
    },
    icon: {
      type: [String, Object],
      default: null
    },
    showIndicator: {
      type: Boolean,
      default: false
    },
    exclusive: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    buttonClasses(): string[] {
      const classes = [
        'toggle-button',
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
        case 'xs':
          classes.push('px-2', 'py-1', 'text-xs', 'min-h-6')
          break
        case 'sm':
          classes.push('px-3', 'py-1.5', 'text-sm', 'min-h-8')
          break
        case 'md':
          classes.push('px-4', 'py-2', 'text-sm', 'min-h-10')
          break
        case 'lg':
          classes.push('px-6', 'py-3', 'text-base', 'min-h-12')
          break
        case 'xl':
          classes.push('px-8', 'py-4', 'text-lg', 'min-h-14')
          break
      }

      // 状态和变体
      if (this.disabled) {
        classes.push('cursor-not-allowed', 'opacity-50')
      } else {
        classes.push('cursor-pointer')
        
        if (this.pressed) {
          // 按下状态
          switch (this.variant) {
            case 'primary':
              classes.push('bg-blue-600', 'text-white', 'border-blue-600', 'hover:bg-blue-700')
              break
            case 'secondary':
              classes.push('bg-gray-600', 'text-white', 'border-gray-600', 'hover:bg-gray-700')
              break
            case 'success':
              classes.push('bg-green-600', 'text-white', 'border-green-600', 'hover:bg-green-700')
              break
            case 'warning':
              classes.push('bg-yellow-600', 'text-white', 'border-yellow-600', 'hover:bg-yellow-700')
              break
            case 'danger':
              classes.push('bg-red-600', 'text-white', 'border-red-600', 'hover:bg-red-700')
              break
            default:
              classes.push('bg-gray-100', 'dark:bg-gray-700', 'text-gray-900', 'dark:text-gray-100', 'border-gray-300', 'dark:border-gray-600', 'hover:bg-gray-200', 'dark:hover:bg-gray-600')
              break
          }
        } else {
          // 未按下状态
          classes.push('bg-white', 'dark:bg-gray-800', 'text-gray-700', 'dark:text-gray-300', 'border', 'border-gray-300', 'dark:border-gray-600', 'hover:bg-gray-50', 'dark:hover:bg-gray-700')
        }
        
        classes.push('hover:shadow-sm', 'active:scale-95')
      }

      return classes
    }
  },
  methods: {
    handleClick(event: Event) {
      if (!this.disabled) {
        this.$emit('update:pressed', !this.pressed)
        this.$emit('toggle', !this.pressed, event)
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
.toggle-button {
  position: relative;
  border-width: 1px;
  border-style: solid;
}

.toggle-icon {
  @apply flex-shrink-0 w-4 h-4;
}

.toggle-content {
  @apply flex-1;
}

.toggle-indicator {
  @apply flex-shrink-0 ml-2;
}

/* 按下状态的特殊效果 */
.toggle-button[aria-pressed="true"] {
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 深色模式调整 */
.dark .toggle-button[aria-pressed="true"] {
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}
</style>
