<template>
  <div :class="tabsClasses">
    <!-- 标签栏 -->
    <div :class="tabListClasses" role="tablist">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.id || index"
        :class="getTabClasses(tab, index)"
        :aria-selected="isActive(tab, index)"
        :aria-controls="`tabpanel-${tab.id || index}`"
        role="tab"
        @click="selectTab(tab, index)"
        @keydown="handleKeydown($event, index)"
      >
        <!-- 图标 -->
        <span v-if="tab.icon" class="tab-icon">
          <component :is="tab.icon" />
        </span>
        
        <!-- 标签文本 -->
        <span class="tab-label">{{ tab.label }}</span>
        
        <!-- 徽章 -->
        <span v-if="tab.badge" class="tab-badge">
          {{ tab.badge }}
        </span>
        
        <!-- 关闭按钮 -->
        <button
          v-if="tab.closable && !tab.disabled"
          class="tab-close"
          @click.stop="closeTab(tab, index)"
          @keydown.stop
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </button>
      
      <!-- 添加按钮 -->
      <button
        v-if="addable"
        class="tab-add"
        @click="$emit('add')"
        title="添加标签页"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
    
    <!-- 内容区域 -->
    <div :class="contentClasses">
      <div
        v-for="(tab, index) in tabs"
        :key="tab.id || index"
        v-show="isActive(tab, index)"
        :id="`tabpanel-${tab.id || index}`"
        :class="tabPanelClasses"
        role="tabpanel"
        :aria-labelledby="`tab-${tab.id || index}`"
      >
        <slot :name="tab.id || `tab-${index}`" :tab="tab" :index="index">
          <component v-if="tab.component" :is="tab.component" v-bind="tab.props" />
          <div v-else-if="tab.content" v-html="tab.content" />
        </slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

interface Tab {
  id?: string
  label: string
  icon?: any
  badge?: string | number
  disabled?: boolean
  closable?: boolean
  component?: any
  props?: Record<string, any>
  content?: string
}

export default Vue.extend({
  name: 'Tabs',
  props: {
    tabs: {
      type: Array as () => Tab[],
      required: true
    },
    activeTab: {
      type: [String, Number],
      default: null
    },
    variant: {
      type: String,
      default: 'line',
      validator: (value: string) => ['line', 'card', 'pill', 'segment'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
    },
    position: {
      type: String,
      default: 'top',
      validator: (value: string) => ['top', 'bottom', 'left', 'right'].includes(value)
    },
    addable: {
      type: Boolean,
      default: false
    },
    scrollable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentActiveTab: this.activeTab || (this.tabs[0]?.id || 0)
    }
  },
  computed: {
    tabsClasses(): string[] {
      const classes = ['tabs']
      
      if (this.position === 'left' || this.position === 'right') {
        classes.push('flex')
        if (this.position === 'right') {
          classes.push('flex-row-reverse')
        }
      } else {
        classes.push('flex', 'flex-col')
        if (this.position === 'bottom') {
          classes.push('flex-col-reverse')
        }
      }
      
      return classes
    },
    
    tabListClasses(): string[] {
      const classes = ['tab-list', 'flex']
      
      // 方向
      if (this.position === 'left' || this.position === 'right') {
        classes.push('flex-col', 'border-r', 'border-gray-200', 'dark:border-gray-700')
      } else {
        classes.push('flex-row')
        if (this.variant === 'line') {
          classes.push('border-b', 'border-gray-200', 'dark:border-gray-700')
        }
      }
      
      // 滚动
      if (this.scrollable) {
        classes.push('overflow-auto')
      }
      
      // 变体样式
      switch (this.variant) {
        case 'card':
          classes.push('bg-gray-50', 'dark:bg-gray-900', 'rounded-t-lg', 'p-1')
          break
        case 'pill':
          classes.push('bg-gray-100', 'dark:bg-gray-800', 'rounded-lg', 'p-1')
          break
        case 'segment':
          classes.push('bg-gray-100', 'dark:bg-gray-800', 'rounded-lg', 'p-1')
          break
      }
      
      return classes
    },
    
    contentClasses(): string[] {
      const classes = ['tab-content', 'flex-1', 'min-h-0']
      
      if (this.position === 'left' || this.position === 'right') {
        classes.push('overflow-auto')
      }
      
      return classes
    },
    
    tabPanelClasses(): string[] {
      return ['tab-panel', 'h-full', 'overflow-auto']
    }
  },
  watch: {
    activeTab(newValue) {
      this.currentActiveTab = newValue
    }
  },
  methods: {
    isActive(tab: Tab, index: number): boolean {
      const tabId = tab.id || index
      return tabId === this.currentActiveTab
    },
    
    getTabClasses(tab: Tab, index: number): string[] {
      const classes = ['tab', 'flex', 'items-center', 'gap-2', 'transition-all', 'duration-200']
      
      // 尺寸
      switch (this.size) {
        case 'sm':
          classes.push('px-3', 'py-1.5', 'text-sm')
          break
        case 'lg':
          classes.push('px-6', 'py-3', 'text-base')
          break
        default:
          classes.push('px-4', 'py-2', 'text-sm')
          break
      }
      
      // 状态
      const isActive = this.isActive(tab, index)
      
      if (tab.disabled) {
        classes.push('opacity-50', 'cursor-not-allowed')
      } else {
        classes.push('cursor-pointer')
        
        if (isActive) {
          switch (this.variant) {
            case 'line':
              classes.push('text-blue-600', 'dark:text-blue-400', 'border-b-2', 'border-blue-600', 'dark:border-blue-400')
              break
            case 'card':
            case 'pill':
            case 'segment':
              classes.push('bg-white', 'dark:bg-gray-700', 'text-gray-900', 'dark:text-gray-100', 'shadow-sm')
              break
          }
        } else {
          classes.push('text-gray-600', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-gray-100')
          
          if (this.variant === 'line') {
            classes.push('hover:border-b-2', 'hover:border-gray-300', 'dark:hover:border-gray-600')
          } else if (['card', 'pill', 'segment'].includes(this.variant)) {
            classes.push('hover:bg-gray-50', 'dark:hover:bg-gray-800')
          }
        }
      }
      
      // 变体特定样式
      switch (this.variant) {
        case 'card':
        case 'pill':
        case 'segment':
          classes.push('rounded-md')
          break
      }
      
      return classes
    },
    
    selectTab(tab: Tab, index: number) {
      if (tab.disabled) return
      
      const tabId = tab.id || index
      this.currentActiveTab = tabId
      this.$emit('change', tabId, tab, index)
    },
    
    closeTab(tab: Tab, index: number) {
      this.$emit('close', tab.id || index, tab, index)
    },
    
    handleKeydown(event: KeyboardEvent, index: number) {
      const { key } = event
      
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) {
        event.preventDefault()
        
        const isHorizontal = this.position === 'top' || this.position === 'bottom'
        const isNext = (isHorizontal && key === 'ArrowRight') || (!isHorizontal && key === 'ArrowDown')
        const isPrev = (isHorizontal && key === 'ArrowLeft') || (!isHorizontal && key === 'ArrowUp')
        
        let newIndex = index
        
        if (isNext) {
          newIndex = (index + 1) % this.tabs.length
        } else if (isPrev) {
          newIndex = (index - 1 + this.tabs.length) % this.tabs.length
        }
        
        // 跳过禁用的标签页
        while (this.tabs[newIndex]?.disabled && newIndex !== index) {
          if (isNext) {
            newIndex = (newIndex + 1) % this.tabs.length
          } else {
            newIndex = (newIndex - 1 + this.tabs.length) % this.tabs.length
          }
        }
        
        if (!this.tabs[newIndex]?.disabled) {
          this.selectTab(this.tabs[newIndex], newIndex)
        }
      }
    }
  }
})
</script>

<style scoped>
.tabs {
  height: 100%;
}

.tab-list {
  position: relative;
}

.tab {
  position: relative;
  border: none;
  background: none;
  outline: none;
  white-space: nowrap;
}

.tab:focus-visible {
  @apply ring-2 ring-blue-500 ring-offset-2 rounded;
}

.tab-icon {
  @apply flex-shrink-0;
}

.tab-label {
  @apply truncate;
}

.tab-badge {
  @apply inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full;
}

.tab-close {
  @apply flex-shrink-0 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200;
}

.tab-add {
  @apply flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors duration-200;
}

.tab-content {
  position: relative;
}

.tab-panel {
  position: relative;
}

/* 滚动条样式 */
.tab-list::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.tab-list::-webkit-scrollbar-track {
  background: transparent;
}

.tab-list::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}
</style>
