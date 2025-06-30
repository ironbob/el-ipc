<template>
  <div class="text-field" :class="containerClasses">
    <!-- 标签 -->
    <label v-if="label" :for="inputId" class="text-field-label">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- 输入框容器 -->
    <div class="text-field-container" :class="inputContainerClasses">
      <!-- 前缀图标 -->
      <span v-if="prefixIcon" class="text-field-prefix">
        <component :is="prefixIcon" class="w-5 h-5" />
      </span>

      <!-- 输入框 */
      <input
        :id="inputId"
        ref="input"
        :type="inputType"
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
        @keypress="handleKeypress"
      />

      <!-- 后缀图标 -->
      <span v-if="suffixIcon || showPasswordToggle" class="text-field-suffix">
        <!-- 密码显示切换 -->
        <button
          v-if="showPasswordToggle"
          type="button"
          class="password-toggle"
          @click="togglePasswordVisibility"
        >
          <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
          </svg>
        </button>
        
        <!-- 自定义后缀图标 -->
        <component v-else-if="suffixIcon" :is="suffixIcon" class="w-5 h-5" />
      </span>

      <!-- 清除按钮 -->
      <button
        v-if="clearable && value && !disabled && !readonly"
        type="button"
        class="text-field-clear"
        @click="handleClear"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- 帮助文本或错误信息 -->
    <div v-if="helperText || errorMessage" class="text-field-helper">
      <span :class="helperTextClasses">
        {{ errorMessage || helperText }}
      </span>
    </div>

    <!-- 字符计数 -->
    <div v-if="showCount && maxlength" class="text-field-count">
      <span :class="countClasses">
        {{ (value || '').length }} / {{ maxlength }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

let inputIdCounter = 0

export default Vue.extend({
  name: 'TextField',
  props: {
    value: {
      type: [String, Number],
      default: ''
    },
    type: {
      type: String,
      default: 'text',
      validator: (value: string) => [
        'text', 'password', 'email', 'number', 'tel', 'url', 'search'
      ].includes(value)
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
    clearable: {
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
    autocomplete: {
      type: String,
      default: 'off'
    },
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
    },
    prefixIcon: {
      type: [String, Object],
      default: null
    },
    suffixIcon: {
      type: [String, Object],
      default: null
    }
  },
  data() {
    return {
      inputId: `text-field-${++inputIdCounter}`,
      showPassword: false,
      focused: false
    }
  },
  computed: {
    inputType(): string {
      if (this.type === 'password') {
        return this.showPassword ? 'text' : 'password'
      }
      return this.type
    },
    showPasswordToggle(): boolean {
      return this.type === 'password'
    },
    hasError(): boolean {
      return !!this.errorMessage
    },
    containerClasses(): string[] {
      const classes = ['space-y-1']
      
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
      const length = (this.value || '').length
      
      if (this.maxlength && length > this.maxlength * 0.9) {
        classes.push('text-yellow-600')
      } else if (this.maxlength && length >= this.maxlength) {
        classes.push('text-red-600')
      } else {
        classes.push('text-gray-500')
      }
      
      return classes
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
      this.focused = false
      this.$emit('blur', event)
    },
    handleKeydown(event: KeyboardEvent) {
      this.$emit('keydown', event)
    },
    handleKeyup(event: KeyboardEvent) {
      this.$emit('keyup', event)
    },
    handleKeypress(event: KeyboardEvent) {
      this.$emit('keypress', event)
    },
    handleClear() {
      this.$emit('input', '')
      this.$emit('clear')
      this.focus()
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
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
  }
})
</script>

<style scoped>
.text-field-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.text-field-prefix,
.text-field-suffix {
  @apply flex items-center justify-center px-3 text-gray-400;
}

.text-field-clear,
.password-toggle {
  @apply flex items-center justify-center p-1 text-gray-400 hover:text-gray-600 rounded transition-colors duration-200;
}

.text-field-clear {
  @apply absolute right-2;
}

.text-field-helper {
  @apply mt-1;
}

.text-field-count {
  @apply mt-1 text-right;
}
</style>
