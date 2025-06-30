<template>
  <div class="picker" :class="containerClasses">
    <!-- 标签 -->
    <label v-if="label" :for="pickerId" class="picker-label">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- 选择器容器 -->
    <div class="picker-container" :class="pickerContainerClasses" ref="container">
      <!-- 显示区域 -->
      <div
        :id="pickerId"
        class="picker-display"
        :class="displayClasses"
        @click="toggleDropdown"
        @keydown="handleKeydown"
        tabindex="0"
        role="button"
        :aria-expanded="isOpen"
        :aria-haspopup="true"
      >
        <!-- 选中值显示 -->
        <span v-if="displayText" class="picker-value">{{ displayText }}</span>
        <span v-else class="picker-placeholder">{{ placeholder }}</span>

        <!-- 下拉箭头 -->
        <span class="picker-arrow">
          <svg :class="arrowClasses" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>

      <!-- 下拉选项 -->
      <transition name="dropdown">
        <div
          v-if="isOpen"
          class="picker-dropdown"
          :class="dropdownClasses"
          ref="dropdown"
        >
          <!-- 多级选择器 -->
          <div v-if="multiple" class="picker-columns">
            <div
              v-for="(column, columnIndex) in columns"
              :key="columnIndex"
              class="picker-column"
            >
              <div class="picker-column-header">
                {{ column.title || `选项 ${columnIndex + 1}` }}
              </div>
              <div class="picker-column-options">
                <div
                  v-for="(option, optionIndex) in column.options"
                  :key="getOptionKey(option, optionIndex)"
                  :class="getColumnOptionClasses(option, columnIndex, optionIndex)"
                  @click="selectColumnOption(option, columnIndex, optionIndex)"
                >
                  <span class="option-label">{{ getOptionLabel(option) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 单级选择器 -->
          <div v-else class="picker-options">
            <div
              v-for="(option, index) in options"
              :key="getOptionKey(option, index)"
              :class="getOptionClasses(option, index)"
              @click="selectOption(option, index)"
              @mouseenter="highlightedIndex = index"
            >
              <!-- 选项图标 -->
              <span v-if="option.icon" class="option-icon">
                <component :is="option.icon" />
              </span>

              <!-- 选项内容 -->
              <div class="option-content">
                <span class="option-label">{{ getOptionLabel(option) }}</span>
                <span v-if="option.description" class="option-description">{{ option.description }}</span>
              </div>

              <!-- 选中标记 -->
              <span v-if="isSelected(option)" class="option-check">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div v-if="showActions" class="picker-actions">
            <button
              type="button"
              class="picker-action-btn picker-cancel"
              @click="handleCancel"
            >
              取消
            </button>
            <button
              type="button"
              class="picker-action-btn picker-confirm"
              @click="handleConfirm"
            >
              确认
            </button>
          </div>
        </div>
      </transition>
    </div>

    <!-- 帮助文本或错误信息 -->
    <div v-if="helperText || errorMessage" class="picker-helper">
      <span :class="helperTextClasses">
        {{ errorMessage || helperText }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

let pickerIdCounter = 0

interface PickerOption {
  label?: string
  value: any
  description?: string
  icon?: any
  disabled?: boolean
  [key: string]: any
}

interface PickerColumn {
  title?: string
  options: PickerOption[]
}

export default Vue.extend({
  name: 'Picker',
  props: {
    value: {
      type: null,
      default: null
    },
    options: {
      type: Array as () => PickerOption[],
      default: () => []
    },
    columns: {
      type: Array as () => PickerColumn[],
      default: () => []
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请选择...'
    },
    helperText: {
      type: String,
      default: ''
    },
    errorMessage: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
    },
    multiple: {
      type: Boolean,
      default: false
    },
    showActions: {
      type: Boolean,
      default: false
    },
    labelKey: {
      type: String,
      default: 'label'
    },
    valueKey: {
      type: String,
      default: 'value'
    }
  },
  data() {
    return {
      pickerId: `picker-${++pickerIdCounter}`,
      isOpen: false,
      highlightedIndex: -1,
      tempValue: null as any,
      columnSelections: [] as any[]
    }
  },
  computed: {
    hasError(): boolean {
      return !!this.errorMessage
    },
    
    selectedOption(): PickerOption | null {
      if (this.multiple) return null
      return this.options.find(option => this.getOptionValue(option) === this.value) || null
    },
    
    displayText(): string {
      if (this.multiple) {
        if (this.columnSelections.length > 0) {
          return this.columnSelections.map(selection => 
            selection ? this.getOptionLabel(selection) : ''
          ).filter(Boolean).join(' - ')
        }
        return ''
      }
      
      return this.selectedOption ? this.getOptionLabel(this.selectedOption) : ''
    },
    
    containerClasses(): string[] {
      const classes = ['space-y-1', 'relative']
      
      if (this.disabled) {
        classes.push('opacity-50')
      }
      
      return classes
    },
    
    pickerContainerClasses(): string[] {
      const classes = ['relative']
      
      return classes
    },
    
    displayClasses(): string[] {
      const classes = [
        'flex',
        'items-center',
        'justify-between',
        'w-full',
        'border',
        'rounded-md',
        'transition-colors',
        'duration-200',
        'cursor-pointer'
      ]

      // 尺寸
      switch (this.size) {
        case 'sm':
          classes.push('px-3', 'py-1.5', 'text-sm', 'min-h-8')
          break
        case 'lg':
          classes.push('px-4', 'py-3', 'text-base', 'min-h-12')
          break
        default:
          classes.push('px-3', 'py-2', 'text-sm', 'min-h-10')
          break
      }

      // 状态样式
      if (this.hasError) {
        classes.push('border-red-300', 'focus:border-red-500', 'focus:ring-red-500')
      } else if (this.isOpen) {
        classes.push('border-blue-300', 'ring-1', 'ring-blue-500')
      } else {
        classes.push('border-gray-300', 'focus:border-blue-500', 'focus:ring-1', 'focus:ring-blue-500')
      }

      if (this.disabled) {
        classes.push('bg-gray-50', 'cursor-not-allowed')
      } else {
        classes.push('bg-white', 'hover:border-gray-400')
      }

      return classes
    },
    
    arrowClasses(): string[] {
      const classes = ['w-4', 'h-4', 'transition-transform', 'duration-200', 'text-gray-400']
      
      if (this.isOpen) {
        classes.push('rotate-180')
      }
      
      return classes
    },
    
    dropdownClasses(): string[] {
      return [
        'absolute',
        'top-full',
        'left-0',
        'right-0',
        'z-50',
        'mt-1',
        'bg-white',
        'dark:bg-gray-800',
        'border',
        'border-gray-200',
        'dark:border-gray-700',
        'rounded-md',
        'shadow-lg',
        'overflow-hidden'
      ]
    },
    
    helperTextClasses(): string[] {
      const classes = ['text-xs']
      
      if (this.hasError) {
        classes.push('text-red-600')
      } else {
        classes.push('text-gray-500')
      }
      
      return classes
    }
  },
  watch: {
    isOpen(newValue) {
      if (newValue) {
        this.tempValue = this.value
        this.initializeColumnSelections()
        this.$nextTick(() => {
          this.addClickOutsideListener()
        })
      } else {
        this.removeClickOutsideListener()
      }
    },
    
    value: {
      immediate: true,
      handler() {
        this.initializeColumnSelections()
      }
    }
  },
  methods: {
    getOptionLabel(option: PickerOption): string {
      return option[this.labelKey] || String(option.value || option)
    },
    
    getOptionValue(option: PickerOption): any {
      return option[this.valueKey] !== undefined ? option[this.valueKey] : option.value
    },
    
    getOptionKey(option: PickerOption, index: number): string {
      return `${this.getOptionValue(option)}-${index}`
    },
    
    isSelected(option: PickerOption): boolean {
      return this.getOptionValue(option) === this.value
    },
    
    getOptionClasses(option: PickerOption, index: number): string[] {
      const classes = [
        'flex',
        'items-center',
        'px-3',
        'py-2',
        'cursor-pointer',
        'transition-colors',
        'duration-200'
      ]
      
      if (option.disabled) {
        classes.push('opacity-50', 'cursor-not-allowed')
      } else if (index === this.highlightedIndex) {
        classes.push('bg-blue-50', 'dark:bg-blue-900/30', 'text-blue-700', 'dark:text-blue-300')
      } else if (this.isSelected(option)) {
        classes.push('bg-blue-100', 'dark:bg-blue-900/50', 'text-blue-700', 'dark:text-blue-300')
      } else {
        classes.push('text-gray-900', 'dark:text-gray-100', 'hover:bg-gray-50', 'dark:hover:bg-gray-700')
      }
      
      return classes
    },
    
    getColumnOptionClasses(option: PickerOption, columnIndex: number, optionIndex: number): string[] {
      const classes = [
        'px-3',
        'py-2',
        'cursor-pointer',
        'transition-colors',
        'duration-200'
      ]
      
      if (option.disabled) {
        classes.push('opacity-50', 'cursor-not-allowed')
      } else if (this.columnSelections[columnIndex] === option) {
        classes.push('bg-blue-100', 'dark:bg-blue-900/50', 'text-blue-700', 'dark:text-blue-300')
      } else {
        classes.push('text-gray-900', 'dark:text-gray-100', 'hover:bg-gray-50', 'dark:hover:bg-gray-700')
      }
      
      return classes
    },
    
    initializeColumnSelections() {
      if (this.multiple && this.columns.length > 0) {
        // 初始化列选择状态
        this.columnSelections = new Array(this.columns.length).fill(null)
      }
    },
    
    handleKeydown(event: KeyboardEvent) {
      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault()
          this.toggleDropdown()
          break
        case 'Escape':
          this.isOpen = false
          break
        case 'ArrowDown':
          if (!this.multiple) {
            event.preventDefault()
            if (!this.isOpen) {
              this.isOpen = true
            } else {
              this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.options.length - 1)
            }
          }
          break
        case 'ArrowUp':
          if (!this.multiple) {
            event.preventDefault()
            if (this.isOpen) {
              this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1)
            }
          }
          break
      }
    },
    
    toggleDropdown() {
      if (!this.disabled) {
        this.isOpen = !this.isOpen
      }
    },
    
    selectOption(option: PickerOption, index: number) {
      if (option.disabled) return
      
      this.$emit('input', this.getOptionValue(option))
      this.$emit('change', this.getOptionValue(option), option)
      
      if (!this.showActions) {
        this.isOpen = false
      }
    },
    
    selectColumnOption(option: PickerOption, columnIndex: number, optionIndex: number) {
      if (option.disabled) return
      
      this.$set(this.columnSelections, columnIndex, option)
      this.$emit('column-change', this.columnSelections, columnIndex, option)
    },
    
    handleCancel() {
      this.isOpen = false
      this.$emit('cancel')
    },
    
    handleConfirm() {
      if (this.multiple) {
        this.$emit('input', this.columnSelections.map(selection => 
          selection ? this.getOptionValue(selection) : null
        ))
        this.$emit('change', this.columnSelections)
      }
      
      this.isOpen = false
      this.$emit('confirm')
    },
    
    handleClickOutside(event: Event) {
      const target = event.target as HTMLElement
      if (!this.$refs.container || !(this.$refs.container as HTMLElement).contains(target)) {
        this.isOpen = false
      }
    },
    
    addClickOutsideListener() {
      document.addEventListener('click', this.handleClickOutside)
    },
    
    removeClickOutsideListener() {
      document.removeEventListener('click', this.handleClickOutside)
    }
  },
  beforeDestroy() {
    this.removeClickOutsideListener()
  }
})
</script>

<style scoped>
.picker-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.picker-display {
  outline: none;
}

.picker-value {
  @apply text-gray-900 dark:text-gray-100 truncate;
}

.picker-placeholder {
  @apply text-gray-400 truncate;
}

.picker-arrow {
  @apply flex-shrink-0 ml-2;
}

.picker-columns {
  @apply flex max-h-60;
}

.picker-column {
  @apply flex-1 border-r border-gray-200 dark:border-gray-700 last:border-r-0;
}

.picker-column-header {
  @apply px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600;
}

.picker-column-options {
  @apply overflow-y-auto max-h-48;
}

.picker-options {
  @apply max-h-60 overflow-y-auto;
}

.option-icon {
  @apply flex-shrink-0 w-4 h-4 mr-3;
}

.option-content {
  @apply flex-1 min-w-0;
}

.option-label {
  @apply block font-medium truncate;
}

.option-description {
  @apply block text-xs text-gray-500 dark:text-gray-400 truncate;
}

.option-check {
  @apply flex-shrink-0 text-blue-600 dark:text-blue-400 ml-2;
}

.picker-actions {
  @apply flex justify-end gap-2 p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700;
}

.picker-action-btn {
  @apply px-3 py-1 text-sm font-medium rounded transition-colors duration-200;
}

.picker-cancel {
  @apply text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600;
}

.picker-confirm {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.picker-helper {
  @apply mt-1;
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 自定义滚动条 */
.picker-options::-webkit-scrollbar,
.picker-column-options::-webkit-scrollbar {
  width: 6px;
}

.picker-options::-webkit-scrollbar-track,
.picker-column-options::-webkit-scrollbar-track {
  background: transparent;
}

.picker-options::-webkit-scrollbar-thumb,
.picker-column-options::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.picker-options::-webkit-scrollbar-thumb:hover,
.picker-column-options::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>
