<template>
  <div class="popover-container" ref="container">
    <!-- 触发器 -->
    <div
      ref="trigger"
      @click="handleTriggerClick"
      @mouseenter="handleTriggerMouseEnter"
      @mouseleave="handleTriggerMouseLeave"
      @focus="handleTriggerFocus"
      @blur="handleTriggerBlur"
    >
      <slot name="trigger" />
    </div>
    
    <!-- 弹出内容 -->
    <teleport to="body">
      <transition
        name="popover"
        @enter="onEnter"
        @after-enter="onAfterEnter"
        @leave="onLeave"
        @after-leave="onAfterLeave"
      >
        <div
          v-if="isOpen"
          ref="popover"
          :class="popoverClasses"
          :style="popoverStyle"
          @click.stop
          @mouseenter="handlePopoverMouseEnter"
          @mouseleave="handlePopoverMouseLeave"
          role="tooltip"
          :aria-describedby="contentId"
        >
          <!-- 箭头 -->
          <div v-if="arrow" :class="arrowClasses" :style="arrowStyle"></div>
          
          <!-- 内容 -->
          <div :id="contentId" :class="contentClasses">
            <slot name="content" />
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

let popoverIdCounter = 0

export default Vue.extend({
  name: 'Popover',
  props: {
    open: {
      type: Boolean,
      default: null
    },
    trigger: {
      type: String,
      default: 'click',
      validator: (value: string) => ['click', 'hover', 'focus', 'manual'].includes(value)
    },
    placement: {
      type: String,
      default: 'bottom',
      validator: (value: string) => [
        'top', 'top-start', 'top-end',
        'right', 'right-start', 'right-end',
        'bottom', 'bottom-start', 'bottom-end',
        'left', 'left-start', 'left-end'
      ].includes(value)
    },
    offset: {
      type: Number,
      default: 8
    },
    arrow: {
      type: Boolean,
      default: true
    },
    closeOnClickOutside: {
      type: Boolean,
      default: true
    },
    closeOnEscape: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    delay: {
      type: [Number, Object],
      default: () => ({ show: 0, hide: 100 })
    }
  },
  data() {
    return {
      popoverId: ++popoverIdCounter,
      internalOpen: false,
      position: { x: 0, y: 0 },
      arrowPosition: { x: 0, y: 0 },
      showTimer: null as number | null,
      hideTimer: null as number | null
    }
  },
  computed: {
    isOpen(): boolean {
      return this.open !== null ? this.open : this.internalOpen
    },
    
    contentId(): string {
      return `popover-content-${this.popoverId}`
    },
    
    delayShow(): number {
      return typeof this.delay === 'number' ? this.delay : this.delay.show
    },
    
    delayHide(): number {
      return typeof this.delay === 'number' ? this.delay : this.delay.hide
    },
    
    popoverClasses(): string[] {
      return [
        'popover',
        'absolute',
        'z-50',
        'bg-white',
        'dark:bg-gray-800',
        'border',
        'border-gray-200',
        'dark:border-gray-700',
        'rounded-lg',
        'shadow-lg',
        'max-w-xs'
      ]
    },
    
    popoverStyle(): Record<string, string> {
      return {
        left: `${this.position.x}px`,
        top: `${this.position.y}px`
      }
    },
    
    contentClasses(): string[] {
      return ['popover-content', 'p-3', 'text-sm', 'text-gray-900', 'dark:text-gray-100']
    },
    
    arrowClasses(): string[] {
      const classes = ['popover-arrow', 'absolute', 'w-2', 'h-2', 'bg-white', 'dark:bg-gray-800', 'border', 'border-gray-200', 'dark:border-gray-700']
      
      const [side] = this.placement.split('-')
      
      switch (side) {
        case 'top':
          classes.push('bottom-0', 'transform', 'translate-y-1/2', 'rotate-45', 'border-t-0', 'border-l-0')
          break
        case 'right':
          classes.push('left-0', 'transform', '-translate-x-1/2', 'rotate-45', 'border-t-0', 'border-r-0')
          break
        case 'bottom':
          classes.push('top-0', 'transform', '-translate-y-1/2', 'rotate-45', 'border-b-0', 'border-r-0')
          break
        case 'left':
          classes.push('right-0', 'transform', 'translate-x-1/2', 'rotate-45', 'border-b-0', 'border-l-0')
          break
      }
      
      return classes
    },
    
    arrowStyle(): Record<string, string> {
      return {
        left: `${this.arrowPosition.x}px`,
        top: `${this.arrowPosition.y}px`
      }
    }
  },
  watch: {
    isOpen(newValue) {
      if (newValue) {
        this.$nextTick(() => {
          this.updatePosition()
          this.addEventListeners()
        })
      } else {
        this.removeEventListeners()
      }
    }
  },
  mounted() {
    if (this.isOpen) {
      this.$nextTick(() => {
        this.updatePosition()
        this.addEventListeners()
      })
    }
  },
  beforeDestroy() {
    this.removeEventListeners()
    this.clearTimers()
  },
  methods: {
    show() {
      if (this.disabled) return
      
      this.clearTimers()
      
      if (this.delayShow > 0) {
        this.showTimer = window.setTimeout(() => {
          this.setOpen(true)
        }, this.delayShow)
      } else {
        this.setOpen(true)
      }
    },
    
    hide() {
      this.clearTimers()
      
      if (this.delayHide > 0) {
        this.hideTimer = window.setTimeout(() => {
          this.setOpen(false)
        }, this.delayHide)
      } else {
        this.setOpen(false)
      }
    },
    
    toggle() {
      if (this.isOpen) {
        this.hide()
      } else {
        this.show()
      }
    },
    
    setOpen(open: boolean) {
      if (this.open !== null) {
        this.$emit('update:open', open)
      } else {
        this.internalOpen = open
      }
      
      this.$emit(open ? 'show' : 'hide')
    },
    
    clearTimers() {
      if (this.showTimer) {
        clearTimeout(this.showTimer)
        this.showTimer = null
      }
      if (this.hideTimer) {
        clearTimeout(this.hideTimer)
        this.hideTimer = null
      }
    },
    
    updatePosition() {
      if (!this.$refs.trigger || !this.$refs.popover) return
      
      const trigger = this.$refs.trigger as HTMLElement
      const popover = this.$refs.popover as HTMLElement
      
      const triggerRect = trigger.getBoundingClientRect()
      const popoverRect = popover.getBoundingClientRect()
      
      const [side, align] = this.placement.split('-')
      
      let x = 0
      let y = 0
      let arrowX = 0
      let arrowY = 0
      
      // 计算主轴位置
      switch (side) {
        case 'top':
          x = triggerRect.left
          y = triggerRect.top - popoverRect.height - this.offset
          arrowX = triggerRect.width / 2 - 4
          arrowY = popoverRect.height - 4
          break
        case 'right':
          x = triggerRect.right + this.offset
          y = triggerRect.top
          arrowX = -4
          arrowY = triggerRect.height / 2 - 4
          break
        case 'bottom':
          x = triggerRect.left
          y = triggerRect.bottom + this.offset
          arrowX = triggerRect.width / 2 - 4
          arrowY = -4
          break
        case 'left':
          x = triggerRect.left - popoverRect.width - this.offset
          y = triggerRect.top
          arrowX = popoverRect.width - 4
          arrowY = triggerRect.height / 2 - 4
          break
      }
      
      // 计算对齐
      if (align) {
        switch (align) {
          case 'start':
            if (side === 'top' || side === 'bottom') {
              // 水平对齐到开始
            } else {
              // 垂直对齐到开始
            }
            break
          case 'end':
            if (side === 'top' || side === 'bottom') {
              x = triggerRect.right - popoverRect.width
              arrowX = popoverRect.width - triggerRect.width / 2 - 4
            } else {
              y = triggerRect.bottom - popoverRect.height
              arrowY = popoverRect.height - triggerRect.height / 2 - 4
            }
            break
        }
      } else {
        // 居中对齐
        if (side === 'top' || side === 'bottom') {
          x = triggerRect.left + (triggerRect.width - popoverRect.width) / 2
        } else {
          y = triggerRect.top + (triggerRect.height - popoverRect.height) / 2
        }
      }
      
      // 边界检测和调整
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      }
      
      if (x < 0) x = 8
      if (y < 0) y = 8
      if (x + popoverRect.width > viewport.width) x = viewport.width - popoverRect.width - 8
      if (y + popoverRect.height > viewport.height) y = viewport.height - popoverRect.height - 8
      
      this.position = { x, y }
      this.arrowPosition = { x: arrowX, y: arrowY }
    },
    
    handleTriggerClick() {
      if (this.trigger === 'click') {
        this.toggle()
      }
    },
    
    handleTriggerMouseEnter() {
      if (this.trigger === 'hover') {
        this.show()
      }
    },
    
    handleTriggerMouseLeave() {
      if (this.trigger === 'hover') {
        this.hide()
      }
    },
    
    handleTriggerFocus() {
      if (this.trigger === 'focus') {
        this.show()
      }
    },
    
    handleTriggerBlur() {
      if (this.trigger === 'focus') {
        this.hide()
      }
    },
    
    handlePopoverMouseEnter() {
      if (this.trigger === 'hover') {
        this.clearTimers()
      }
    },
    
    handlePopoverMouseLeave() {
      if (this.trigger === 'hover') {
        this.hide()
      }
    },
    
    handleClickOutside(event: Event) {
      if (!this.closeOnClickOutside) return
      
      const target = event.target as HTMLElement
      const trigger = this.$refs.trigger as HTMLElement
      const popover = this.$refs.popover as HTMLElement
      
      if (!trigger.contains(target) && !popover.contains(target)) {
        this.hide()
      }
    },
    
    handleEscape(event: KeyboardEvent) {
      if (this.closeOnEscape && event.key === 'Escape') {
        this.hide()
      }
    },
    
    addEventListeners() {
      document.addEventListener('click', this.handleClickOutside)
      document.addEventListener('keydown', this.handleEscape)
      window.addEventListener('resize', this.updatePosition)
      window.addEventListener('scroll', this.updatePosition)
    },
    
    removeEventListeners() {
      document.removeEventListener('click', this.handleClickOutside)
      document.removeEventListener('keydown', this.handleEscape)
      window.removeEventListener('resize', this.updatePosition)
      window.removeEventListener('scroll', this.updatePosition)
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
.popover-container {
  display: inline-block;
}

.popover {
  pointer-events: auto;
}

/* 动画 */
.popover-enter-active,
.popover-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
