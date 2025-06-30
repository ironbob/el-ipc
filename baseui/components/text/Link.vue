<template>
  <component
    :is="tag"
    :class="linkClasses"
    :href="href"
    :to="to"
    :target="target"
    :rel="rel"
    :disabled="disabled"
    @click="handleClick"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <!-- 前缀图标 -->
    <span v-if="prefixIcon" class="link-prefix-icon">
      <component :is="prefixIcon" />
    </span>
    
    <!-- 链接文本 -->
    <span class="link-text">
      <slot />
    </span>
    
    <!-- 后缀图标 -->
    <span v-if="suffixIcon" class="link-suffix-icon">
      <component :is="suffixIcon" />
    </span>
    
    <!-- 外部链接图标 -->
    <span v-if="external && !suffixIcon" class="link-external-icon">
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </span>
  </component>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Link',
  inheritAttrs: false,
  props: {
    href: {
      type: String,
      default: ''
    },
    to: {
      type: [String, Object],
      default: null
    },
    target: {
      type: String,
      default: '_self',
      validator: (value: string) => ['_self', '_blank', '_parent', '_top'].includes(value)
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value: string) => ['default', 'primary', 'secondary', 'muted', 'success', 'warning', 'error'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
    },
    weight: {
      type: String,
      default: 'normal',
      validator: (value: string) => ['normal', 'medium', 'semibold', 'bold'].includes(value)
    },
    underline: {
      type: String,
      default: 'hover',
      validator: (value: string) => ['none', 'always', 'hover'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    external: {
      type: Boolean,
      default: false
    },
    prefixIcon: {
      type: [String, Object],
      default: null
    },
    suffixIcon: {
      type: [String, Object],
      default: null
    }
  },
  computed: {
    tag(): string {
      if (this.to) {
        return 'router-link'
      }
      return this.href ? 'a' : 'button'
    },
    
    rel(): string {
      if (this.external || this.target === '_blank') {
        return 'noopener noreferrer'
      }
      return ''
    },
    
    linkClasses(): string[] {
      const classes = ['link', 'inline-flex', 'items-center', 'gap-1', 'transition-all', 'duration-200']
      
      // 尺寸
      switch (this.size) {
        case 'xs':
          classes.push('text-xs')
          break
        case 'sm':
          classes.push('text-sm')
          break
        case 'lg':
          classes.push('text-lg')
          break
        case 'xl':
          classes.push('text-xl')
          break
        default:
          classes.push('text-base')
          break
      }
      
      // 字重
      switch (this.weight) {
        case 'medium':
          classes.push('font-medium')
          break
        case 'semibold':
          classes.push('font-semibold')
          break
        case 'bold':
          classes.push('font-bold')
          break
        default:
          classes.push('font-normal')
          break
      }
      
      // 下划线
      switch (this.underline) {
        case 'always':
          classes.push('underline')
          break
        case 'hover':
          classes.push('hover:underline')
          break
        case 'none':
          classes.push('no-underline')
          break
      }
      
      // 状态和颜色
      if (this.disabled) {
        classes.push('opacity-50', 'cursor-not-allowed', 'pointer-events-none')
      } else {
        classes.push('cursor-pointer')
        
        switch (this.variant) {
          case 'primary':
            classes.push('text-blue-600', 'dark:text-blue-400', 'hover:text-blue-700', 'dark:hover:text-blue-300')
            break
          case 'secondary':
            classes.push('text-gray-600', 'dark:text-gray-400', 'hover:text-gray-700', 'dark:hover:text-gray-300')
            break
          case 'muted':
            classes.push('text-gray-500', 'dark:text-gray-500', 'hover:text-gray-600', 'dark:hover:text-gray-400')
            break
          case 'success':
            classes.push('text-green-600', 'dark:text-green-400', 'hover:text-green-700', 'dark:hover:text-green-300')
            break
          case 'warning':
            classes.push('text-yellow-600', 'dark:text-yellow-400', 'hover:text-yellow-700', 'dark:hover:text-yellow-300')
            break
          case 'error':
            classes.push('text-red-600', 'dark:text-red-400', 'hover:text-red-700', 'dark:hover:text-red-300')
            break
          default:
            classes.push('text-gray-900', 'dark:text-gray-100', 'hover:text-gray-700', 'dark:hover:text-gray-300')
            break
        }
      }
      
      // 焦点样式
      classes.push('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500', 'focus:ring-offset-2', 'rounded')
      
      return classes
    }
  },
  methods: {
    handleClick(event: Event) {
      if (this.disabled) {
        event.preventDefault()
        return
      }
      
      this.$emit('click', event)
    }
  }
})
</script>

<style scoped>
.link {
  position: relative;
  text-decoration: none;
  border: none;
  background: none;
  padding: 0;
}

.link-prefix-icon,
.link-suffix-icon,
.link-external-icon {
  @apply flex-shrink-0;
}

.link-prefix-icon,
.link-suffix-icon {
  @apply w-4 h-4;
}

.link-external-icon {
  @apply w-3 h-3 opacity-70;
}

.link-text {
  @apply flex-1;
}

/* 活跃状态（用于路由链接） */
.link.router-link-active {
  @apply font-medium;
}

/* 访问过的链接样式 */
.link:visited {
  color: inherit;
}

/* 键盘导航时的焦点样式 */
.link:focus-visible {
  @apply ring-2 ring-blue-500 ring-offset-2;
}
</style>
