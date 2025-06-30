<!--
  InputDialog 输入对话框组件
  用于获取用户输入的模态对话框
-->

<template>
  <Dialog
    :visible="visible"
    :title="title"
    :size="size"
    :show-close-button="showCloseButton"
    :confirm-disabled="!isValid"
    :confirm-button-text="confirmButtonText"
    :cancel-button-text="cancelButtonText"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @close="handleClose"
  >
    <div class="input-dialog-content">
      <p v-if="message" class="input-dialog-message">{{ message }}</p>
      
      <div class="input-group">
        <label v-if="label" class="input-label" :for="inputId">{{ label }}</label>
        <input
          :id="inputId"
          ref="input"
          v-model="inputValue"
          :type="inputType"
          :placeholder="placeholder"
          :maxlength="maxLength"
          :required="required"
          class="input-field"
          @keydown.enter="handleEnter"
          @keydown.escape="handleCancel"
        />
        <div v-if="errorMessage" class="input-error">{{ errorMessage }}</div>
        <div v-if="helperText" class="input-helper">{{ helperText }}</div>
      </div>
    </div>
  </Dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import Dialog from './Dialog.vue'

export default Vue.extend({
  name: 'InputDialog',
  components: {
    Dialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '输入'
    },
    message: {
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
    defaultValue: {
      type: String,
      default: ''
    },
    inputType: {
      type: String,
      default: 'text',
      validator: (value: string) => ['text', 'password', 'email', 'number'].includes(value)
    },
    size: {
      type: String,
      default: 'medium'
    },
    maxLength: {
      type: Number,
      default: undefined
    },
    required: {
      type: Boolean,
      default: true
    },
    validator: {
      type: Function,
      default: null
    },
    confirmButtonText: {
      type: String,
      default: '确定'
    },
    cancelButtonText: {
      type: String,
      default: '取消'
    },
    showCloseButton: {
      type: Boolean,
      default: true
    },
    helperText: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      inputValue: '',
      errorMessage: '',
      inputId: `input-dialog-${Math.random().toString(36).substr(2, 9)}`
    }
  },
  computed: {
    isValid(): boolean {
      if (this.required && !this.inputValue.trim()) {
        return false
      }
      
      if (this.validator && typeof this.validator === 'function') {
        return this.validator(this.inputValue)
      }
      
      return true
    }
  },
  watch: {
    visible(newVal: boolean) {
      if (newVal) {
        this.inputValue = this.defaultValue
        this.errorMessage = ''
        this.$nextTick(() => {
          this.focusInput()
        })
      }
    },
    inputValue() {
      this.validateInput()
    }
  },
  methods: {
    handleConfirm() {
      if (this.isValid) {
        this.$emit('confirm', this.inputValue.trim())
      }
    },

    handleCancel() {
      this.$emit('cancel')
    },

    handleClose() {
      this.$emit('close')
    },

    handleEnter() {
      if (this.isValid) {
        this.handleConfirm()
      }
    },

    focusInput() {
      if (this.$refs.input) {
        (this.$refs.input as HTMLInputElement).focus()
        // 选中默认值
        if (this.defaultValue) {
          (this.$refs.input as HTMLInputElement).select()
        }
      }
    },

    validateInput() {
      this.errorMessage = ''
      
      if (this.required && !this.inputValue.trim()) {
        this.errorMessage = '此字段为必填项'
        return
      }
      
      if (this.validator && typeof this.validator === 'function') {
        const result = this.validator(this.inputValue)
        if (typeof result === 'string') {
          this.errorMessage = result
        } else if (result === false) {
          this.errorMessage = '输入值无效'
        }
      }
    }
  }
})
</script>

<style scoped>
.input-dialog-content {
  min-width: 0;
}

.input-dialog-message {
  margin: 0 0 16px 0;
  line-height: 1.5;
  color: var(--vscode-fg, #333333);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--vscode-fg, #333333);
  margin: 0;
}

.input-field {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--vscode-border, #e5e5e5);
  border-radius: 4px;
  background-color: var(--vscode-bg, #ffffff);
  color: var(--vscode-fg, #333333);
  font-size: 13px;
  line-height: 1.4;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.input-field:focus {
  border-color: var(--vscode-focus, #007acc);
  box-shadow: 0 0 0 1px var(--vscode-focus, #007acc);
}

.input-field::placeholder {
  color: var(--vscode-fg, #333333);
  opacity: 0.6;
}

.input-error {
  font-size: 12px;
  color: #e74c3c;
  margin: 0;
}

.input-helper {
  font-size: 12px;
  color: var(--vscode-fg, #333333);
  opacity: 0.7;
  margin: 0;
}

/* 深色主题适配 */
.dark .input-dialog-message {
  color: var(--vscode-fg, #cccccc);
}

.dark .input-label {
  color: var(--vscode-fg, #cccccc);
}

.dark .input-field {
  background-color: var(--vscode-bg, #1e1e1e);
  border-color: var(--vscode-border, #3c3c3c);
  color: var(--vscode-fg, #cccccc);
}

.dark .input-field::placeholder {
  color: var(--vscode-fg, #cccccc);
  opacity: 0.6;
}

.dark .input-helper {
  color: var(--vscode-fg, #cccccc);
}
</style>
