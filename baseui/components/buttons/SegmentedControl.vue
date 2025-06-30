<template>
  <div :class="containerClasses" role="radiogroup" :aria-label="ariaLabel">
    <button
      v-for="(option, index) in options"
      :key="option.value || index"
      :class="getSegmentClasses(option, index)"
      :aria-checked="isSelected(option)"
      :disabled="option.disabled || disabled"
      role="radio"
      @click="selectOption(option, index)"
      @keydown="handleKeydown($event, index)"
    >
      <!-- 图标 -->
      <span v-if="option.icon" class="segment-icon">
        <component :is="option.icon" />
      </span>
      
      <!-- 文本 -->
      <span v-if="option.label" class="segment-label">
        {{ option.label }}
      </span>
      
      <!-- 徽章 -->
      <span v-if="option.badge" class="segment-badge">
        {{ option.badge }}
      </span>
    </button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

interface SegmentOption {
  value: any
  label?: string
  icon?: any
  badge?: string | number
  disabled?: boolean
}

export default Vue.extend({
  name: 'SegmentedControl',
  props: {
    value: {
      type: null,
      default: null
    },
    options: {
      type: Array as () => SegmentOption[],
      required: true
    },
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value: string) => ['default', 'primary', 'secondary'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    fullWidth: {
      type: Boolean,
      default: false
    },
    ariaLabel: {
      type: String,
      default: ''
    }
  },
  computed: {
    containerClasses(): string[] {
      const classes = ['segmented-control', 'inline-flex', 'rounded-lg', 'p-1']
      
      // 背景
      switch (this.variant) {
        case 'primary':
          classes.push('bg-blue-100', 'dark:bg-blue-900/30')
          break
        case 'secondary':
          classes.push('bg-gray-200', 'dark:bg-gray-700')
          break
        default:
          classes.push('bg-gray-100', 'dark:bg-gray-800')
          break
      }
      
      // 宽度
      if (this.fullWidth) {
        classes.push('w-full')
      }
      
      // 禁用状态
      if (this.disabled) {
        classes.push('opacity-50', 'cursor-not-allowed')
      }
      
      return classes
    }
  },
  methods: {
    isSelected(option: SegmentOption): boolean {
      return option.value === this.value
    },
    
    getSegmentClasses(option: SegmentOption, index: number): string[] {
      const classes = [
        'segment',
        'flex',
        'items-center',
        'justify-center',
        'gap-1.5',
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
          classes.push('px-3', 'py-1', 'text-xs', 'min-h-7')
          break
        case 'lg':
          classes.push('px-6', 'py-2.5', 'text-base', 'min-h-11')
          break
        default:
          classes.push('px-4', 'py-1.5', 'text-sm', 'min-h-9')
          break
      }
      
      // 宽度
      if (this.fullWidth) {
        classes.push('flex-1')
      }
      
      // 状态
      const isSelected = this.isSelected(option)
      const isDisabled = option.disabled || this.disabled
      
      if (isDisabled) {
        classes.push('cursor-not-allowed', 'opacity-50')
      } else {
        classes.push('cursor-pointer')
        
        if (isSelected) {
          // 选中状态
          classes.push('bg-white', 'dark:bg-gray-600', 'text-gray-900', 'dark:text-gray-100', 'shadow-sm')
          
          switch (this.variant) {
            case 'primary':
              classes.push('ring-1', 'ring-blue-200', 'dark:ring-blue-700')
              break
            case 'secondary':
              classes.push('ring-1', 'ring-gray-300', 'dark:ring-gray-500')
              break
          }
        } else {
          // 未选中状态
          classes.push('text-gray-600', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-gray-100', 'hover:bg-white/50', 'dark:hover:bg-gray-600/50')
        }
      }
      
      return classes
    },
    
    selectOption(option: SegmentOption, index: number) {
      if (option.disabled || this.disabled) return
      
      this.$emit('input', option.value)
      this.$emit('change', option.value, option, index)
    },
    
    handleKeydown(event: KeyboardEvent, index: number) {
      const { key } = event
      
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) {
        event.preventDefault()
        
        const isNext = key === 'ArrowRight' || key === 'ArrowDown'
        const isPrev = key === 'ArrowLeft' || key === 'ArrowUp'
        
        let newIndex = index
        
        if (isNext) {
          newIndex = (index + 1) % this.options.length
        } else if (isPrev) {
          newIndex = (index - 1 + this.options.length) % this.options.length
        }
        
        // 跳过禁用的选项
        while (this.options[newIndex]?.disabled && newIndex !== index) {
          if (isNext) {
            newIndex = (newIndex + 1) % this.options.length
          } else {
            newIndex = (newIndex - 1 + this.options.length) % this.options.length
          }
        }
        
        if (!this.options[newIndex]?.disabled) {
          this.selectOption(this.options[newIndex], newIndex)
        }
      } else if (key === 'Enter' || key === ' ') {
        event.preventDefault()
        this.selectOption(this.options[index], index)
      }
    }
  }
})
</script>

<style scoped>
.segmented-control {
  position: relative;
}

.segment {
  position: relative;
  border: none;
  background: none;
  white-space: nowrap;
}

.segment-icon {
  @apply flex-shrink-0 w-4 h-4;
}

.segment-label {
  @apply truncate;
}

.segment-badge {
  @apply inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded;
}

/* 选中状态的徽章样式 */
.segment[aria-checked="true"] .segment-badge {
  @apply bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300;
}

/* 焦点样式 */
.segment:focus-visible {
  @apply ring-2 ring-blue-500 ring-offset-2;
}

/* 动画效果 */
.segment {
  transform: scale(1);
}

.segment:active {
  transform: scale(0.98);
}
</style>
