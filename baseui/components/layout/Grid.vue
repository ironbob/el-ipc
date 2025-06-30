<template>
  <div :class="gridClasses" v-bind="$attrs" v-on="$listeners">
    <slot />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Grid',
  inheritAttrs: false,
  props: {
    columns: {
      type: [Number, String, Object],
      default: 1
    },
    rows: {
      type: [Number, String],
      default: 'auto'
    },
    gap: {
      type: [String, Number],
      default: 'md'
    },
    gapX: {
      type: [String, Number],
      default: null
    },
    gapY: {
      type: [String, Number],
      default: null
    },
    autoFlow: {
      type: String,
      default: 'row',
      validator: (value: string) => ['row', 'col', 'row-dense', 'col-dense'].includes(value)
    },
    autoRows: {
      type: String,
      default: 'auto'
    },
    autoCols: {
      type: String,
      default: 'auto'
    },
    placeItems: {
      type: String,
      default: 'stretch',
      validator: (value: string) => ['start', 'end', 'center', 'stretch'].includes(value)
    }
  },
  computed: {
    gridClasses(): string[] {
      const classes = ['grid']

      // 列数
      const columnsClass = this.getColumnsClass()
      if (columnsClass) {
        classes.push(columnsClass)
      }

      // 行数
      const rowsClass = this.getRowsClass()
      if (rowsClass) {
        classes.push(rowsClass)
      }

      // 间距
      const gapClasses = this.getGapClasses()
      classes.push(...gapClasses)

      // 自动流向
      const autoFlowClass = this.getAutoFlowClass()
      if (autoFlowClass) {
        classes.push(autoFlowClass)
      }

      // 自动行/列
      if (this.autoRows !== 'auto') {
        classes.push(`auto-rows-${this.autoRows}`)
      }
      if (this.autoCols !== 'auto') {
        classes.push(`auto-cols-${this.autoCols}`)
      }

      // 项目对齐
      const placeItemsClass = this.getPlaceItemsClass()
      if (placeItemsClass) {
        classes.push(placeItemsClass)
      }

      return classes
    }
  },
  methods: {
    getColumnsClass(): string {
      if (typeof this.columns === 'number') {
        if (this.columns <= 12) {
          return `grid-cols-${this.columns}`
        }
        return `grid-cols-[repeat(${this.columns},minmax(0,1fr))]`
      }

      if (typeof this.columns === 'string') {
        return `grid-cols-${this.columns}`
      }

      if (typeof this.columns === 'object') {
        // 响应式列数
        const responsive = this.columns as Record<string, number>
        const classes: string[] = []
        
        Object.entries(responsive).forEach(([breakpoint, cols]) => {
          if (breakpoint === 'default') {
            classes.push(`grid-cols-${cols}`)
          } else {
            classes.push(`${breakpoint}:grid-cols-${cols}`)
          }
        })
        
        return classes.join(' ')
      }

      return ''
    },

    getRowsClass(): string {
      if (typeof this.rows === 'number') {
        return `grid-rows-${this.rows}`
      }
      if (this.rows !== 'auto') {
        return `grid-rows-${this.rows}`
      }
      return ''
    },

    getGapClasses(): string[] {
      const classes: string[] = []

      if (this.gapX !== null || this.gapY !== null) {
        // 使用独立的 X/Y 间距
        if (this.gapX !== null) {
          classes.push(this.getGapClass(this.gapX, 'x'))
        }
        if (this.gapY !== null) {
          classes.push(this.getGapClass(this.gapY, 'y'))
        }
      } else {
        // 使用统一间距
        classes.push(this.getGapClass(this.gap))
      }

      return classes
    },

    getGapClass(gap: string | number, axis?: 'x' | 'y'): string {
      const prefix = axis ? `gap-${axis}-` : 'gap-'
      
      if (typeof gap === 'number') {
        return `${prefix}[${gap}px]`
      }

      const gapMap = {
        none: '0',
        xs: '1',
        sm: '2',
        md: '4',
        lg: '6',
        xl: '8',
        '2xl': '12'
      }

      const gapValue = gapMap[gap as keyof typeof gapMap] || gap
      return `${prefix}${gapValue}`
    },

    getAutoFlowClass(): string {
      const flowMap = {
        row: 'grid-flow-row',
        col: 'grid-flow-col',
        'row-dense': 'grid-flow-row-dense',
        'col-dense': 'grid-flow-col-dense'
      }

      return flowMap[this.autoFlow as keyof typeof flowMap] || ''
    },

    getPlaceItemsClass(): string {
      const placeMap = {
        start: 'place-items-start',
        end: 'place-items-end',
        center: 'place-items-center',
        stretch: 'place-items-stretch'
      }

      return placeMap[this.placeItems as keyof typeof placeMap] || ''
    }
  }
})
</script>

<style scoped>
/* Grid 特定样式 */
.grid {
  display: grid;
}

/* 自定义网格模板 */
.grid-template-custom {
  grid-template-columns: var(--grid-template-columns);
  grid-template-rows: var(--grid-template-rows);
}
</style>
