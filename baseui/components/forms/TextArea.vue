<template>
  <div class="textarea-field" :class="containerClasses">
    <!-- 标签 -->
    <label v-if="label" :for="textareaId" class="textarea-label">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- 文本域容器 -->
    <div class="textarea-container" :class="textareaContainerClasses">
      <!-- 文本域 -->
      <textarea
        :id="textareaId"
        ref="textarea"
        :value="value"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxlength"
        :minlength="minlength"
        :rows="computedRows"
        :class="textareaClasses"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @keyup="handleKeyup"
        @scroll="handleScroll"
      ></textarea>

      <!-- 调整大小手柄 -->
      <div v-if="resizable && !autoResize" class="resize-handle">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z" />
        </svg>
      </div>
    </div>

    <!-- 字符计数和帮助文本 -->
    <div v-if="showCount || helperText || errorMessage" class="textarea-footer">
      <!-- 帮助文本或错误信息 -->
      <div v-if="helperText || errorMessage" class="textarea-helper">
        <span :class="helperTextClasses">
          {{ errorMessage || helperText }}
        </span>
      </div>
      
      <!-- 字符计数 -->
      <div v-if="showCount" class="textarea-count">
        <span :class="countClasses">
          {{ characterCount }}{{ maxlength ? ` / ${maxlength}` : '' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

let textareaIdCounter = 0

export default Vue.extend({
  name: 'TextArea',
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
      default: ''
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
    showCount: {
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
    rows: {
      type: Number,
      default: 4
    },
    minRows: {
      type: Number,
      default: 2
    },
    maxRows: {
      type: Number,
      default: 10
    },
    autoResize: {
      type: Boolean,
      default: false
    },
    resizable: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
    }
  },
  data() {
    return {
      textareaId: `textarea-${++textareaIdCounter}`,
      focused: false,
      currentRows: this.rows
    }
  },
  computed: {
    hasError(): boolean {
      return !!this.errorMessage
    },
    
    characterCount(): number {
      return (this.value || '').length
    },
    
    computedRows(): number {
      if (this.autoResize) {
        return this.currentRows
      }
      return this.rows
    },
    
    containerClasses(): string[] {
      const classes = ['space-y-1']
      
      if (this.disabled) {
        classes.push('opacity-50')
      }
      
      return classes
    },
    
    textareaContainerClasses(): string[] {
      const classes = [
        'relative',
        'border',
        'rounded-md',
        'transition-colors',
        'duration-200'
      ]

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
    
    textareaClasses(): string[] {
      const classes = [
        'w-full',
        'border-0',
        'bg-transparent',
        'outline-none',
        'placeholder-gray-400',
        'text-gray-900',
        'resize-none'
      ]

      // 尺寸
      switch (this.size) {
        case 'sm':
          classes.push('px-3', 'py-2', 'text-sm')
          break
        case 'lg':
          classes.push('px-4', 'py-3', 'text-base')
          break
        default:
          classes.push('px-3', 'py-2', 'text-sm')
          break
      }

      // 调整大小
      if (this.resizable && !this.autoResize) {
        classes.push('resize-y')
      }

      if (this.disabled || this.readonly) {
        classes.push('cursor-not-allowed')
      }

      return classes
    },
    
    helperTextClasses(): string[] {
      const classes = ['text-xs']
      
      if (this.hasError) {
        classes.push('text-red-600')
      } else {
        classes.push('text-gray-500')
      }
      
      return classes
    },
    
    countClasses(): string[] {
      const classes = ['text-xs']
      
      if (this.maxlength && this.characterCount > this.maxlength * 0.9) {
        classes.push('text-yellow-600')
      } else if (this.maxlength && this.characterCount >= this.maxlength) {
        classes.push('text-red-600')
      } else {
        classes.push('text-gray-500')
      }
      
      return classes
    }
  },
  watch: {
    value() {
      if (this.autoResize) {
        this.$nextTick(() => {
          this.adjustHeight()
        })
      }
    }
  },
  mounted() {
    if (this.autoResize) {
      this.adjustHeight()
    }
  },
  methods: {
    handleInput(event: Event) {
      const target = event.target as HTMLTextAreaElement
      this.$emit('input', target.value)
    },
    
    handleChange(event: Event) {
      const target = event.target as HTMLTextAreaElement
      this.$emit('change', target.value)
    },
    
    handleFocus(event: Event) {
      this.focused = true
      this.$emit('focus', event)
    },
    
    handleBlur(event: Event) {
      this.focused = false
      this.$emit('blur', event)
    },
    
    handleKeydown(event: KeyboardEvent) {
      this.$emit('keydown', event)
      
      // 处理 Tab 键插入
      if (event.key === 'Tab' && !event.shiftKey && !event.ctrlKey && !event.altKey) {
        // 可以在这里添加 Tab 键插入逻辑
      }
    },
    
    handleKeyup(event: KeyboardEvent) {
      this.$emit('keyup', event)
      
      if (this.autoResize) {
        this.adjustHeight()
      }
    },
    
    handleScroll(event: Event) {
      this.$emit('scroll', event)
    },
    
    adjustHeight() {
      const textarea = this.$refs.textarea as HTMLTextAreaElement
      if (!textarea) return
      
      // 重置高度以获取正确的 scrollHeight
      textarea.style.height = 'auto'
      
      // 计算行数
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight)
      const padding = parseInt(getComputedStyle(textarea).paddingTop) + parseInt(getComputedStyle(textarea).paddingBottom)
      const scrollHeight = textarea.scrollHeight - padding
      const lines = Math.ceil(scrollHeight / lineHeight)
      
      // 限制在最小和最大行数之间
      const clampedLines = Math.max(this.minRows, Math.min(this.maxRows, lines))
      this.currentRows = clampedLines
      
      // 设置高度
      const height = clampedLines * lineHeight + padding
      textarea.style.height = `${height}px`
    },
    
    focus() {
      this.$nextTick(() => {
        if (this.$refs.textarea) {
          (this.$refs.textarea as HTMLTextAreaElement).focus()
        }
      })
    },
    
    blur() {
      if (this.$refs.textarea) {
        (this.$refs.textarea as HTMLTextAreaElement).blur()
      }
    },
    
    insertText(text: string) {
      const textarea = this.$refs.textarea as HTMLTextAreaElement
      if (!textarea) return
      
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const value = this.value || ''
      
      const newValue = value.substring(0, start) + text + value.substring(end)
      this.$emit('input', newValue)
      
      this.$nextTick(() => {
        textarea.setSelectionRange(start + text.length, start + text.length)
      })
    }
  }
})
</script>

<style scoped>
.textarea-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.textarea-container {
  position: relative;
}

.resize-handle {
  @apply absolute bottom-1 right-1 w-4 h-4 text-gray-400 pointer-events-none;
}

.textarea-footer {
  @apply flex items-center justify-between mt-1;
}

.textarea-helper {
  @apply flex-1;
}

.textarea-count {
  @apply flex-shrink-0 ml-2;
}

/* 自定义滚动条 */
textarea::-webkit-scrollbar {
  width: 8px;
}

textarea::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

/* 深色模式 */
.dark textarea::-webkit-scrollbar-thumb {
  background: rgba(107, 114, 128, 0.5);
}

.dark textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.7);
}
</style>
