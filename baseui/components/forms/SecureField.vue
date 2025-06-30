<template>
  <div class="secure-field" :class="containerClasses">
    <!-- 标签 -->
    <label v-if="label" :for="inputId" class="secure-field-label">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- 输入框容器 -->
    <div class="secure-field-container" :class="inputContainerClasses">
      <!-- 前缀图标 -->
      <span v-if="prefixIcon" class="secure-field-prefix">
        <component :is="prefixIcon" class="w-5 h-5" />
      </span>

      <!-- 输入框 -->
      <input
        :id="inputId"
        ref="input"
        :type="showPassword ? 'text' : 'password'"
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
        @paste="handlePaste"
      />

      <!-- 密码强度指示器 -->
      <div v-if="showStrength && value" class="password-strength">
        <div :class="strengthClasses">
          <div :class="strengthBarClasses" :style="strengthBarStyle"></div>
        </div>
      </div>

      <!-- 显示/隐藏密码按钮 -->
      <button
        v-if="toggleable"
        type="button"
        class="password-toggle"
        @click="togglePasswordVisibility"
        :title="showPassword ? '隐藏密码' : '显示密码'"
      >
        <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>

      <!-- 生成密码按钮 -->
      <button
        v-if="generator"
        type="button"
        class="password-generator"
        @click="generatePassword"
        title="生成密码"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- 密码强度文本 -->
    <div v-if="showStrength && value" class="strength-text">
      <span :class="strengthTextClasses">
        密码强度: {{ strengthText }}
      </span>
    </div>

    <!-- 帮助文本或错误信息 -->
    <div v-if="helperText || errorMessage" class="secure-field-helper">
      <span :class="helperTextClasses">
        {{ errorMessage || helperText }}
      </span>
    </div>

    <!-- 密码要求 -->
    <div v-if="showRequirements && requirements.length > 0" class="password-requirements">
      <ul class="requirements-list">
        <li
          v-for="(requirement, index) in requirements"
          :key="index"
          :class="getRequirementClasses(requirement)"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="requirement.met" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {{ requirement.text }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

let inputIdCounter = 0

interface PasswordRequirement {
  text: string
  test: (password: string) => boolean
  met: boolean
}

export default Vue.extend({
  name: 'SecureField',
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
      default: 'current-password'
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
    toggleable: {
      type: Boolean,
      default: true
    },
    showStrength: {
      type: Boolean,
      default: false
    },
    showRequirements: {
      type: Boolean,
      default: false
    },
    generator: {
      type: Boolean,
      default: false
    },
    generatorOptions: {
      type: Object,
      default: () => ({
        length: 12,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeSimilar: true
      })
    }
  },
  data() {
    return {
      inputId: `secure-field-${++inputIdCounter}`,
      showPassword: false,
      focused: false
    }
  },
  computed: {
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
    
    passwordStrength(): number {
      if (!this.value) return 0
      
      let score = 0
      const password = this.value
      
      // 长度
      if (password.length >= 8) score += 1
      if (password.length >= 12) score += 1
      
      // 字符类型
      if (/[a-z]/.test(password)) score += 1
      if (/[A-Z]/.test(password)) score += 1
      if (/[0-9]/.test(password)) score += 1
      if (/[^A-Za-z0-9]/.test(password)) score += 1
      
      // 复杂性
      if (password.length >= 16) score += 1
      if (/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(password)) score += 1
      
      return Math.min(score, 5)
    },
    
    strengthText(): string {
      const texts = ['很弱', '弱', '一般', '强', '很强']
      return texts[Math.max(0, this.passwordStrength - 1)] || '很弱'
    },
    
    strengthClasses(): string[] {
      return ['strength-bar-container', 'w-full', 'h-1', 'bg-gray-200', 'rounded-full', 'overflow-hidden']
    },
    
    strengthBarClasses(): string[] {
      const classes = ['strength-bar', 'h-full', 'transition-all', 'duration-300']
      
      switch (this.passwordStrength) {
        case 1:
        case 2:
          classes.push('bg-red-500')
          break
        case 3:
          classes.push('bg-yellow-500')
          break
        case 4:
        case 5:
          classes.push('bg-green-500')
          break
        default:
          classes.push('bg-gray-300')
          break
      }
      
      return classes
    },
    
    strengthBarStyle(): Record<string, string> {
      return {
        width: `${(this.passwordStrength / 5) * 100}%`
      }
    },
    
    strengthTextClasses(): string[] {
      const classes = ['text-xs', 'font-medium']
      
      switch (this.passwordStrength) {
        case 1:
        case 2:
          classes.push('text-red-600')
          break
        case 3:
          classes.push('text-yellow-600')
          break
        case 4:
        case 5:
          classes.push('text-green-600')
          break
        default:
          classes.push('text-gray-500')
          break
      }
      
      return classes
    },
    
    requirements(): PasswordRequirement[] {
      const reqs: PasswordRequirement[] = [
        {
          text: '至少8个字符',
          test: (pwd: string) => pwd.length >= 8,
          met: false
        },
        {
          text: '包含大写字母',
          test: (pwd: string) => /[A-Z]/.test(pwd),
          met: false
        },
        {
          text: '包含小写字母',
          test: (pwd: string) => /[a-z]/.test(pwd),
          met: false
        },
        {
          text: '包含数字',
          test: (pwd: string) => /[0-9]/.test(pwd),
          met: false
        },
        {
          text: '包含特殊字符',
          test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd),
          met: false
        }
      ]
      
      return reqs.map(req => ({
        ...req,
        met: req.test(this.value)
      }))
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
    
    handlePaste(event: ClipboardEvent) {
      this.$emit('paste', event)
    },
    
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    },
    
    generatePassword() {
      const options = this.generatorOptions
      let charset = ''
      
      if (options.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
      if (options.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      if (options.includeNumbers) charset += '0123456789'
      if (options.includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
      
      if (options.excludeSimilar) {
        charset = charset.replace(/[il1Lo0O]/g, '')
      }
      
      let password = ''
      for (let i = 0; i < options.length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length))
      }
      
      this.$emit('input', password)
      this.$emit('generate', password)
    },
    
    getRequirementClasses(requirement: PasswordRequirement): string[] {
      const classes = ['flex', 'items-center', 'text-xs']
      
      if (requirement.met) {
        classes.push('text-green-600')
      } else {
        classes.push('text-gray-500')
      }
      
      return classes
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
.secure-field-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.secure-field-prefix {
  @apply flex items-center justify-center px-3 text-gray-400;
}

.password-toggle,
.password-generator {
  @apply flex items-center justify-center p-1 text-gray-400 hover:text-gray-600 rounded transition-colors duration-200 mr-2;
}

.password-strength {
  @apply absolute bottom-0 left-0 right-0 px-3 pb-1;
}

.strength-text {
  @apply mt-1;
}

.password-requirements {
  @apply mt-2;
}

.requirements-list {
  @apply space-y-1 list-none p-0 m-0;
}

.secure-field-helper {
  @apply mt-1;
}
</style>
