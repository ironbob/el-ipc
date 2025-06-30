<template>
  <div class="window" :class="windowClasses" :style="windowStyle">
    <!-- macOS 风格标题栏 -->
    <div
      class="window-titlebar"
      :class="titlebarClasses"
      @mousedown="handleTitlebarMouseDown"
      @dblclick="handleTitlebarDoubleClick"
    >
      <!-- 左侧：窗口控制按钮 -->
      <div class="window-controls">
        <button
          class="window-control-btn window-close-btn"
          @click="handleClose"
          :title="closeText"
          :disabled="!closable"
        >
          <div class="control-icon close-icon">
            <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 12 12">
              <path d="M6 4.586L9.293 1.293a1 1 0 111.414 1.414L7.414 6l3.293 3.293a1 1 0 01-1.414 1.414L6 7.414 2.707 10.707a1 1 0 01-1.414-1.414L4.586 6 1.293 2.707a1 1 0 011.414-1.414L6 4.586z"/>
            </svg>
          </div>
        </button>
        
        <button
          v-if="minimizable"
          class="window-control-btn window-minimize-btn"
          @click="handleMinimize"
          :title="minimizeText"
        >
          <div class="control-icon minimize-icon">
            <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 12 12">
              <rect x="2" y="5.5" width="8" height="1" rx="0.5"/>
            </svg>
          </div>
        </button>
        
        <button
          v-if="maximizable"
          class="window-control-btn window-maximize-btn"
          @click="handleMaximize"
          :title="isMaximized ? restoreText : maximizeText"
        >
          <div class="control-icon maximize-icon">
            <svg v-if="!isMaximized" class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 12 12" stroke-width="1.5">
              <rect x="2" y="2" width="8" height="8" rx="1"/>
            </svg>
            <svg v-else class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 12 12" stroke-width="1.5">
              <rect x="1.5" y="3.5" width="6" height="6" rx="0.5"/>
              <rect x="4.5" y="1.5" width="6" height="6" rx="0.5"/>
            </svg>
          </div>
        </button>
      </div>

      <!-- 中间：标题和图标 -->
      <div class="window-title-container">
        <div v-if="icon" class="window-icon">
          <component :is="icon" />
        </div>
        <h1 v-if="title" class="window-title">{{ title }}</h1>
        <slot v-else name="title"></slot>
      </div>

      <!-- 右侧：工具栏按钮 -->
      <div class="window-toolbar">
        <slot name="toolbar"></slot>
      </div>
    </div>

    <!-- 窗口内容区域 -->
    <div class="window-content" :class="contentClasses">
      <!-- 侧边栏 -->
      <div v-if="$slots.sidebar" class="window-sidebar" :class="sidebarClasses">
        <slot name="sidebar"></slot>
      </div>

      <!-- 主内容区域 -->
      <div class="window-main" :class="mainClasses">
        <!-- 工具栏 -->
        <div v-if="$slots.toolbar" class="window-main-toolbar">
          <slot name="toolbar"></slot>
        </div>

        <!-- 内容 -->
        <div class="window-body">
          <slot></slot>
        </div>

        <!-- 状态栏 -->
        <div v-if="$slots.statusbar" class="window-statusbar">
          <slot name="statusbar"></slot>
        </div>
      </div>
    </div>

    <!-- 调整大小手柄 -->
    <template v-if="resizable && !isMaximized">
      <!-- 边缘调整手柄 -->
      <div class="resize-handle resize-n" @mousedown="handleResizeStart('n', $event)"></div>
      <div class="resize-handle resize-s" @mousedown="handleResizeStart('s', $event)"></div>
      <div class="resize-handle resize-w" @mousedown="handleResizeStart('w', $event)"></div>
      <div class="resize-handle resize-e" @mousedown="handleResizeStart('e', $event)"></div>
      
      <!-- 角落调整手柄 -->
      <div class="resize-handle resize-nw" @mousedown="handleResizeStart('nw', $event)"></div>
      <div class="resize-handle resize-ne" @mousedown="handleResizeStart('ne', $event)"></div>
      <div class="resize-handle resize-sw" @mousedown="handleResizeStart('sw', $event)"></div>
      <div class="resize-handle resize-se" @mousedown="handleResizeStart('se', $event)"></div>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

interface WindowPosition {
  x: number
  y: number
}

interface WindowSize {
  width: number
  height: number
}

export default Vue.extend({
  name: 'Window',
  props: {
    title: {
      type: String,
      default: ''
    },
    icon: {
      type: [String, Object],
      default: null
    },
    width: {
      type: Number,
      default: 800
    },
    height: {
      type: Number,
      default: 600
    },
    minWidth: {
      type: Number,
      default: 300
    },
    minHeight: {
      type: Number,
      default: 200
    },
    maxWidth: {
      type: Number,
      default: null
    },
    maxHeight: {
      type: Number,
      default: null
    },
    x: {
      type: Number,
      default: null
    },
    y: {
      type: Number,
      default: null
    },
    closable: {
      type: Boolean,
      default: true
    },
    minimizable: {
      type: Boolean,
      default: true
    },
    maximizable: {
      type: Boolean,
      default: true
    },
    resizable: {
      type: Boolean,
      default: true
    },
    draggable: {
      type: Boolean,
      default: true
    },
    focused: {
      type: Boolean,
      default: false
    },
    sidebarWidth: {
      type: Number,
      default: 200
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
      isMaximized: false,
      isMinimized: false,
      isDragging: false,
      isResizing: false,
      resizeDirection: '',
      dragStartPos: { x: 0, y: 0 },
      windowPos: { x: 0, y: 0 } as WindowPosition,
      windowSize: { width: 0, height: 0 } as WindowSize,
      savedPos: { x: 0, y: 0 } as WindowPosition,
      savedSize: { width: 0, height: 0 } as WindowSize
    }
  },
  computed: {
    windowClasses(): string[] {
      const classes = [
        'absolute',
        'bg-white',
        'dark:bg-gray-800',
        'rounded-lg',
        'shadow-2xl',
        'overflow-hidden',
        'flex',
        'flex-col',
        'border',
        'border-gray-200',
        'dark:border-gray-700'
      ]

      if (this.focused) {
        classes.push('ring-2', 'ring-blue-500/50')
      }

      if (this.isMaximized) {
        classes.push('!fixed', 'inset-0', '!rounded-none')
      }

      return classes
    },

    titlebarClasses(): string[] {
      const classes = [
        'flex',
        'items-center',
        'h-11',
        'px-4',
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
      return ['flex-1', 'flex', 'overflow-hidden']
    },

    sidebarClasses(): string[] {
      return [
        'flex-shrink-0',
        'bg-gray-50',
        'dark:bg-gray-700',
        'border-r',
        'border-gray-200',
        'dark:border-gray-600',
        'overflow-auto'
      ]
    },

    mainClasses(): string[] {
      return ['flex-1', 'flex', 'flex-col', 'overflow-hidden']
    },

    windowStyle(): Record<string, string> {
      if (this.isMaximized) {
        return {}
      }

      const style: Record<string, string> = {
        width: `${this.windowSize.width}px`,
        height: `${this.windowSize.height}px`,
        left: `${this.windowPos.x}px`,
        top: `${this.windowPos.y}px`
      }

      if (this.$slots.sidebar) {
        style['--sidebar-width'] = `${this.sidebarWidth}px`
      }

      return style
    }
  },
  mounted() {
    this.initializeWindow()
  },
  methods: {
    initializeWindow() {
      // 初始化窗口位置和大小
      this.windowSize = {
        width: this.width,
        height: this.height
      }

      if (this.x !== null && this.y !== null) {
        this.windowPos = { x: this.x, y: this.y }
      } else {
        // 居中显示
        this.centerWindow()
      }

      this.savedPos = { ...this.windowPos }
      this.savedSize = { ...this.windowSize }
    },

    centerWindow() {
      this.windowPos = {
        x: (window.innerWidth - this.windowSize.width) / 2,
        y: (window.innerHeight - this.windowSize.height) / 2
      }
    },

    handleClose() {
      if (this.closable) {
        this.$emit('close')
      }
    },

    handleMinimize() {
      this.isMinimized = !this.isMinimized
      this.$emit('minimize', this.isMinimized)
    },

    handleMaximize() {
      if (this.isMaximized) {
        // 还原窗口
        this.isMaximized = false
        this.windowPos = { ...this.savedPos }
        this.windowSize = { ...this.savedSize }
      } else {
        // 最大化窗口
        this.savedPos = { ...this.windowPos }
        this.savedSize = { ...this.windowSize }
        this.isMaximized = true
      }
      this.$emit('maximize', this.isMaximized)
    },

    handleTitlebarMouseDown(event: MouseEvent) {
      if (!this.draggable || this.isMaximized) return

      this.isDragging = true
      this.dragStartPos = {
        x: event.clientX - this.windowPos.x,
        y: event.clientY - this.windowPos.y
      }

      document.addEventListener('mousemove', this.handleDragMove)
      document.addEventListener('mouseup', this.handleDragEnd)
    },

    handleTitlebarDoubleClick() {
      if (this.maximizable) {
        this.handleMaximize()
      }
    },

    handleDragMove(event: MouseEvent) {
      if (!this.isDragging) return

      this.windowPos = {
        x: event.clientX - this.dragStartPos.x,
        y: Math.max(0, event.clientY - this.dragStartPos.y)
      }
    },

    handleDragEnd() {
      this.isDragging = false
      document.removeEventListener('mousemove', this.handleDragMove)
      document.removeEventListener('mouseup', this.handleDragEnd)
    },

    handleResizeStart(direction: string, event: MouseEvent) {
      if (!this.resizable || this.isMaximized) return

      this.isResizing = true
      this.resizeDirection = direction
      this.dragStartPos = { x: event.clientX, y: event.clientY }

      document.addEventListener('mousemove', this.handleResizeMove)
      document.addEventListener('mouseup', this.handleResizeEnd)
    },

    handleResizeMove(event: MouseEvent) {
      if (!this.isResizing) return

      const deltaX = event.clientX - this.dragStartPos.x
      const deltaY = event.clientY - this.dragStartPos.y

      const newPos = { ...this.windowPos }
      const newSize = { ...this.windowSize }

      // 根据调整方向计算新的位置和大小
      if (this.resizeDirection.includes('n')) {
        newPos.y += deltaY
        newSize.height -= deltaY
      }
      if (this.resizeDirection.includes('s')) {
        newSize.height += deltaY
      }
      if (this.resizeDirection.includes('w')) {
        newPos.x += deltaX
        newSize.width -= deltaX
      }
      if (this.resizeDirection.includes('e')) {
        newSize.width += deltaX
      }

      // 应用最小/最大尺寸限制
      newSize.width = Math.max(this.minWidth, newSize.width)
      newSize.height = Math.max(this.minHeight, newSize.height)

      if (this.maxWidth) {
        newSize.width = Math.min(this.maxWidth, newSize.width)
      }
      if (this.maxHeight) {
        newSize.height = Math.min(this.maxHeight, newSize.height)
      }

      this.windowPos = newPos
      this.windowSize = newSize
      this.dragStartPos = { x: event.clientX, y: event.clientY }
    },

    handleResizeEnd() {
      this.isResizing = false
      this.resizeDirection = ''
      document.removeEventListener('mousemove', this.handleResizeMove)
      document.removeEventListener('mouseup', this.handleResizeEnd)
    },

    focus() {
      this.$emit('focus')
    },

    blur() {
      this.$emit('blur')
    }
  }
})
</script>

<style scoped>
.window {
  z-index: 10;
}

.window-controls {
  @apply flex items-center gap-2;
}

.window-control-btn {
  @apply w-3 h-3 rounded-full flex items-center justify-center transition-all duration-200 group;
}

.control-icon {
  @apply opacity-0 group-hover:opacity-100 transition-opacity duration-200;
}

.window-close-btn {
  @apply bg-red-500 hover:bg-red-600;
}

.close-icon {
  @apply text-red-900;
}

.window-minimize-btn {
  @apply bg-yellow-500 hover:bg-yellow-600;
}

.minimize-icon {
  @apply text-yellow-900;
}

.window-maximize-btn {
  @apply bg-green-500 hover:bg-green-600;
}

.maximize-icon {
  @apply text-green-900;
}

.window-control-btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.window-title-container {
  @apply flex-1 flex items-center justify-center gap-2 px-4;
}

.window-icon {
  @apply w-4 h-4 flex-shrink-0;
}

.window-title {
  @apply text-sm font-semibold text-gray-900 dark:text-gray-100 truncate;
}

.window-toolbar {
  @apply flex items-center gap-2;
}

.window-sidebar {
  width: var(--sidebar-width, 200px);
}

.window-main-toolbar {
  @apply px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600;
}

.window-body {
  @apply flex-1 overflow-auto;
}

.window-statusbar {
  @apply px-4 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400;
}

/* 调整大小手柄 */
.resize-handle {
  @apply absolute;
}

.resize-n {
  @apply top-0 left-2 right-2 h-1 cursor-n-resize;
}

.resize-s {
  @apply bottom-0 left-2 right-2 h-1 cursor-s-resize;
}

.resize-w {
  @apply left-0 top-2 bottom-2 w-1 cursor-w-resize;
}

.resize-e {
  @apply right-0 top-2 bottom-2 w-1 cursor-e-resize;
}

.resize-nw {
  @apply top-0 left-0 w-2 h-2 cursor-nw-resize;
}

.resize-ne {
  @apply top-0 right-0 w-2 h-2 cursor-ne-resize;
}

.resize-sw {
  @apply bottom-0 left-0 w-2 h-2 cursor-sw-resize;
}

.resize-se {
  @apply bottom-0 right-0 w-2 h-2 cursor-se-resize;
}
</style>
