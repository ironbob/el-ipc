<template>
  <component
    :is="tag"
    :class="textClasses"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot />
  </component>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'BaseText',
  inheritAttrs: false,
  props: {
    variant: {
      type: String,
      default: 'body1',
      validator: (value: string) => [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'body1', 'body2', 'caption', 'overline',
        'subtitle1', 'subtitle2'
      ].includes(value)
    },
    color: {
      type: String,
      default: 'default',
      validator: (value: string) => [
        'default', 'primary', 'secondary', 'success', 'warning', 'error', 'disabled'
      ].includes(value)
    },
    weight: {
      type: String,
      default: 'normal',
      validator: (value: string) => [
        'thin', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'
      ].includes(value)
    },
    align: {
      type: String,
      default: 'left',
      validator: (value: string) => ['left', 'center', 'right', 'justify'].includes(value)
    },
    truncate: {
      type: Boolean,
      default: false
    },
    noWrap: {
      type: Boolean,
      default: false
    },
    tag: {
      type: String,
      default: null
    }
  },
  computed: {
    textClasses(): string[] {
      const classes: string[] = []

      // 变体样式
      switch (this.variant) {
        case 'h1':
          classes.push('text-4xl', 'font-bold', 'leading-tight')
          break
        case 'h2':
          classes.push('text-3xl', 'font-bold', 'leading-tight')
          break
        case 'h3':
          classes.push('text-2xl', 'font-semibold', 'leading-tight')
          break
        case 'h4':
          classes.push('text-xl', 'font-semibold', 'leading-snug')
          break
        case 'h5':
          classes.push('text-lg', 'font-medium', 'leading-snug')
          break
        case 'h6':
          classes.push('text-base', 'font-medium', 'leading-normal')
          break
        case 'subtitle1':
          classes.push('text-base', 'font-medium', 'leading-relaxed')
          break
        case 'subtitle2':
          classes.push('text-sm', 'font-medium', 'leading-relaxed')
          break
        case 'body1':
          classes.push('text-base', 'leading-relaxed')
          break
        case 'body2':
          classes.push('text-sm', 'leading-relaxed')
          break
        case 'caption':
          classes.push('text-xs', 'leading-normal')
          break
        case 'overline':
          classes.push('text-xs', 'uppercase', 'tracking-wide', 'leading-normal')
          break
      }

      // 颜色
      switch (this.color) {
        case 'primary':
          classes.push('text-blue-600', 'dark:text-blue-400')
          break
        case 'secondary':
          classes.push('text-gray-600', 'dark:text-gray-400')
          break
        case 'success':
          classes.push('text-green-600', 'dark:text-green-400')
          break
        case 'warning':
          classes.push('text-yellow-600', 'dark:text-yellow-400')
          break
        case 'error':
          classes.push('text-red-600', 'dark:text-red-400')
          break
        case 'disabled':
          classes.push('text-gray-400', 'dark:text-gray-600')
          break
        default:
          classes.push('text-gray-900', 'dark:text-gray-100')
          break
      }

      // 字重
      switch (this.weight) {
        case 'thin':
          classes.push('font-thin')
          break
        case 'light':
          classes.push('font-light')
          break
        case 'normal':
          classes.push('font-normal')
          break
        case 'medium':
          classes.push('font-medium')
          break
        case 'semibold':
          classes.push('font-semibold')
          break
        case 'bold':
          classes.push('font-bold')
          break
        case 'extrabold':
          classes.push('font-extrabold')
          break
        case 'black':
          classes.push('font-black')
          break
      }

      // 对齐
      switch (this.align) {
        case 'center':
          classes.push('text-center')
          break
        case 'right':
          classes.push('text-right')
          break
        case 'justify':
          classes.push('text-justify')
          break
        default:
          classes.push('text-left')
          break
      }

      // 截断和换行
      if (this.truncate) {
        classes.push('truncate')
      }
      
      if (this.noWrap) {
        classes.push('whitespace-nowrap')
      }

      return classes
    },
    computedTag(): string {
      if (this.tag) {
        return this.tag
      }
      
      // 根据变体自动选择标签
      switch (this.variant) {
        case 'h1': return 'h1'
        case 'h2': return 'h2'
        case 'h3': return 'h3'
        case 'h4': return 'h4'
        case 'h5': return 'h5'
        case 'h6': return 'h6'
        case 'subtitle1':
        case 'subtitle2':
          return 'h6'
        case 'caption':
        case 'overline':
          return 'span'
        default:
          return 'p'
      }
    }
  }
})
</script>

<style scoped>
/* 基础文本样式 */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 确保继承的样式正确应用 */
h1, h2, h3, h4, h5, h6 {
  margin: 0;
}

p {
  margin: 0;
}

span {
  display: inline;
}
</style>
