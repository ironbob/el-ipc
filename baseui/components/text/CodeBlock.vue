<template>
  <div :class="codeBlockClasses">
    <!-- 头部 -->
    <div v-if="showHeader" :class="headerClasses">
      <!-- 语言标签 -->
      <div class="code-language">
        <span v-if="language" class="language-label">{{ languageLabel }}</span>
        <span v-if="filename" class="filename-label">{{ filename }}</span>
      </div>
      
      <!-- 操作按钮 -->
      <div class="code-actions">
        <button
          v-if="copyable"
          :class="copyButtonClasses"
          @click="copyCode"
          :title="copyButtonTitle"
        >
          <svg v-if="!copied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
        
        <button
          v-if="expandable && isOverflowing"
          :class="expandButtonClasses"
          @click="toggleExpanded"
          :title="expanded ? '收起' : '展开'"
        >
          <svg :class="expandIconClasses" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- 代码内容 -->
    <div :class="contentClasses" ref="content">
      <pre :class="preClasses"><code :class="codeClasses" ref="code">{{ code }}</code></pre>
      
      <!-- 行号 -->
      <div v-if="showLineNumbers" :class="lineNumbersClasses">
        <span
          v-for="line in lineCount"
          :key="line"
          :class="getLineNumberClasses(line)"
        >
          {{ line }}
        </span>
      </div>
    </div>
    
    <!-- 展开遮罩 -->
    <div v-if="expandable && !expanded && isOverflowing" class="expand-overlay">
      <button class="expand-button" @click="toggleExpanded">
        <span>展开代码</span>
        <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'CodeBlock',
  props: {
    code: {
      type: String,
      required: true
    },
    language: {
      type: String,
      default: ''
    },
    filename: {
      type: String,
      default: ''
    },
    theme: {
      type: String,
      default: 'light',
      validator: (value: string) => ['light', 'dark', 'auto'].includes(value)
    },
    showLineNumbers: {
      type: Boolean,
      default: false
    },
    highlightLines: {
      type: Array as () => number[],
      default: () => []
    },
    copyable: {
      type: Boolean,
      default: true
    },
    expandable: {
      type: Boolean,
      default: false
    },
    maxHeight: {
      type: String,
      default: '400px'
    },
    wrap: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      copied: false,
      expanded: false,
      isOverflowing: false
    }
  },
  computed: {
    showHeader(): boolean {
      return this.language || this.filename || this.copyable || (this.expandable && this.isOverflowing)
    },
    
    languageLabel(): string {
      const languageMap: Record<string, string> = {
        'js': 'JavaScript',
        'ts': 'TypeScript',
        'jsx': 'JSX',
        'tsx': 'TSX',
        'vue': 'Vue',
        'html': 'HTML',
        'css': 'CSS',
        'scss': 'SCSS',
        'sass': 'Sass',
        'less': 'Less',
        'json': 'JSON',
        'xml': 'XML',
        'yaml': 'YAML',
        'yml': 'YAML',
        'md': 'Markdown',
        'py': 'Python',
        'java': 'Java',
        'c': 'C',
        'cpp': 'C++',
        'cs': 'C#',
        'php': 'PHP',
        'rb': 'Ruby',
        'go': 'Go',
        'rs': 'Rust',
        'sh': 'Shell',
        'bash': 'Bash',
        'sql': 'SQL'
      }
      
      return languageMap[this.language] || this.language.toUpperCase()
    },
    
    lineCount(): number {
      return this.code.split('\n').length
    },
    
    copyButtonTitle(): string {
      return this.copied ? '已复制' : '复制代码'
    },
    
    codeBlockClasses(): string[] {
      const classes = ['code-block', 'relative', 'rounded-lg', 'overflow-hidden']
      
      switch (this.theme) {
        case 'dark':
          classes.push('bg-gray-900', 'text-gray-100')
          break
        case 'auto':
          classes.push('bg-gray-100', 'dark:bg-gray-900', 'text-gray-900', 'dark:text-gray-100')
          break
        default:
          classes.push('bg-gray-100', 'text-gray-900')
          break
      }
      
      return classes
    },
    
    headerClasses(): string[] {
      const classes = ['code-header', 'flex', 'items-center', 'justify-between', 'px-4', 'py-2', 'border-b']
      
      switch (this.theme) {
        case 'dark':
          classes.push('bg-gray-800', 'border-gray-700')
          break
        case 'auto':
          classes.push('bg-gray-200', 'dark:bg-gray-800', 'border-gray-300', 'dark:border-gray-700')
          break
        default:
          classes.push('bg-gray-200', 'border-gray-300')
          break
      }
      
      return classes
    },
    
    contentClasses(): string[] {
      const classes = ['code-content', 'relative']
      
      if (!this.expanded && this.expandable) {
        classes.push('overflow-hidden')
      } else {
        classes.push('overflow-auto')
      }
      
      return classes
    },
    
    preClasses(): string[] {
      const classes = ['code-pre', 'm-0', 'p-4']
      
      if (this.showLineNumbers) {
        classes.push('pl-12')
      }
      
      if (this.wrap) {
        classes.push('whitespace-pre-wrap', 'break-words')
      } else {
        classes.push('whitespace-pre')
      }
      
      return classes
    },
    
    codeClasses(): string[] {
      const classes = ['code-element', 'font-mono', 'text-sm', 'leading-relaxed']
      
      if (this.language) {
        classes.push(`language-${this.language}`)
      }
      
      return classes
    },
    
    lineNumbersClasses(): string[] {
      const classes = ['line-numbers', 'absolute', 'left-0', 'top-0', 'p-4', 'pr-2', 'text-right', 'select-none', 'pointer-events-none']
      
      switch (this.theme) {
        case 'dark':
          classes.push('text-gray-500')
          break
        case 'auto':
          classes.push('text-gray-500', 'dark:text-gray-400')
          break
        default:
          classes.push('text-gray-500')
          break
      }
      
      return classes
    },
    
    copyButtonClasses(): string[] {
      const classes = ['copy-button', 'p-1', 'rounded', 'transition-colors', 'duration-200']
      
      if (this.copied) {
        classes.push('text-green-600', 'dark:text-green-400')
      } else {
        classes.push('text-gray-500', 'hover:text-gray-700', 'dark:text-gray-400', 'dark:hover:text-gray-200')
      }
      
      return classes
    },
    
    expandButtonClasses(): string[] {
      return [
        'expand-toggle',
        'p-1',
        'rounded',
        'text-gray-500',
        'hover:text-gray-700',
        'dark:text-gray-400',
        'dark:hover:text-gray-200',
        'transition-colors',
        'duration-200'
      ]
    },
    
    expandIconClasses(): string[] {
      const classes = ['w-4', 'h-4', 'transition-transform', 'duration-200']
      
      if (this.expanded) {
        classes.push('rotate-180')
      }
      
      return classes
    }
  },
  mounted() {
    this.checkOverflow()
    window.addEventListener('resize', this.checkOverflow)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkOverflow)
  },
  methods: {
    async copyCode() {
      try {
        await navigator.clipboard.writeText(this.code)
        this.copied = true
        this.$emit('copy', this.code)
        
        setTimeout(() => {
          this.copied = false
        }, 2000)
      } catch (error) {
        console.error('Failed to copy code:', error)
        this.$emit('copy-error', error)
      }
    },
    
    toggleExpanded() {
      this.expanded = !this.expanded
      this.$emit('toggle-expand', this.expanded)
    },
    
    checkOverflow() {
      if (!this.expandable) return
      
      this.$nextTick(() => {
        const content = this.$refs.content as HTMLElement
        if (content) {
          const maxHeight = parseInt(this.maxHeight)
          this.isOverflowing = content.scrollHeight > maxHeight
        }
      })
    },
    
    getLineNumberClasses(line: number): string[] {
      const classes = ['line-number', 'block', 'text-xs', 'leading-relaxed']
      
      if (this.highlightLines.includes(line)) {
        classes.push('highlighted')
      }
      
      return classes
    }
  },
  watch: {
    code() {
      this.$nextTick(() => {
        this.checkOverflow()
      })
    }
  }
})
</script>

<style scoped>
.code-block {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.code-language {
  @apply flex items-center gap-2;
}

.language-label {
  @apply text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded;
}

.filename-label {
  @apply text-sm font-medium text-gray-700 dark:text-gray-300;
}

.code-actions {
  @apply flex items-center gap-1;
}

.code-content {
  max-height: v-bind(expanded ? 'none' : maxHeight);
}

.line-numbers {
  width: 3rem;
  font-family: inherit;
}

.line-number.highlighted {
  @apply bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200;
}

.expand-overlay {
  @apply absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-100 dark:from-gray-900 to-transparent flex items-end justify-center pb-2;
}

.expand-button {
  @apply flex items-center px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200;
}

/* 自定义滚动条 */
.code-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.code-content::-webkit-scrollbar-track {
  background: transparent;
}

.code-content::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

.code-content::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>
