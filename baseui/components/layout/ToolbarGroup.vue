<template>
  <div :class="groupClasses" v-bind="$attrs" v-on="$listeners">
    <slot />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ToolbarGroup',
  inheritAttrs: false,
  props: {
    spacing: {
      type: String,
      default: 'sm',
      validator: (value: string) => ['none', 'xs', 'sm', 'md', 'lg'].includes(value)
    },
    separated: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    groupClasses(): string[] {
      const classes = ['toolbar-group', 'flex', 'items-center']
      
      // 间距
      switch (this.spacing) {
        case 'none':
          break
        case 'xs':
          classes.push('space-x-1')
          break
        case 'sm':
          classes.push('space-x-2')
          break
        case 'md':
          classes.push('space-x-3')
          break
        case 'lg':
          classes.push('space-x-4')
          break
      }
      
      // 分隔符
      if (this.separated) {
        classes.push('toolbar-group-separated')
      }
      
      return classes
    }
  }
})
</script>

<style scoped>
.toolbar-group {
  position: relative;
}

.toolbar-group-separated {
  @apply border-l border-gray-200 dark:border-gray-700 pl-4 ml-4;
}

.toolbar-group-separated:first-child {
  @apply border-l-0 pl-0 ml-0;
}
</style>
