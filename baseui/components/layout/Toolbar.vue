<template>
  <div :class="toolbarClasses" v-bind="$attrs" v-on="$listeners">
    <!-- 左侧内容 -->
    <div v-if="$slots.left || title" class="toolbar-left">
      <slot name="left">
        <div v-if="title" class="toolbar-title-section">
          <h1 v-if="title" class="toolbar-title">{{ title }}</h1>
          <p v-if="subtitle" class="toolbar-subtitle">{{ subtitle }}</p>
        </div>
      </slot>
    </div>
    
    <!-- 中间内容 -->
    <div v-if="$slots.center" class="toolbar-center">
      <slot name="center" />
    </div>
    
    <!-- 右侧内容 -->
    <div v-if="$slots.right || $slots.default" class="toolbar-right">
      <slot name="right">
        <slot />
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Toolbar',
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
    variant: {
      type: String,
      default: 'default',
      validator: (value: string) => ['default', 'compact', 'prominent'].includes(value)
    },
    position: {
      type: String,
      default: 'top',
      validator: (value: string) => ['top', 'bottom'].includes(value)
    },
    bordered: {
      type: Boolean,
      default: true
    },
    transparent: {
      type: Boolean,
      default: false
    },
    sticky: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    toolbarClasses(): string[] {
      const classes = ['toolbar', 'flex', 'items-center', 'justify-between', 'w-full']
      
      // 变体样式
      switch (this.variant) {
        case 'compact':
          classes.push('h-12', 'px-4')
          break
        case 'prominent':
          classes.push('h-20', 'px-6')
          break
        default:
          classes.push('h-16', 'px-6')
          break
      }
      
      // 背景
      if (this.transparent) {
        classes.push('bg-transparent')
      } else {
        classes.push('bg-white', 'dark:bg-gray-800')
      }
      
      // 边框
      if (this.bordered) {
        if (this.position === 'top') {
          classes.push('border-b', 'border-gray-200', 'dark:border-gray-700')
        } else {
          classes.push('border-t', 'border-gray-200', 'dark:border-gray-700')
        }
      }
      
      // 粘性定位
      if (this.sticky) {
        classes.push('sticky', 'z-10')
        if (this.position === 'top') {
          classes.push('top-0')
        } else {
          classes.push('bottom-0')
        }
      }
      
      return classes
    }
  }
})
</script>

<style scoped>
.toolbar {
  position: relative;
  flex-shrink: 0;
}

.toolbar-left {
  @apply flex items-center flex-1 min-w-0;
}

.toolbar-center {
  @apply flex items-center justify-center flex-shrink-0 mx-4;
}

.toolbar-right {
  @apply flex items-center flex-shrink-0 space-x-2;
}

.toolbar-title-section {
  @apply min-w-0 flex-1;
}

.toolbar-title {
  @apply text-lg font-semibold text-gray-900 dark:text-gray-100 m-0 truncate;
}

.toolbar-subtitle {
  @apply text-sm text-gray-600 dark:text-gray-400 m-0 truncate;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .toolbar {
    @apply px-4;
  }
  
  .toolbar-center {
    @apply mx-2;
  }
  
  .toolbar-right {
    @apply space-x-1;
  }
}
</style>
