<template>
  <div :class="paneClasses" v-bind="$attrs" v-on="$listeners">
    <!-- 头部 -->
    <div v-if="$slots.header || title" :class="headerClasses">
      <slot name="header">
        <div class="pane-title-section">
          <h3 v-if="title" class="pane-title">{{ title }}</h3>
          <p v-if="subtitle" class="pane-subtitle">{{ subtitle }}</p>
        </div>
      </slot>
      
      <!-- 头部操作 -->
      <div v-if="$slots.actions" class="pane-actions">
        <slot name="actions" />
      </div>
    </div>
    
    <!-- 内容 -->
    <div :class="contentClasses">
      <slot />
    </div>
    
    <!-- 底部 -->
    <div v-if="$slots.footer" :class="footerClasses">
      <slot name="footer" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Pane',
  inheritAttrs: false,
  props: {
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    padding: {
      type: String,
      default: 'md',
      validator: (value: string) => ['none', 'sm', 'md', 'lg', 'xl'].includes(value)
    },
    scrollable: {
      type: Boolean,
      default: true
    },
    bordered: {
      type: Boolean,
      default: false
    },
    background: {
      type: String,
      default: 'default',
      validator: (value: string) => ['default', 'secondary', 'transparent'].includes(value)
    }
  },
  computed: {
    paneClasses(): string[] {
      const classes = ['pane', 'flex', 'flex-col', 'h-full']
      
      // 背景
      switch (this.background) {
        case 'secondary':
          classes.push('bg-gray-50', 'dark:bg-gray-900')
          break
        case 'transparent':
          classes.push('bg-transparent')
          break
        default:
          classes.push('bg-white', 'dark:bg-gray-800')
          break
      }
      
      // 边框
      if (this.bordered) {
        classes.push('border', 'border-gray-200', 'dark:border-gray-700')
      }
      
      return classes
    },
    
    headerClasses(): string[] {
      const classes = ['pane-header', 'flex', 'items-center', 'justify-between', 'flex-shrink-0']
      
      // 头部内边距
      switch (this.padding) {
        case 'sm':
          classes.push('p-3', 'pb-0')
          break
        case 'lg':
          classes.push('p-6', 'pb-0')
          break
        case 'xl':
          classes.push('p-8', 'pb-0')
          break
        case 'none':
          break
        default:
          classes.push('p-4', 'pb-0')
          break
      }
      
      // 头部边框
      if (this.$slots.default || this.$slots.footer) {
        classes.push('border-b', 'border-gray-200', 'dark:border-gray-700')
      }
      
      return classes
    },
    
    contentClasses(): string[] {
      const classes = ['pane-content', 'flex-1', 'min-h-0']
      
      // 滚动
      if (this.scrollable) {
        classes.push('overflow-auto')
      } else {
        classes.push('overflow-hidden')
      }
      
      // 内容内边距
      switch (this.padding) {
        case 'sm':
          classes.push('p-3')
          if (this.$slots.header || this.title) {
            classes.push('pt-3')
          }
          break
        case 'lg':
          classes.push('p-6')
          if (this.$slots.header || this.title) {
            classes.push('pt-4')
          }
          break
        case 'xl':
          classes.push('p-8')
          if (this.$slots.header || this.title) {
            classes.push('pt-6')
          }
          break
        case 'none':
          break
        default:
          classes.push('p-4')
          if (this.$slots.header || this.title) {
            classes.push('pt-4')
          }
          break
      }
      
      return classes
    },
    
    footerClasses(): string[] {
      const classes = ['pane-footer', 'flex-shrink-0', 'border-t', 'border-gray-200', 'dark:border-gray-700']
      
      // 底部内边距
      switch (this.padding) {
        case 'sm':
          classes.push('p-3')
          break
        case 'lg':
          classes.push('p-6')
          break
        case 'xl':
          classes.push('p-8')
          break
        case 'none':
          break
        default:
          classes.push('p-4')
          break
      }
      
      return classes
    }
  }
})
</script>

<style scoped>
.pane {
  position: relative;
}

.pane-title-section {
  flex: 1;
  min-width: 0;
}

.pane-title {
  @apply text-lg font-semibold text-gray-900 dark:text-gray-100 m-0 truncate;
}

.pane-subtitle {
  @apply text-sm text-gray-600 dark:text-gray-400 mt-1 m-0 truncate;
}

.pane-actions {
  @apply flex items-center space-x-2 ml-4 flex-shrink-0;
}

.pane-content {
  position: relative;
}

.pane-footer {
  position: relative;
}

/* 自定义滚动条 */
.pane-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.pane-content::-webkit-scrollbar-track {
  background: transparent;
}

.pane-content::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

.pane-content::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

.dark .pane-content::-webkit-scrollbar-thumb {
  background: rgba(107, 114, 128, 0.5);
}

.dark .pane-content::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.7);
}
</style>
