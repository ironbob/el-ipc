<template>
  <teleport to="body">
    <transition
      name="sheet"
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
          :class="sheetClasses"
          :style="sheetStyle"
          @click.stop
          ref="sheet"
          role="dialog"
          :aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="descriptionId"
        >
          <!-- 拖拽指示器 -->
          <div v-if="side === 'bottom' || side === 'top'" class="sheet-handle">
            <div class="handle-bar"></div>
          </div>
          
          <!-- 头部 -->
          <div v-if="$slots.header || title || closable" :class="headerClasses">
            <slot name="header">
              <div class="sheet-title-section">
                <h2 v-if="title" :id="titleId" class="sheet-title">{{ title }}</h2>
                <p v-if="description" :id="descriptionId" class="sheet-description">{{ description }}</p>
              </div>
            </slot>
            
            <!-- 关闭按钮 -->
            <button
              v-if="closable"
              class="sheet-close"
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

let sheetIdCounter = 0

export default Vue.extend({
  name: 'Sheet',
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
    side: {
      type: String,
      default: 'right',
      validator: (value: string) => ['top', 'right', 'bottom', 'left'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => ['sm', 'md', 'lg', 'xl', 'full'].includes(value)
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
      sheetId: ++sheetIdCounter,
      previousActiveElement: null as HTMLElement | null
    }
  },
  computed: {
    titleId(): string {
      return `sheet-title-${this.sheetId}`
    },
    
    descriptionId(): string {
      return `sheet-description-${this.sheetId}`
    },
    
    overlayClasses(): string[] {
      return [
        'sheet-overlay',
        'fixed',
        'inset-0',
        'z-50',
        'bg-black',
        'bg-opacity-50',
        'backdrop-blur-sm'
      ]
    },
    
    sheetClasses(): string[] {
      const classes = [
        'sheet',
        'fixed',
        'bg-white',
        'dark:bg-gray-800',
        'shadow-xl',
        'flex',
        'flex-col',
        'overflow-hidden'
      ]
      
      // 位置
      switch (this.side) {
        case 'top':
          classes.push('top-0', 'left-0', 'right-0', 'rounded-b-lg')
          break
        case 'right':
          classes.push('top-0', 'right-0', 'bottom-0', 'rounded-l-lg')
          break
        case 'bottom':
          classes.push('bottom-0', 'left-0', 'right-0', 'rounded-t-lg')
          break
        case 'left':
          classes.push('top-0', 'left-0', 'bottom-0', 'rounded-r-lg')
          break
      }
      
      return classes
    },
    
    sheetStyle(): Record<string, string> {
      const isHorizontal = this.side === 'left' || this.side === 'right'
      const sizeMap = {
        sm: isHorizontal ? '320px' : '200px',
        md: isHorizontal ? '400px' : '300px',
        lg: isHorizontal ? '500px' : '400px',
        xl: isHorizontal ? '600px' : '500px',
        full: isHorizontal ? '100vw' : '100vh'
      }
      
      const size = sizeMap[this.size as keyof typeof sizeMap] || sizeMap.md
      
      if (isHorizontal) {
        return { width: size, maxWidth: this.size === 'full' ? 'none' : '90vw' }
      } else {
        return { height: size, maxHeight: this.size === 'full' ? 'none' : '90vh' }
      }
    },
    
    headerClasses(): string[] {
      const classes = ['sheet-header', 'flex', 'items-start', 'justify-between', 'p-6', 'pb-0']
      
      if (this.$slots.default || this.$slots.footer) {
        classes.push('border-b', 'border-gray-200', 'dark:border-gray-700', 'pb-4')
      }
      
      return classes
    },
    
    contentClasses(): string[] {
      const classes = ['sheet-content', 'flex-1', 'p-6']
      
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
        'sheet-footer',
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
        this.openSheet()
      } else {
        this.closeSheet()
      }
    }
  },
  mounted() {
    if (this.open) {
      this.openSheet()
    }
  },
  beforeDestroy() {
    this.closeSheet()
  },
  methods: {
    openSheet() {
      this.previousActiveElement = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'
      
      this.$nextTick(() => {
        if (this.$refs.sheet) {
          (this.$refs.sheet as HTMLElement).focus()
        }
      })
      
      this.$emit('open')
    },
    
    closeSheet() {
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
.sheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.sheet {
  outline: none;
}

.sheet-handle {
  @apply flex justify-center py-2;
}

.handle-bar {
  @apply w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full;
}

.sheet-title-section {
  @apply flex-1 min-w-0;
}

.sheet-title {
  @apply text-lg font-semibold text-gray-900 dark:text-gray-100 m-0;
}

.sheet-description {
  @apply text-sm text-gray-600 dark:text-gray-400 mt-1 m-0;
}

.sheet-close {
  @apply flex-shrink-0 p-1 ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors duration-200;
}

/* 动画 */
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.3s ease;
}

.sheet-enter-active .sheet,
.sheet-leave-active .sheet {
  transition: transform 0.3s ease;
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

/* 不同方向的动画 */
.sheet-enter-from .sheet[class*="top-0"],
.sheet-leave-to .sheet[class*="top-0"] {
  transform: translateY(-100%);
}

.sheet-enter-from .sheet[class*="right-0"],
.sheet-leave-to .sheet[class*="right-0"] {
  transform: translateX(100%);
}

.sheet-enter-from .sheet[class*="bottom-0"],
.sheet-leave-to .sheet[class*="bottom-0"] {
  transform: translateY(100%);
}

.sheet-enter-from .sheet[class*="left-0"],
.sheet-leave-to .sheet[class*="left-0"] {
  transform: translateX(-100%);
}

/* 自定义滚动条 */
.sheet-content::-webkit-scrollbar {
  width: 8px;
}

.sheet-content::-webkit-scrollbar-track {
  background: transparent;
}

.sheet-content::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

.sheet-content::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>
