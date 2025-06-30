<template>
  <div :class="cardClasses" v-bind="$attrs" v-on="$listeners">
    <!-- 头部 -->
    <div v-if="$slots.header || title" class="card-header" :class="headerClasses">
      <slot name="header">
        <div v-if="title" class="card-title-section">
          <h3 v-if="title" class="card-title">{{ title }}</h3>
          <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
        </div>
      </slot>
      
      <!-- 头部操作 -->
      <div v-if="$slots.actions" class="card-actions">
        <slot name="actions" />
      </div>
    </div>

    <!-- 内容 -->
    <div v-if="$slots.default" class="card-content" :class="contentClasses">
      <slot />
    </div>

    <!-- 底部 -->
    <div v-if="$slots.footer" class="card-footer" :class="footerClasses">
      <slot name="footer" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'BaseCard',
  inheritAttrs: false,
  props: {
    variant: {
      type: String,
      default: 'default',
      validator: (value: string) => ['default', 'outlined', 'elevated', 'filled'].includes(value)
    },
    padding: {
      type: String,
      default: 'md',
      validator: (value: string) => ['none', 'sm', 'md', 'lg', 'xl'].includes(value)
    },
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    hoverable: {
      type: Boolean,
      default: false
    },
    clickable: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    cardClasses(): string[] {
      const classes = [
        'card',
        'bg-white',
        'dark:bg-gray-800',
        'transition-all',
        'duration-200'
      ]

      // 变体样式
      switch (this.variant) {
        case 'outlined':
          classes.push('border', 'border-gray-200', 'dark:border-gray-700', 'rounded-lg')
          break
        case 'elevated':
          classes.push('shadow-lg', 'rounded-lg', 'border-0')
          break
        case 'filled':
          classes.push('bg-gray-50', 'dark:bg-gray-900', 'rounded-lg', 'border-0')
          break
        default:
          classes.push('shadow-sm', 'border', 'border-gray-200', 'dark:border-gray-700', 'rounded-lg')
          break
      }

      // 交互状态
      if (this.hoverable || this.clickable) {
        classes.push('hover:shadow-md')
      }

      if (this.clickable) {
        classes.push('cursor-pointer', 'hover:scale-[1.02]', 'active:scale-[0.98]')
      }

      return classes
    },
    headerClasses(): string[] {
      const classes = ['flex', 'items-start', 'justify-between']
      
      // 头部内边距
      switch (this.padding) {
        case 'sm':
          classes.push('p-3', 'pb-0')
          break
        case 'lg':
          classes.push('p-8', 'pb-0')
          break
        case 'xl':
          classes.push('p-10', 'pb-0')
          break
        case 'none':
          break
        default:
          classes.push('p-6', 'pb-0')
          break
      }

      return classes
    },
    contentClasses(): string[] {
      const classes: string[] = []
      
      // 内容内边距
      switch (this.padding) {
        case 'sm':
          classes.push('p-3')
          if (this.$slots.header || this.title) {
            classes.push('pt-3')
          }
          break
        case 'lg':
          classes.push('p-8')
          if (this.$slots.header || this.title) {
            classes.push('pt-6')
          }
          break
        case 'xl':
          classes.push('p-10')
          if (this.$slots.header || this.title) {
            classes.push('pt-8')
          }
          break
        case 'none':
          break
        default:
          classes.push('p-6')
          if (this.$slots.header || this.title) {
            classes.push('pt-4')
          }
          break
      }

      return classes
    },
    footerClasses(): string[] {
      const classes = ['border-t', 'border-gray-200', 'dark:border-gray-700', 'bg-gray-50', 'dark:bg-gray-900/50']
      
      // 底部内边距
      switch (this.padding) {
        case 'sm':
          classes.push('p-3')
          break
        case 'lg':
          classes.push('p-8')
          break
        case 'xl':
          classes.push('p-10')
          break
        case 'none':
          break
        default:
          classes.push('p-6')
          break
      }

      return classes
    }
  }
})
</script>

<style scoped>
.card {
  position: relative;
  overflow: hidden;
}

.card-header {
  position: relative;
}

.card-title-section {
  flex: 1;
  min-width: 0;
}

.card-title {
  @apply text-lg font-semibold text-gray-900 dark:text-gray-100 m-0;
}

.card-subtitle {
  @apply text-sm text-gray-600 dark:text-gray-400 mt-1 m-0;
}

.card-actions {
  @apply flex items-center space-x-2 ml-4 flex-shrink-0;
}

.card-content {
  position: relative;
}

.card-footer {
  position: relative;
}

/* 深色模式优化 */
.dark .card {
  color-scheme: dark;
}
</style>
