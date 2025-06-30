<template>
  <div :class="stackClasses" v-bind="$attrs" v-on="$listeners">
    <slot />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Stack',
  inheritAttrs: false,
  props: {
    direction: {
      type: String,
      default: 'vertical',
      validator: (value: string) => ['horizontal', 'vertical'].includes(value)
    },
    spacing: {
      type: [String, Number],
      default: 'md',
      validator: (value: string | number) => {
        if (typeof value === 'number') return value >= 0
        return ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'].includes(value)
      }
    },
    alignment: {
      type: String,
      default: 'stretch',
      validator: (value: string) => ['start', 'center', 'end', 'stretch', 'baseline'].includes(value)
    },
    justifyContent: {
      type: String,
      default: 'start',
      validator: (value: string) => ['start', 'center', 'end', 'between', 'around', 'evenly'].includes(value)
    },
    wrap: {
      type: Boolean,
      default: false
    },
    reverse: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    stackClasses(): string[] {
      const classes = ['flex']

      // 方向
      if (this.direction === 'horizontal') {
        classes.push(this.reverse ? 'flex-row-reverse' : 'flex-row')
      } else {
        classes.push(this.reverse ? 'flex-col-reverse' : 'flex-col')
      }

      // 换行
      if (this.wrap) {
        classes.push('flex-wrap')
      }

      // 间距
      if (this.spacing !== 'none') {
        const spacingClass = this.getSpacingClass()
        if (spacingClass) {
          classes.push(spacingClass)
        }
      }

      // 对齐
      const alignmentClass = this.getAlignmentClass()
      if (alignmentClass) {
        classes.push(alignmentClass)
      }

      // 主轴对齐
      const justifyClass = this.getJustifyClass()
      if (justifyClass) {
        classes.push(justifyClass)
      }

      return classes
    }
  },
  methods: {
    getSpacingClass(): string {
      const isHorizontal = this.direction === 'horizontal'
      const spacingMap = {
        xs: isHorizontal ? 'space-x-1' : 'space-y-1',
        sm: isHorizontal ? 'space-x-2' : 'space-y-2',
        md: isHorizontal ? 'space-x-4' : 'space-y-4',
        lg: isHorizontal ? 'space-x-6' : 'space-y-6',
        xl: isHorizontal ? 'space-x-8' : 'space-y-8',
        '2xl': isHorizontal ? 'space-x-12' : 'space-y-12'
      }

      if (typeof this.spacing === 'number') {
        return isHorizontal ? `space-x-[${this.spacing}px]` : `space-y-[${this.spacing}px]`
      }

      return spacingMap[this.spacing as keyof typeof spacingMap] || ''
    },

    getAlignmentClass(): string {
      const isHorizontal = this.direction === 'horizontal'
      const alignmentMap = {
        start: isHorizontal ? 'items-start' : 'items-start',
        center: isHorizontal ? 'items-center' : 'items-center',
        end: isHorizontal ? 'items-end' : 'items-end',
        stretch: isHorizontal ? 'items-stretch' : 'items-stretch',
        baseline: isHorizontal ? 'items-baseline' : 'items-baseline'
      }

      return alignmentMap[this.alignment as keyof typeof alignmentMap] || ''
    },

    getJustifyClass(): string {
      const justifyMap = {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly'
      }

      return justifyMap[this.justifyContent as keyof typeof justifyMap] || ''
    }
  }
})
</script>

<style scoped>
/* Stack 特定样式 */
.flex > * {
  flex-shrink: 0;
}

/* 响应式间距 */
@media (max-width: 640px) {
  .space-x-4 > :not([hidden]) ~ :not([hidden]) {
    margin-left: 0.5rem;
  }
  
  .space-y-4 > :not([hidden]) ~ :not([hidden]) {
    margin-top: 0.5rem;
  }
}
</style>
