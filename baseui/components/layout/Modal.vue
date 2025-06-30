<template>
  <teleport to="body">
    <transition
      name="modal"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @leave="onLeave"
      @after-leave="onAfterLeave"
    >
      <div
        v-if="open"
        :class="overlayClasses"
        @click="handleOverlayClick"
        @keydown.esc="handleEscape"
        tabindex="-1"
        ref="overlay"
      >
        <div
          :class="modalClasses"
          :style="modalStyle"
          @click.stop
          ref="modal"
          role="dialog"
          :aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="descriptionId"
        >
          <!-- 头部 -->
          <div v-if="$slots.header || title || closable" :class="headerClasses">
            <slot name="header">
              <div class="modal-title-section">
                <h2 v-if="title" :id="titleId" class="modal-title">{{ title }}</h2>
                <p v-if="description" :id="descriptionId" class="modal-description">{{ description }}</p>
              </div>
            </slot>
            
            <!-- 关闭按钮 -->
            <button
              v-if="closable"
              class="modal-close"
              @click="handleClose"
              :title="closeButtonTitle"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- 内容 -->
          <div :class="contentClasses">
            <slot />
          </div>
          
          <!-- 底部 -->
          <div v-if="$slots.footer" :class="footerClasses">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
import Vue from 'vue'

let modalIdCounter = 0

export default Vue.extend({
  name: 'Modal',
  props: {
    open: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'].includes(value)
    },
    closable: {
      type: Boolean,
      default: true
    },
    closeOnOverlay: {
      type: Boolean,
      default: true
    },
    closeOnEscape: {
      type: Boolean,
      default: true
    },
    closeButtonTitle: {
      type: String,
      default: '关闭'
    },
    centered: {
      type: Boolean,
      default: true
    },
    scrollable: {
      type: Boolean,
      default: true
    },
    persistent: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modalId: ++modalIdCounter,
      previousActiveElement: null as HTMLElement | null
    }
  },
  computed: {
    titleId(): string {
      return `modal-title-${this.modalId}`
    },
    
    descriptionId(): string {
      return `modal-description-${this.modalId}`
    },
    
    overlayClasses(): string[] {
      const classes = [
        'modal-overlay',
        'fixed',
        'inset-0',
        'z-50',
        'flex',
        'overflow-auto',
        'bg-black',
        'bg-opacity-50',
        'backdrop-blur-sm'
      ]
      
      if (this.centered) {
        classes.push('items-center', 'justify-center')
      } else {
        classes.push('items-start', 'justify-center', 'pt-16')
      }
      
      return classes
    },
    
    modalClasses(): string[] {
      const classes = [
        'modal',
        'relative',
        'bg-white',
        'dark:bg-gray-800',
        'rounded-lg',
        'shadow-xl',
        'flex',
        'flex-col',
        'max-h-full',
        'mx-4',
        'my-4'
      ]
      
      if (this.scrollable) {
        classes.push('overflow-hidden')
      }
      
      return classes
    },
    
    modalStyle(): Record<string, string> {
      const sizeMap = {
        xs: '320px',
        sm: '384px',
        md: '448px',
        lg: '512px',
        xl: '576px',
        '2xl': '672px',
        full: 'calc(100vw - 2rem)'
      }
      
      const width = sizeMap[this.size as keyof typeof sizeMap] || sizeMap.md
      
      return {
        width,
        maxWidth: this.size === 'full' ? 'none' : '90vw'
      }
    },
    
    headerClasses(): string[] {
      const classes = ['modal-header', 'flex', 'items-start', 'justify-between', 'p-6', 'pb-0']
      
      if (this.$slots.default || this.$slots.footer) {
        classes.push('border-b', 'border-gray-200', 'dark:border-gray-700', 'pb-4')
      }
      
      return classes
    },
    
    contentClasses(): string[] {
      const classes = ['modal-content', 'flex-1', 'p-6']
      
      if (this.scrollable) {
        classes.push('overflow-auto')
      }
      
      if (this.$slots.header || this.title) {
        classes.push('pt-4')
      }
      
      return classes
    },
    
    footerClasses(): string[] {
      return [
        'modal-footer',
        'flex',
        'items-center',
        'justify-end',
        'gap-3',
        'p-6',
        'pt-0',
        'border-t',
        'border-gray-200',
        'dark:border-gray-700'
      ]
    }
  },
  watch: {
    open(newValue) {
      if (newValue) {
        this.openModal()
      } else {
        this.closeModal()
      }
    }
  },
  mounted() {
    if (this.open) {
      this.openModal()
    }
  },
  beforeDestroy() {
    this.closeModal()
  },
  methods: {
    openModal() {
      this.previousActiveElement = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'
      
      this.$nextTick(() => {
        if (this.$refs.modal) {
          (this.$refs.modal as HTMLElement).focus()
        }
      })
      
      this.$emit('open')
    },
    
    closeModal() {
      document.body.style.overflow = ''
      
      if (this.previousActiveElement) {
        this.previousActiveElement.focus()
        this.previousActiveElement = null
      }
      
      this.$emit('close')
    },
    
    handleClose() {
      if (!this.persistent) {
        this.$emit('update:open', false)
        this.$emit('close')
      }
    },
    
    handleOverlayClick() {
      if (this.closeOnOverlay && !this.persistent) {
        this.handleClose()
      }
    },
    
    handleEscape() {
      if (this.closeOnEscape && !this.persistent) {
        this.handleClose()
      }
    },
    
    onEnter() {
      this.$emit('enter')
    },
    
    onAfterEnter() {
      this.$emit('after-enter')
    },
    
    onLeave() {
      this.$emit('leave')
    },
    
    onAfterLeave() {
      this.$emit('after-leave')
    }
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.modal {
  outline: none;
}

.modal-title-section {
  @apply flex-1 min-w-0;
}

.modal-title {
  @apply text-lg font-semibold text-gray-900 dark:text-gray-100 m-0;
}

.modal-description {
  @apply text-sm text-gray-600 dark:text-gray-400 mt-1 m-0;
}

.modal-close {
  @apply flex-shrink-0 p-1 ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors duration-200;
}

/* 动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.95) translateY(-20px);
}

/* 自定义滚动条 */
.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: transparent;
}

.modal-content::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>
