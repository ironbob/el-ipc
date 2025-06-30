<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    :type="type"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <span v-if="loading" class="btn-spinner">
      <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>
    
    <span v-if="icon && !loading" class="btn-icon" :class="{ 'mr-2': $slots.default }">
      <component :is="icon" />
    </span>
    
    <span v-if="$slots.default" class="btn-content">
      <slot />
    </span>
  </button>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'BaseButton',
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
    fullWidth: {
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
    }
  },
  computed: {
    buttonClasses(): string[] {
      const classes = [
        'btn',
        'inline-flex',
        'items-center',
        'justify-center',
        'font-medium',
        'rounded-md',
        'transition-all',
        'duration-200',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-offset-2'
      ]

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

      // 全宽
      if (this.fullWidth) {
        classes.push('w-full')
      }

      // 禁用状态
      if (this.disabled || this.loading) {
        classes.push('cursor-not-allowed', 'opacity-50')
      } else {
        classes.push('cursor-pointer', 'hover:shadow-sm', 'active:scale-95')
      }

      return classes
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
.btn {
  position: relative;
  overflow: hidden;
}

.btn-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-content {
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

/* 深色模式支持 */
.dark .btn {
  /* 深色模式下的样式调整 */
}
</style>
