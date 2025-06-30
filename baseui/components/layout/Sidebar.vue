<template>
  <div :class="sidebarClasses" :style="sidebarStyle">
    <!-- 头部 -->
    <div v-if="$slots.header || title" :class="headerClasses">
      <slot name="header">
        <div class="sidebar-title-section">
          <h2 v-if="title" class="sidebar-title">{{ title }}</h2>
          <p v-if="subtitle" class="sidebar-subtitle">{{ subtitle }}</p>
        </div>
      </slot>
      
      <!-- 折叠按钮 -->
      <button
        v-if="collapsible"
        :class="collapseButtonClasses"
        @click="toggleCollapse"
        :title="collapsed ? '展开侧边栏' : '折叠侧边栏'"
      >
        <svg 
          :class="collapseIconClasses" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M15 19l-7-7 7-7" 
          />
        </svg>
      </button>
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
  name: 'Sidebar',
  props: {
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    width: {
      type: [String, Number],
      default: 280
    },
    collapsedWidth: {
      type: [String, Number],
      default: 64
    },
    collapsed: {
      type: Boolean,
      default: false
    },
    collapsible: {
      type: Boolean,
      default: true
    },
    position: {
      type: String,
      default: 'left',
      validator: (value: string) => ['left', 'right'].includes(value)
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value: string) => ['default', 'floating', 'overlay'].includes(value)
    },
    bordered: {
      type: Boolean,
      default: true
    },
    resizable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentWidth: this.width,
      isResizing: false
    }
  },
  computed: {
    sidebarClasses(): string[] {
      const classes = ['sidebar', 'flex', 'flex-col', 'h-full', 'transition-all', 'duration-300']
      
      // 背景
      switch (this.variant) {
        case 'floating':
          classes.push('bg-white', 'dark:bg-gray-800', 'shadow-lg', 'rounded-lg', 'm-2')
          break
        case 'overlay':
          classes.push('bg-white', 'dark:bg-gray-800', 'shadow-xl')
          break
        default:
          classes.push('bg-gray-50', 'dark:bg-gray-900')
          break
      }
      
      // 边框
      if (this.bordered && this.variant === 'default') {
        if (this.position === 'left') {
          classes.push('border-r', 'border-gray-200', 'dark:border-gray-700')
        } else {
          classes.push('border-l', 'border-gray-200', 'dark:border-gray-700')
        }
      }
      
      return classes
    },
    
    sidebarStyle(): Record<string, string> {
      const width = this.collapsed 
        ? (typeof this.collapsedWidth === 'number' ? `${this.collapsedWidth}px` : this.collapsedWidth)
        : (typeof this.currentWidth === 'number' ? `${this.currentWidth}px` : this.currentWidth)
      
      return {
        width,
        minWidth: width,
        maxWidth: width
      }
    },
    
    headerClasses(): string[] {
      const classes = ['sidebar-header', 'flex', 'items-center', 'justify-between', 'flex-shrink-0']
      
      if (this.collapsed) {
        classes.push('px-2', 'py-3')
      } else {
        classes.push('px-4', 'py-3')
      }
      
      if (this.$slots.default || this.$slots.footer) {
        classes.push('border-b', 'border-gray-200', 'dark:border-gray-700')
      }
      
      return classes
    },
    
    contentClasses(): string[] {
      const classes = ['sidebar-content', 'flex-1', 'overflow-auto']
      
      if (this.collapsed) {
        classes.push('px-1')
      } else {
        classes.push('px-2')
      }
      
      return classes
    },
    
    footerClasses(): string[] {
      const classes = ['sidebar-footer', 'flex-shrink-0', 'border-t', 'border-gray-200', 'dark:border-gray-700']
      
      if (this.collapsed) {
        classes.push('px-2', 'py-3')
      } else {
        classes.push('px-4', 'py-3')
      }
      
      return classes
    },
    
    collapseButtonClasses(): string[] {
      return [
        'collapse-button',
        'p-1',
        'rounded',
        'text-gray-500',
        'hover:text-gray-700',
        'dark:text-gray-400',
        'dark:hover:text-gray-200',
        'hover:bg-gray-200',
        'dark:hover:bg-gray-700',
        'transition-colors',
        'duration-200'
      ]
    },
    
    collapseIconClasses(): string[] {
      const classes = ['w-4', 'h-4', 'transition-transform', 'duration-200']
      
      if (this.position === 'right') {
        classes.push('rotate-180')
      }
      
      if (this.collapsed) {
        classes.push('rotate-180')
      }
      
      return classes
    }
  },
  methods: {
    toggleCollapse() {
      this.$emit('toggle-collapse', !this.collapsed)
    }
  }
})
</script>

<style scoped>
.sidebar {
  position: relative;
}

.sidebar-title-section {
  @apply flex-1 min-w-0;
}

.sidebar-title {
  @apply text-lg font-semibold text-gray-900 dark:text-gray-100 m-0 truncate;
}

.sidebar-subtitle {
  @apply text-sm text-gray-600 dark:text-gray-400 mt-1 m-0 truncate;
}

.collapse-button {
  @apply flex-shrink-0;
}

/* 自定义滚动条 */
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

.dark .sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(107, 114, 128, 0.5);
}

.dark .sidebar-content::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.7);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    z-index: 50;
  }
}
</style>
