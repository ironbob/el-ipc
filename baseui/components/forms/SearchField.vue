<template>
  <div class="search-field" :class="containerClasses">
    <!-- 标签 -->
    <label v-if="label" :for="inputId" class="search-field-label">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- 搜索框容器 -->
    <div class="search-field-container" :class="inputContainerClasses">
      <!-- 搜索图标 -->
      <span class="search-icon">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </span>

      <!-- 输入框 -->
      <input
        :id="inputId"
        ref="input"
        type="search"
        :value="value"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxlength"
        :minlength="minlength"
        :autocomplete="autocomplete"
        :class="inputClasses"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @keyup="handleKeyup"
        @search="handleSearch"
      />

      <!-- 加载指示器 -->
      <span v-if="loading" class="search-loading">
        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </span>

      <!-- 清除按钮 -->
      <button
        v-if="clearable && value && !disabled && !readonly && !loading"
        type="button"
        class="search-clear"
        @click="handleClear"
        title="清除搜索"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- 搜索按钮 -->
      <button
        v-if="showSearchButton"
        type="button"
        class="search-button"
        @click="handleSearchClick"
        :disabled="disabled || loading"
        title="搜索"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </div>

    <!-- 搜索建议 -->
    <div
      v-if="showSuggestions && suggestions.length > 0"
      class="search-suggestions"
      :class="suggestionsClasses"
    >
      <div
        v-for="(suggestion, index) in suggestions"
        :key="index"
        :class="getSuggestionClasses(suggestion, index)"
        @click="selectSuggestion(suggestion, index)"
        @mouseenter="highlightedIndex = index"
      >
        <!-- 建议图标 -->
        <span v-if="suggestion.icon" class="suggestion-icon">
          <component :is="suggestion.icon" />
        </span>
        
        <!-- 建议文本 -->
        <span class="suggestion-text">
          <span v-if="suggestion.title" class="suggestion-title">{{ suggestion.title }}</span>
          <span v-if="suggestion.description" class="suggestion-description">{{ suggestion.description }}</span>
        </span>
        
        <!-- 建议类型 -->
        <span v-if="suggestion.type" class="suggestion-type">{{ suggestion.type }}</span>
      </div>
    </div>

    <!-- 帮助文本或错误信息 -->
    <div v-if="helperText || errorMessage" class="search-field-helper">
      <span :class="helperTextClasses">
        {{ errorMessage || helperText }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

let inputIdCounter = 0

interface SearchSuggestion {
  title: string
  description?: string
  value: any
  icon?: any
  type?: string
}

export default Vue.extend({
  name: 'SearchField',
  props: {
    value: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '搜索...'
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
    clearable: {
      type: Boolean,
      default: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    maxlength: {
      type: Number,
      default: null
    },
    minlength: {
      type: Number,
      default: null
    },
    autocomplete: {
      type: String,
      default: 'off'
    },
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
    },
    showSearchButton: {
      type: Boolean,
      default: false
    },
    suggestions: {
      type: Array as () => SearchSuggestion[],
      default: () => []
    },
    showSuggestions: {
      type: Boolean,
      default: false
    },
    debounce: {
      type: Number,
      default: 300
    }
  },
  data() {
    return {
      inputId: `search-field-${++inputIdCounter}`,
      focused: false,
      highlightedIndex: -1,
      debounceTimer: null as number | null
    }
  },
  computed: {
    hasError(): boolean {
      return !!this.errorMessage
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
      } else if (this.focused) {
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

      if (this.disabled || this.readonly) {
        classes.push('cursor-not-allowed')
      }

      return classes
    },
    
    suggestionsClasses(): string[] {
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
    value(newValue) {
      if (this.debounce > 0) {
        this.debouncedSearch(newValue)
      } else {
        this.$emit('search', newValue)
      }
    },
    
    showSuggestions(newValue) {
      if (!newValue) {
        this.highlightedIndex = -1
      }
    }
  },
  methods: {
    handleInput(event: Event) {
      const target = event.target as HTMLInputElement
      this.$emit('input', target.value)
    },
    
    handleChange(event: Event) {
      const target = event.target as HTMLInputElement
      this.$emit('change', target.value)
    },
    
    handleFocus(event: Event) {
      this.focused = true
      this.$emit('focus', event)
    },
    
    handleBlur(event: Event) {
      // 延迟失焦以允许点击建议
      setTimeout(() => {
        this.focused = false
        this.$emit('blur', event)
      }, 150)
    },
    
    handleKeydown(event: KeyboardEvent) {
      if (this.showSuggestions && this.suggestions.length > 0) {
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault()
            this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.suggestions.length - 1)
            break
          case 'ArrowUp':
            event.preventDefault()
            this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1)
            break
          case 'Enter':
            event.preventDefault()
            if (this.highlightedIndex >= 0) {
              this.selectSuggestion(this.suggestions[this.highlightedIndex], this.highlightedIndex)
            } else {
              this.handleSearchClick()
            }
            break
          case 'Escape':
            this.highlightedIndex = -1
            this.$emit('escape')
            break
        }
      } else if (event.key === 'Enter') {
        this.handleSearchClick()
      }
      
      this.$emit('keydown', event)
    },
    
    handleKeyup(event: KeyboardEvent) {
      this.$emit('keyup', event)
    },
    
    handleSearch(event: Event) {
      this.$emit('search', this.value)
    },
    
    handleClear() {
      this.$emit('input', '')
      this.$emit('clear')
      this.focus()
    },
    
    handleSearchClick() {
      this.$emit('search', this.value)
      this.$emit('search-click', this.value)
    },
    
    selectSuggestion(suggestion: SearchSuggestion, index: number) {
      this.$emit('input', suggestion.title)
      this.$emit('suggestion-select', suggestion, index)
      this.highlightedIndex = -1
      this.focus()
    },
    
    getSuggestionClasses(suggestion: SearchSuggestion, index: number): string[] {
      const classes = [
        'flex',
        'items-center',
        'px-3',
        'py-2',
        'cursor-pointer',
        'transition-colors',
        'duration-200'
      ]
      
      if (index === this.highlightedIndex) {
        classes.push('bg-blue-50', 'dark:bg-blue-900/30', 'text-blue-700', 'dark:text-blue-300')
      } else {
        classes.push('text-gray-900', 'dark:text-gray-100', 'hover:bg-gray-50', 'dark:hover:bg-gray-700')
      }
      
      return classes
    },
    
    debouncedSearch(value: string) {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }
      
      this.debounceTimer = window.setTimeout(() => {
        this.$emit('search', value)
      }, this.debounce)
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
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
  }
})
</script>

<style scoped>
.search-field-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.search-icon {
  @apply flex items-center justify-center px-3 text-gray-400;
}

.search-loading {
  @apply flex items-center justify-center px-3 text-gray-400;
}

.search-clear,
.search-button {
  @apply flex items-center justify-center p-1 text-gray-400 hover:text-gray-600 rounded transition-colors duration-200 mr-2;
}

.search-button {
  @apply bg-blue-600 text-white hover:bg-blue-700 px-2;
}

.search-suggestions {
  animation: slideDown 0.2s ease-out;
}

.suggestion-icon {
  @apply flex-shrink-0 w-4 h-4 mr-3;
}

.suggestion-text {
  @apply flex-1 min-w-0;
}

.suggestion-title {
  @apply block font-medium truncate;
}

.suggestion-description {
  @apply block text-xs text-gray-500 dark:text-gray-400 truncate;
}

.suggestion-type {
  @apply flex-shrink-0 text-xs text-gray-400 dark:text-gray-500 ml-2;
}

.search-field-helper {
  @apply mt-1;
}

/* 动画 */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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

/* 自定义滚动条 */
.search-suggestions::-webkit-scrollbar {
  width: 6px;
}

.search-suggestions::-webkit-scrollbar-track {
  background: transparent;
}

.search-suggestions::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.search-suggestions::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>
