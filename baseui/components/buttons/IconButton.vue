<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    :type="type"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <span v-if="loading" class="icon-spinner">
      <svg class="animate-spin" :class="iconSizeClass" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>
    
    <span v-else-if="icon" class="icon-content" :class="iconSizeClass">
      <component :is="icon" />
    </span>
    
    <slot v-else />
  </button>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'IconButton',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (value: string) => ['primary', 'secondary', 'tertiary', 'danger', 'ghost'].includes(value)
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
    loading: {
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
    shape: {
      type: String,
      default: 'circle',
      validator: (value: string) => ['circle', 'square'].includes(value)
    }
  },
  computed: {
    buttonClasses(): string[] {
      const classes = [
        'btn-icon',
        'inline-flex',
        'items-center',
        'justify-center',
        'font-medium',
        'transition-all',
        'duration-200',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-offset-2'
      ]

      // 形状
      if (this.shape === 'circle') {
        classes.push('rounded-full')
      } else {
        classes.push('rounded-md')
      }

      // 变体样式
      switch (this.variant) {
        case 'primary':
          classes.push(
            'bg-blue-600',
            'text-white',
            'hover:bg-blue-700',
            'focus:ring-blue-500',
            'disabled:bg-blue-300'
          )
          break
        case 'secondary':
          classes.push(
            'bg-gray-600',
            'text-white',
            'hover:bg-gray-700',
            'focus:ring-gray-500',
            'disabled:bg-gray-300'
          )
          break
        case 'tertiary':
          classes.push(
            'bg-white',
            'text-gray-700',
            'border',
            'border-gray-300',
            'hover:bg-gray-50',
            'focus:ring-gray-500',
            'disabled:bg-gray-100',
            'disabled:text-gray-400'
          )
          break
        case 'danger':
          classes.push(
            'bg-red-600',
            'text-white',
            'hover:bg-red-700',
            'focus:ring-red-500',
            'disabled:bg-red-300'
          )
          break
        case 'ghost':
          classes.push(
            'bg-transparent',
            'text-gray-700',
            'hover:bg-gray-100',
            'focus:ring-gray-500',
            'disabled:text-gray-400'
          )
          break
      }

      // 尺寸样式
      switch (this.size) {
        case 'xs':
          classes.push('w-6', 'h-6', 'p-1')
          break
        case 'sm':
          classes.push('w-8', 'h-8', 'p-1.5')
          break
        case 'md':
          classes.push('w-10', 'h-10', 'p-2')
          break
        case 'lg':
          classes.push('w-12', 'h-12', 'p-2.5')
          break
        case 'xl':
          classes.push('w-14', 'h-14', 'p-3')
          break
      }

      // 禁用状态
      if (this.disabled || this.loading) {
        classes.push('cursor-not-allowed', 'opacity-50')
      } else {
        classes.push('cursor-pointer', 'hover:shadow-sm', 'active:scale-95')
      }

      return classes
    },
    iconSizeClass(): string {
      switch (this.size) {
        case 'xs': return 'w-3 h-3'
        case 'sm': return 'w-4 h-4'
        case 'md': return 'w-5 h-5'
        case 'lg': return 'w-6 h-6'
        case 'xl': return 'w-7 h-7'
        default: return 'w-5 h-5'
      }
    }
  },
  methods: {
    handleClick(event: Event) {
      if (!this.disabled && !this.loading) {
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
.btn-icon {
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.icon-spinner,
.icon-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 动画 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
