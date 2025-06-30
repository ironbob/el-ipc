<template>
  <div :class="dividerClasses" v-bind="$attrs" v-on="$listeners">
    <span v-if="$slots.default" :class="labelClasses">
      <slot />
    </span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Divider',
  inheritAttrs: false,
  props: {
    orientation: {
      type: String,
      default: 'horizontal',
      validator: (value: string) => ['horizontal', 'vertical'].includes(value)
    },
    variant: {
      type: String,
      default: 'solid',
      validator: (value: string) => ['solid', 'dashed', 'dotted'].includes(value)
    },
    thickness: {
      type: String,
      default: 'thin',
      validator: (value: string) => ['thin', 'thick'].includes(value)
    },
    color: {
      type: String,
      default: 'default',
      validator: (value: string) => ['default', 'light', 'dark', 'primary', 'secondary'].includes(value)
    },
    spacing: {
      type: String,
      default: 'md',
      validator: (value: string) => ['none', 'sm', 'md', 'lg', 'xl'].includes(value)
    },
    labelPosition: {
      type: String,
      default: 'center',
      validator: (value: string) => ['start', 'center', 'end'].includes(value)
    }
  },
  computed: {
    dividerClasses(): string[] {
      const classes = ['divider', 'relative', 'flex', 'items-center']
      
      // 方向
      if (this.orientation === 'vertical') {
        classes.push('flex-col', 'h-full')
      } else {
        classes.push('w-full')
      }
      
      // 间距
      switch (this.spacing) {
        case 'none':
          break
        case 'sm':
          classes.push(this.orientation === 'horizontal' ? 'my-2' : 'mx-2')
          break
        case 'md':
          classes.push(this.orientation === 'horizontal' ? 'my-4' : 'mx-4')
          break
        case 'lg':
          classes.push(this.orientation === 'horizontal' ? 'my-6' : 'mx-6')
          break
        case 'xl':
          classes.push(this.orientation === 'horizontal' ? 'my-8' : 'mx-8')
          break
      }
      
      // 如果没有标签，直接应用分割线样式
      if (!this.$slots.default) {
        classes.push(...this.getLineClasses())
      }
      
      return classes
    },
    
    labelClasses(): string[] {
      const classes = ['divider-label', 'bg-white', 'dark:bg-gray-900', 'text-sm', 'text-gray-500', 'dark:text-gray-400']
      
      if (this.orientation === 'horizontal') {
        classes.push('px-3')
      } else {
        classes.push('py-3')
      }
      
      return classes
    }
  },
  methods: {
    getLineClasses(): string[] {
      const classes = ['border-0']
      
      // 方向和厚度
      if (this.orientation === 'horizontal') {
        if (this.thickness === 'thick') {
          classes.push('border-t-2')
        } else {
          classes.push('border-t')
        }
      } else {
        if (this.thickness === 'thick') {
          classes.push('border-l-2')
        } else {
          classes.push('border-l')
        }
      }
      
      // 样式
      switch (this.variant) {
        case 'dashed':
          classes.push('border-dashed')
          break
        case 'dotted':
          classes.push('border-dotted')
          break
        default:
          classes.push('border-solid')
          break
      }
      
      // 颜色
      switch (this.color) {
        case 'light':
          classes.push('border-gray-100', 'dark:border-gray-800')
          break
        case 'dark':
          classes.push('border-gray-400', 'dark:border-gray-600')
          break
        case 'primary':
          classes.push('border-blue-300', 'dark:border-blue-700')
          break
        case 'secondary':
          classes.push('border-gray-300', 'dark:border-gray-700')
          break
        default:
          classes.push('border-gray-200', 'dark:border-gray-700')
          break
      }
      
      return classes
    }
  }
})
</script>

<style scoped>
.divider {
  position: relative;
}

/* 带标签的分割线 */
.divider:has(.divider-label)::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: currentColor;
  opacity: 0.2;
}

.divider[class*="flex-col"]:has(.divider-label)::before {
  top: 0;
  bottom: 0;
  left: 50%;
  right: auto;
  width: 1px;
  height: auto;
}

/* 标签位置 */
.divider-label {
  position: relative;
  z-index: 1;
}

/* 兼容性：如果浏览器不支持 :has()，使用 JavaScript 处理 */
.divider.has-label::before {
  content: '';
  position: absolute;
  background: currentColor;
  opacity: 0.2;
}

.divider.has-label.horizontal::before {
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
}

.divider.has-label.vertical::before {
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
}
</style>
