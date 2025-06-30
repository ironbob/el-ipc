<template>
  <div :class="splitViewClasses" ref="splitView">
    <div 
      :class="primaryPaneClasses" 
      :style="primaryPaneStyle"
      ref="primaryPane"
    >
      <slot name="primary" />
    </div>
    
    <div 
      :class="resizerClasses"
      @mousedown="startResize"
      @touchstart="startResize"
      ref="resizer"
    >
      <div class="resizer-handle">
        <div class="resizer-dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
    </div>
    
    <div 
      :class="secondaryPaneClasses"
      :style="secondaryPaneStyle"
      ref="secondaryPane"
    >
      <slot name="secondary" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'SplitView',
  props: {
    direction: {
      type: String,
      default: 'horizontal',
      validator: (value: string) => ['horizontal', 'vertical'].includes(value)
    },
    initialSize: {
      type: [Number, String],
      default: 50
    },
    minSize: {
      type: [Number, String],
      default: 10
    },
    maxSize: {
      type: [Number, String],
      default: 90
    },
    disabled: {
      type: Boolean,
      default: false
    },
    resizerSize: {
      type: Number,
      default: 8
    }
  },
  data() {
    return {
      currentSize: this.initialSize,
      isResizing: false,
      startPosition: 0,
      startSize: 0
    }
  },
  computed: {
    splitViewClasses(): string[] {
      const classes = ['split-view', 'flex']
      
      if (this.direction === 'horizontal') {
        classes.push('flex-row')
      } else {
        classes.push('flex-col')
      }
      
      if (this.isResizing) {
        classes.push('resizing')
      }
      
      return classes
    },
    
    primaryPaneClasses(): string[] {
      return ['split-pane', 'primary-pane', 'overflow-hidden']
    },
    
    secondaryPaneClasses(): string[] {
      return ['split-pane', 'secondary-pane', 'flex-1', 'overflow-hidden']
    },
    
    resizerClasses(): string[] {
      const classes = ['resizer', 'flex-shrink-0', 'relative']
      
      if (this.direction === 'horizontal') {
        classes.push('cursor-col-resize', 'hover:bg-blue-100', 'dark:hover:bg-blue-900/20')
      } else {
        classes.push('cursor-row-resize', 'hover:bg-blue-100', 'dark:hover:bg-blue-900/20')
      }
      
      if (this.disabled) {
        classes.push('cursor-not-allowed', 'opacity-50')
      }
      
      return classes
    },
    
    primaryPaneStyle(): Record<string, string> {
      const size = typeof this.currentSize === 'number' 
        ? `${this.currentSize}%` 
        : this.currentSize
        
      if (this.direction === 'horizontal') {
        return { width: size }
      } else {
        return { height: size }
      }
    },
    
    secondaryPaneStyle(): Record<string, string> {
      return {}
    }
  },
  methods: {
    startResize(event: MouseEvent | TouchEvent) {
      if (this.disabled) return
      
      event.preventDefault()
      this.isResizing = true
      
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
      
      this.startPosition = this.direction === 'horizontal' ? clientX : clientY
      this.startSize = typeof this.currentSize === 'number' ? this.currentSize : parseFloat(this.currentSize)
      
      document.addEventListener('mousemove', this.handleResize)
      document.addEventListener('mouseup', this.stopResize)
      document.addEventListener('touchmove', this.handleResize)
      document.addEventListener('touchend', this.stopResize)
      
      document.body.style.userSelect = 'none'
      document.body.style.cursor = this.direction === 'horizontal' ? 'col-resize' : 'row-resize'
    },
    
    handleResize(event: MouseEvent | TouchEvent) {
      if (!this.isResizing) return
      
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
      
      const currentPosition = this.direction === 'horizontal' ? clientX : clientY
      const delta = currentPosition - this.startPosition
      
      const splitViewRect = (this.$refs.splitView as HTMLElement).getBoundingClientRect()
      const totalSize = this.direction === 'horizontal' ? splitViewRect.width : splitViewRect.height
      
      const deltaPercent = (delta / totalSize) * 100
      let newSize = this.startSize + deltaPercent
      
      // 应用最小/最大限制
      const minSize = typeof this.minSize === 'number' ? this.minSize : parseFloat(this.minSize)
      const maxSize = typeof this.maxSize === 'number' ? this.maxSize : parseFloat(this.maxSize)
      
      newSize = Math.max(minSize, Math.min(maxSize, newSize))
      
      this.currentSize = newSize
      this.$emit('resize', newSize)
    },
    
    stopResize() {
      this.isResizing = false
      
      document.removeEventListener('mousemove', this.handleResize)
      document.removeEventListener('mouseup', this.stopResize)
      document.removeEventListener('touchmove', this.handleResize)
      document.removeEventListener('touchend', this.stopResize)
      
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
      
      this.$emit('resize-end', this.currentSize)
    }
  },
  beforeDestroy() {
    this.stopResize()
  }
})
</script>

<style scoped>
.split-view {
  height: 100%;
  width: 100%;
}

.split-pane {
  position: relative;
}

.resizer {
  background-color: transparent;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resizer.cursor-col-resize {
  width: 8px;
  min-width: 8px;
}

.resizer.cursor-row-resize {
  height: 8px;
  min-height: 8px;
}

.resizer-handle {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cursor-col-resize .resizer-handle {
  width: 100%;
  height: 20px;
}

.cursor-row-resize .resizer-handle {
  width: 20px;
  height: 100%;
}

.resizer-dots {
  display: flex;
  gap: 2px;
}

.cursor-col-resize .resizer-dots {
  flex-direction: column;
}

.cursor-row-resize .resizer-dots {
  flex-direction: row;
}

.dot {
  width: 3px;
  height: 3px;
  background-color: #9ca3af;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.resizer:hover .dot {
  background-color: #6b7280;
}

.resizing {
  user-select: none;
}

.resizing .resizer {
  background-color: rgba(59, 130, 246, 0.1);
}

.resizing .dot {
  background-color: #3b82f6;
}

/* 深色模式 */
.dark .dot {
  background-color: #6b7280;
}

.dark .resizer:hover .dot {
  background-color: #9ca3af;
}

.dark .resizing .resizer {
  background-color: rgba(59, 130, 246, 0.2);
}
</style>
