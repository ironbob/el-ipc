<template>
  <div class="combobox" :class="containerClasses">
    <!-- 标签 -->
    <label v-if="label" :for="inputId" class="combobox-label">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- 组合框容器 -->
    <div class="combobox-container" :class="inputContainerClasses" ref="container">
      <!-- 输入框 -->
      <input
        :id="inputId"
        ref="input"
        :type="searchable ? 'text' : 'button'"
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="!searchable || readonly"
        :required="required"
        :class="inputClasses"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @click="handleInputClick"
      />

      <!-- 下拉箭头 -->
      <button
        type="button"
        class="combobox-trigger"
        @click="toggleDropdown"
        :disabled="disabled"
        :aria-expanded="isOpen"
        :aria-haspopup="true"
      >
        <svg :class="triggerIconClasses" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- 下拉选项 -->
      <transition name="dropdown">
        <div
          v-if="isOpen"
          class="combobox-dropdown"
          :class="dropdownClasses"
          ref="dropdown"
        >
          <!-- 搜索结果为空 -->
          <div v-if="filteredOptions.length === 0" class="combobox-empty">
            <span class="text-gray-500 dark:text-gray-400">{{ emptyText }}</span>
          </div>

          <!-- 选项列表 -->
          <div
            v-for="(option, index) in filteredOptions"
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
      </transition>
    </div>

    <!-- 帮助文本或错误信息 -->
    <div v-if="helperText || errorMessage" class="combobox-helper">
      <span :class="helperTextClasses">
        {{ errorMessage || helperText }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

let inputIdCounter = 0

interface ComboBoxOption {
  label?: string
  value: any
  description?: string
  icon?: any
  disabled?: boolean
  [key: string]: any
}

export default Vue.extend({
  name: 'ComboBox',
  props: {
    value: {
      type: null,
      default: null
    },
    options: {
      type: Array as () => ComboBoxOption[],
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
    readonly: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    searchable: {
      type: Boolean,
      default: true
    },
    clearable: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
    },
    labelKey: {
      type: String,
      default: 'label'
    },
    valueKey: {
      type: String,
      default: 'value'
    },
    emptyText: {
      type: String,
      default: '暂无数据'
    },
    filterMethod: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      inputId: `combobox-${++inputIdCounter}`,
      isOpen: false,
      focused: false,
      highlightedIndex: -1,
      searchQuery: ''
    }
  },
  computed: {
    hasError(): boolean {
      return !!this.errorMessage
    },
    
    selectedOption(): ComboBoxOption | null {
      return this.options.find(option => this.getOptionValue(option) === this.value) || null
    },
    
    displayValue(): string {
      if (this.searchable && this.focused && this.isOpen) {
        return this.searchQuery
      }
      return this.selectedOption ? this.getOptionLabel(this.selectedOption) : ''
    },
    
    filteredOptions(): ComboBoxOption[] {
      if (!this.searchable || !this.searchQuery) {
        return this.options
      }
      
      if (this.filterMethod) {
        return this.filterMethod(this.options, this.searchQuery)
      }
      
      const query = this.searchQuery.toLowerCase()
      return this.options.filter(option => {
        const label = this.getOptionLabel(option).toLowerCase()
        const description = option.description?.toLowerCase() || ''
        return label.includes(query) || description.includes(query)
      })
    },
    
    containerClasses(): string[] {
      const classes = ['space-y-1', 'relative']
      
      if (this.disabled) {
        classes.push('opacity-50')
      }
      
      return classes
    },
    
    inputContainerClasses(): string[] {
      const classes = [
        'relative',
        'flex',
        'items-center',
        'border',
        'rounded-md',
        'transition-colors',
        'duration-200'
      ]

      // 尺寸
      switch (this.size) {
        case 'sm':
          classes.push('min-h-8')
          break
        case 'lg':
          classes.push('min-h-12')
          break
        default:
          classes.push('min-h-10')
          break
      }

      // 状态样式
      if (this.hasError) {
        classes.push('border-red-300', 'focus-within:border-red-500', 'focus-within:ring-red-500')
      } else if (this.focused || this.isOpen) {
        classes.push('border-blue-300', 'ring-1', 'ring-blue-500')
      } else {
        classes.push('border-gray-300', 'focus-within:border-blue-500', 'focus-within:ring-1', 'focus-within:ring-blue-500')
      }

      if (this.disabled) {
        classes.push('bg-gray-50', 'cursor-not-allowed')
      } else {
        classes.push('bg-white', 'hover:border-gray-400')
      }

      return classes
    },
    
    inputClasses(): string[] {
      const classes = [
        'flex-1',
        'border-0',
        'bg-transparent',
        'outline-none',
        'placeholder-gray-400',
        'text-gray-900'
      ]

      // 尺寸
      switch (this.size) {
        case 'sm':
          classes.push('px-3', 'py-1.5', 'text-sm')
          break
        case 'lg':
          classes.push('px-4', 'py-3', 'text-base')
          break
        default:
          classes.push('px-3', 'py-2', 'text-sm')
          break
      }

      if (!this.searchable) {
        classes.push('cursor-pointer')
      }

      if (this.disabled || this.readonly) {
        classes.push('cursor-not-allowed')
      }

      return classes
    },
    
    triggerIconClasses(): string[] {
      const classes = ['w-4', 'h-4', 'transition-transform', 'duration-200']
      
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
        'max-h-60',
        'overflow-auto'
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
        this.highlightedIndex = this.selectedOption ? this.filteredOptions.indexOf(this.selectedOption) : -1
        this.$nextTick(() => {
          this.addClickOutsideListener()
        })
      } else {
        this.removeClickOutsideListener()
        this.searchQuery = ''
      }
    }
  },
  methods: {
    getOptionLabel(option: ComboBoxOption): string {
      return option[this.labelKey] || String(option.value || option)
    },
    
    getOptionValue(option: ComboBoxOption): any {
      return option[this.valueKey] !== undefined ? option[this.valueKey] : option.value
    },
    
    getOptionKey(option: ComboBoxOption, index: number): string {
      return `${this.getOptionValue(option)}-${index}`
    },
    
    isSelected(option: ComboBoxOption): boolean {
      return this.getOptionValue(option) === this.value
    },
    
    getOptionClasses(option: ComboBoxOption, index: number): string[] {
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
    
    handleInput(event: Event) {
      if (!this.searchable) return
      
      const target = event.target as HTMLInputElement
      this.searchQuery = target.value
      
      if (!this.isOpen) {
        this.isOpen = true
      }
      
      this.highlightedIndex = -1
    },
    
    handleFocus(event: Event) {
      this.focused = true
      this.$emit('focus', event)
    },
    
    handleBlur(event: Event) {
      this.focused = false
      this.$emit('blur', event)
    },
    
    handleInputClick() {
      if (!this.disabled && !this.readonly) {
        this.toggleDropdown()
      }
    },
    
    handleKeydown(event: KeyboardEvent) {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          if (!this.isOpen) {
            this.isOpen = true
          } else {
            this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.filteredOptions.length - 1)
          }
          break
        case 'ArrowUp':
          event.preventDefault()
          if (this.isOpen) {
            this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1)
          }
          break
        case 'Enter':
          event.preventDefault()
          if (this.isOpen && this.highlightedIndex >= 0) {
            this.selectOption(this.filteredOptions[this.highlightedIndex], this.highlightedIndex)
          } else if (!this.isOpen) {
            this.isOpen = true
          }
          break
        case 'Escape':
          this.isOpen = false
          this.searchQuery = ''
          break
        case 'Tab':
          this.isOpen = false
          break
      }
      
      this.$emit('keydown', event)
    },
    
    toggleDropdown() {
      if (!this.disabled && !this.readonly) {
        this.isOpen = !this.isOpen
      }
    },
    
    selectOption(option: ComboBoxOption, index: number) {
      if (option.disabled) return
      
      this.$emit('input', this.getOptionValue(option))
      this.$emit('change', this.getOptionValue(option), option)
      this.isOpen = false
      this.searchQuery = ''
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
    },
    
    focus() {
      this.$nextTick(() => {
        if (this.$refs.input) {
          (this.$refs.input as HTMLInputElement).focus()
        }
      })
    },
    
    blur() {
      if (this.$refs.input) {
        (this.$refs.input as HTMLInputElement).blur()
      }
    }
  },
  beforeDestroy() {
    this.removeClickOutsideListener()
  }
})
</script>

<style scoped>
.combobox-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.combobox-trigger {
  @apply flex items-center justify-center px-2 text-gray-400 hover:text-gray-600 transition-colors duration-200;
}

.combobox-empty {
  @apply px-3 py-2 text-center;
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

.combobox-helper {
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
.combobox-dropdown::-webkit-scrollbar {
  width: 6px;
}

.combobox-dropdown::-webkit-scrollbar-track {
  background: transparent;
}

.combobox-dropdown::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.combobox-dropdown::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>
