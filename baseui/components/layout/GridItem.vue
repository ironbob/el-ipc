<template>
  <div :class="gridItemClasses" v-bind="$attrs" v-on="$listeners">
    <slot />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'GridItem',
  inheritAttrs: false,
  props: {
    colSpan: {
      type: [Number, String],
      default: 1
    },
    rowSpan: {
      type: [Number, String],
      default: 1
    },
    colStart: {
      type: [Number, String],
      default: null
    },
    colEnd: {
      type: [Number, String],
      default: null
    },
    rowStart: {
      type: [Number, String],
      default: null
    },
    rowEnd: {
      type: [Number, String],
      default: null
    },
    area: {
      type: String,
      default: null
    },
    justifySelf: {
      type: String,
      default: 'auto',
      validator: (value: string) => ['auto', 'start', 'end', 'center', 'stretch'].includes(value)
    },
    alignSelf: {
      type: String,
      default: 'auto',
      validator: (value: string) => ['auto', 'start', 'end', 'center', 'stretch', 'baseline'].includes(value)
    }
  },
  computed: {
    gridItemClasses(): string[] {
      const classes: string[] = []

      // 列跨度
      if (this.colSpan !== 1) {
        classes.push(this.getColSpanClass())
      }

      // 行跨度
      if (this.rowSpan !== 1) {
        classes.push(this.getRowSpanClass())
      }

      // 列位置
      if (this.colStart !== null) {
        classes.push(this.getColStartClass())
      }
      if (this.colEnd !== null) {
        classes.push(this.getColEndClass())
      }

      // 行位置
      if (this.rowStart !== null) {
        classes.push(this.getRowStartClass())
      }
      if (this.rowEnd !== null) {
        classes.push(this.getRowEndClass())
      }

      // 网格区域
      if (this.area) {
        classes.push(`grid-area-${this.area}`)
      }

      // 自对齐
      if (this.justifySelf !== 'auto') {
        classes.push(this.getJustifySelfClass())
      }
      if (this.alignSelf !== 'auto') {
        classes.push(this.getAlignSelfClass())
      }

      return classes
    }
  },
  methods: {
    getColSpanClass(): string {
      if (typeof this.colSpan === 'number') {
        if (this.colSpan === 0) return 'col-span-full'
        return `col-span-${this.colSpan}`
      }
      return `col-span-${this.colSpan}`
    },

    getRowSpanClass(): string {
      if (typeof this.rowSpan === 'number') {
        if (this.rowSpan === 0) return 'row-span-full'
        return `row-span-${this.rowSpan}`
      }
      return `row-span-${this.rowSpan}`
    },

    getColStartClass(): string {
      if (typeof this.colStart === 'number') {
        return `col-start-${this.colStart}`
      }
      return `col-start-${this.colStart}`
    },

    getColEndClass(): string {
      if (typeof this.colEnd === 'number') {
        return `col-end-${this.colEnd}`
      }
      return `col-end-${this.colEnd}`
    },

    getRowStartClass(): string {
      if (typeof this.rowStart === 'number') {
        return `row-start-${this.rowStart}`
      }
      return `row-start-${this.rowStart}`
    },

    getRowEndClass(): string {
      if (typeof this.rowEnd === 'number') {
        return `row-end-${this.rowEnd}`
      }
      return `row-end-${this.rowEnd}`
    },

    getJustifySelfClass(): string {
      const justifyMap = {
        start: 'justify-self-start',
        end: 'justify-self-end',
        center: 'justify-self-center',
        stretch: 'justify-self-stretch'
      }

      return justifyMap[this.justifySelf as keyof typeof justifyMap] || ''
    },

    getAlignSelfClass(): string {
      const alignMap = {
        start: 'self-start',
        end: 'self-end',
        center: 'self-center',
        stretch: 'self-stretch',
        baseline: 'self-baseline'
      }

      return alignMap[this.alignSelf as keyof typeof alignMap] || ''
    }
  }
})
</script>

<style scoped>
/* GridItem 特定样式 */
.grid-area-custom {
  grid-area: var(--grid-area);
}
</style>
