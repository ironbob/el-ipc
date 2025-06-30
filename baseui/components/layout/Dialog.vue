<template>
  <teleport to="body">
    <transition name="dialog-backdrop" appear>
      <div
        v-if="open"
        class="dialog-backdrop"
        @click="handleBackdropClick"
      >
        <transition name="dialog" appear>
          <div
            v-if="open"
            :class="dialogClasses"
            @click.stop
            role="dialog"
            :aria-modal="true"
            :aria-labelledby="titleId"
            :aria-describedby="contentId"
          >
            <!-- macOS 风格标题栏 -->
            <div class="dialog-titlebar" :class="titlebarClasses">
              <!-- 左侧：窗口控制按钮 -->
              <div class="dialog-controls">
                <button
                  class="dialog-control-btn dialog-close-btn"
                  @click="handleClose"
                  :title="closeText"
                  :disabled="!closable"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M6 4.586L9.293 1.293a1 1 0 111.414 1.414L7.414 6l3.293 3.293a1 1 0 01-1.414 1.414L6 7.414 2.707 10.707a1 1 0 01-1.414-1.414L4.586 6 1.293 2.707a1 1 0 011.414-1.414L6 4.586z"/>
                  </svg>
                </button>
                
                <button
                  v-if="minimizable"
                  class="dialog-control-btn dialog-minimize-btn"
                  @click="handleMinimize"
                  :title="minimizeText"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 12 12">
                    <rect x="2" y="5.5" width="8" height="1" rx="0.5"/>
                  </svg>
                </button>
                
                <button
                  v-if="maximizable"
                  class="dialog-control-btn dialog-maximize-btn"
                  @click="handleMaximize"
                  :title="isMaximized ? restoreText : maximizeText"
                >
                  <svg v-if="!isMaximized" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 12 12" stroke-width="1">
                    <rect x="2" y="2" width="8" height="8" rx="1"/>
                  </svg>
                  <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 12 12" stroke-width="1">
                    <rect x="1.5" y="3.5" width="6" height="6" rx="0.5"/>
                    <rect x="4.5" y="1.5" width="6" height="6" rx="0.5"/>
                  </svg>
                </button>
              </div>

              <!-- 中间：标题 -->
              <div class="dialog-title-container">
                <h2 v-if="title" :id="titleId" class="dialog-title">
                  {{ title }}
                </h2>
                <slot v-else name="title"></slot>
              </div>

              <!-- 右侧：额外操作 -->
              <div class="dialog-actions">
                <slot name="titlebar-actions"></slot>
              </div>
            </div>

            <!-- 对话框内容 -->
            <div class="dialog-content" :class="contentClasses">
              <div :id="contentId" class="dialog-body">
                <slot></slot>
              </div>

              <!-- 底部操作栏 -->
              <div v-if="$slots.footer || showDefaultFooter" class="dialog-footer">
                <slot name="footer">
                  <div v-if="showDefaultFooter" class="dialog-default-footer">
                    <button
                      v-if="cancelable"
                      class="dialog-footer-btn dialog-cancel-btn"
                      @click="handleCancel"
                    >
                      {{ cancelText }}
                    </button>
                    <button
                      class="dialog-footer-btn dialog-confirm-btn"
                      @click="handleConfirm"
                    >
                      {{ confirmText }}
                    </button>
                  </div>
                </slot>
              </div>
            </div>

            <!-- 调整大小手柄 -->
            <div
              v-if="resizable && !isMaximized"
              class="dialog-resize-handle"
              @mousedown="handleResizeStart"
            ></div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
import Vue from 'vue'

let dialogIdCounter = 0

export default Vue.extend({
  name: 'Dialog',
  props: {
    open: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => ['xs', 'sm', 'md', 'lg', 'xl', 'full'].includes(value)
    },
    closable: {
      type: Boolean,
      default: true
    },
    minimizable: {
      type: Boolean,
      default: false
    },
    maximizable: {
      type: Boolean,
      default: false
    },
    resizable: {
      type: Boolean,
      default: false
    },
    draggable: {
      type: Boolean,
      default: true
    },
    modal: {
      type: Boolean,
      default: true
    },
    closeOnBackdrop: {
      type: Boolean,
      default: true
    },
    closeOnEscape: {
      type: Boolean,
      default: true
    },
    showDefaultFooter: {
      type: Boolean,
      default: false
    },
    cancelable: {
      type: Boolean,
      default: true
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    closeText: {
      type: String,
      default: '关闭'
    },
    minimizeText: {
      type: String,
      default: '最小化'
    },
    maximizeText: {
      type: String,
      default: '最大化'
    },
    restoreText: {
      type: String,
      default: '还原'
    }
  },
  data() {
    return {
      dialogId: ++dialogIdCounter,
      isMaximized: false,
      isMinimized: false,
      isDragging: false,
      isResizing: false,
      dragOffset: { x: 0, y: 0 },
      dialogPosition: { x: 0, y: 0 },
      dialogSize: { width: 0, height: 0 }
    }
  },
  computed: {
    titleId(): string {
      return `dialog-title-${this.dialogId}`
    },
    
    contentId(): string {
      return `dialog-content-${this.dialogId}`
    },
    
    dialogClasses(): string[] {
      const classes = [
        'dialog',
        'relative',
        'bg-white',
        'dark:bg-gray-800',
        'rounded-lg',
        'shadow-2xl',
        'overflow-hidden',
        'flex',
        'flex-col'
      ]

      // 尺寸
      if (!this.isMaximized) {
        switch (this.size) {
          case 'xs':
            classes.push('w-80', 'max-h-96')
            break
          case 'sm':
            classes.push('w-96', 'max-h-[32rem]')
            break
          case 'md':
            classes.push('w-[32rem]', 'max-h-[40rem]')
            break
          case 'lg':
            classes.push('w-[48rem]', 'max-h-[48rem]')
            break
          case 'xl':
            classes.push('w-[64rem]', 'max-h-[56rem]')
            break
          case 'full':
            classes.push('w-full', 'h-full', 'm-4')
            break
        }
      } else {
        classes.push('w-full', 'h-full', 'rounded-none')
      }

      // 可拖拽
      if (this.draggable && !this.isMaximized) {
        classes.push('cursor-move')
      }

      return classes
    },
    
    titlebarClasses(): string[] {
      const classes = [
        'flex',
        'items-center',
        'px-4',
        'py-3',
        'bg-gray-50',
        'dark:bg-gray-700',
        'border-b',
        'border-gray-200',
        'dark:border-gray-600',
        'select-none'
      ]

      if (this.draggable && !this.isMaximized) {
        classes.push('cursor-move')
      }

      return classes
    },
    
    contentClasses(): string[] {
      return ['flex-1', 'flex', 'flex-col', 'overflow-hidden']
    }
  },
  watch: {
    open(newValue) {
      if (newValue) {
        this.addEventListeners()
        this.$nextTick(() => {
          this.centerDialog()
        })
      } else {
        this.removeEventListeners()
      }
    }
  },
  methods: {
    handleClose() {
      if (this.closable) {
        this.$emit('update:open', false)
        this.$emit('close')
      }
    },
    
    handleMinimize() {
      this.isMinimized = !this.isMinimized
      this.$emit('minimize', this.isMinimized)
    },
    
    handleMaximize() {
      this.isMaximized = !this.isMaximized
      this.$emit('maximize', this.isMaximized)
    },
    
    handleConfirm() {
      this.$emit('confirm')
    },
    
    handleCancel() {
      this.$emit('cancel')
      if (this.cancelable) {
        this.handleClose()
      }
    },
    
    handleBackdropClick() {
      if (this.closeOnBackdrop && this.modal) {
        this.handleClose()
      }
    },
    
    handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape' && this.closeOnEscape) {
        this.handleClose()
      }
    },
    
    handleDragStart(event: MouseEvent) {
      if (!this.draggable || this.isMaximized) return
      
      this.isDragging = true
      const rect = (this.$el as HTMLElement).getBoundingClientRect()
      this.dragOffset = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }
      
      document.addEventListener('mousemove', this.handleDragMove)
      document.addEventListener('mouseup', this.handleDragEnd)
    },
    
    handleDragMove(event: MouseEvent) {
      if (!this.isDragging) return
      
      this.dialogPosition = {
        x: event.clientX - this.dragOffset.x,
        y: event.clientY - this.dragOffset.y
      }
    },
    
    handleDragEnd() {
      this.isDragging = false
      document.removeEventListener('mousemove', this.handleDragMove)
      document.removeEventListener('mouseup', this.handleDragEnd)
    },
    
    handleResizeStart(event: MouseEvent) {
      if (!this.resizable || this.isMaximized) return
      
      this.isResizing = true
      document.addEventListener('mousemove', this.handleResizeMove)
      document.addEventListener('mouseup', this.handleResizeEnd)
    },
    
    handleResizeMove(event: MouseEvent) {
      if (!this.isResizing) return
      
      const rect = (this.$el as HTMLElement).getBoundingClientRect()
      this.dialogSize = {
        width: Math.max(300, event.clientX - rect.left),
        height: Math.max(200, event.clientY - rect.top)
      }
    },
    
    handleResizeEnd() {
      this.isResizing = false
      document.removeEventListener('mousemove', this.handleResizeMove)
      document.removeEventListener('mouseup', this.handleResizeEnd)
    },
    
    centerDialog() {
      // 居中对话框
      this.dialogPosition = {
        x: (window.innerWidth - 500) / 2,
        y: (window.innerHeight - 400) / 2
      }
    },
    
    addEventListeners() {
      document.addEventListener('keydown', this.handleKeydown)
      
      if (this.draggable) {
        const titlebar = this.$el?.querySelector('.dialog-titlebar')
        titlebar?.addEventListener('mousedown', this.handleDragStart)
      }
    },
    
    removeEventListeners() {
      document.removeEventListener('keydown', this.handleKeydown)
      document.removeEventListener('mousemove', this.handleDragMove)
      document.removeEventListener('mouseup', this.handleDragEnd)
      document.removeEventListener('mousemove', this.handleResizeMove)
      document.removeEventListener('mouseup', this.handleResizeEnd)
    }
  },
  beforeDestroy() {
    this.removeEventListeners()
  }
})
</script>

<style scoped>
.dialog-backdrop {
  @apply fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm;
}

.dialog-controls {
  @apply flex items-center gap-2;
}

.dialog-control-btn {
  @apply w-3 h-3 rounded-full flex items-center justify-center text-transparent hover:text-white transition-colors duration-200;
}

.dialog-close-btn {
  @apply bg-red-500 hover:bg-red-600;
}

.dialog-minimize-btn {
  @apply bg-yellow-500 hover:bg-yellow-600;
}

.dialog-maximize-btn {
  @apply bg-green-500 hover:bg-green-600;
}

.dialog-control-btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.dialog-title-container {
  @apply flex-1 text-center px-4;
}

.dialog-title {
  @apply text-sm font-semibold text-gray-900 dark:text-gray-100 truncate;
}

.dialog-actions {
  @apply flex items-center gap-2;
}

.dialog-content {
  @apply flex-1;
}

.dialog-body {
  @apply flex-1 p-6 overflow-auto;
}

.dialog-footer {
  @apply px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600;
}

.dialog-default-footer {
  @apply flex justify-end gap-3;
}

.dialog-footer-btn {
  @apply px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200;
}

.dialog-cancel-btn {
  @apply text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500;
}

.dialog-confirm-btn {
  @apply text-white bg-blue-600 hover:bg-blue-700 border border-transparent;
}

.dialog-resize-handle {
  @apply absolute bottom-0 right-0 w-4 h-4 cursor-se-resize;
}

.dialog-resize-handle::after {
  content: '';
  @apply absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-gray-400;
}

/* 动画 */
.dialog-backdrop-enter-active,
.dialog-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-backdrop-enter-from,
.dialog-backdrop-leave-to {
  opacity: 0;
}

.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}
</style>
