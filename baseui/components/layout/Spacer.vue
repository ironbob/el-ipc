<template>
  <div :class="spacerClasses" :style="spacerStyle" v-bind="$attrs" v-on="$listeners"></div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Spacer',
  inheritAttrs: false,
  props: {
    size: {
      type: [String, Number],
      default: 'md'
    },
    direction: {
      type: String,
      default: 'both',
      validator: (value: string) => ['horizontal', 'vertical', 'both'].includes(value)
    },
    grow: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    spacerClasses(): string[] {
      const classes = ['spacer']
      
      if (this.grow) {
        if (this.direction === 'horizontal') {
          classes.push('flex-grow')
        } else if (this.direction === 'vertical') {
          classes.push('flex-grow')
        } else {
          classes.push('flex-grow')
        }
      }
      
      // 如果使用预定义尺寸，添加对应的类
      if (typeof this.size === 'string' && !this.grow) {
        const sizeClasses = this.getSizeClasses()
        classes.push(...sizeClasses)
      }
      
      return classes
    },
    
    spacerStyle(): Record<string, string> {
      const style: Record<string, string> = {}
      
      // 如果是数字，直接设置像素值
      if (typeof this.size === 'number') {
        if (this.direction === 'horizontal') {
          style.width = `${this.size}px`
        } else if (this.direction === 'vertical') {
          style.height = `${this.size}px`
        } else {
          style.width = `${this.size}px`
          style.height = `${this.size}px`
        }
      }
      
      return style
    }
  },
  methods: {
    getSizeClasses(): string[] {
      const classes: string[] = []
      
      const sizeMap = {
        xs: '1',
        sm: '2',
        md: '4',
        lg: '6',
        xl: '8',
        '2xl': '12',
        '3xl': '16',
        '4xl': '20',
        '5xl': '24'
      }
      
      const sizeValue = sizeMap[this.size as keyof typeof sizeMap]
      
      if (sizeValue) {
        if (this.direction === 'horizontal') {
          classes.push(`w-${sizeValue}`)
        } else if (this.direction === 'vertical') {
          classes.push(`h-${sizeValue}`)
        } else {
          classes.push(`w-${sizeValue}`, `h-${sizeValue}`)
        }
      }
      
      return classes
    }
  }
})
</script>

<style scoped>
.spacer {
  flex-shrink: 0;
}

/* 当用作弹性增长时 */
.spacer.flex-grow {
  flex-grow: 1;
  flex-shrink: 1;
}
</style>
