<template>
  <div
    :class="richTextClasses"
    v-html="sanitizedContent"
    v-bind="$attrs"
    v-on="$listeners"
  ></div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'RichText',
  inheritAttrs: false,
  props: {
    content: {
      type: String,
      required: true
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value: string) => ['default', 'article', 'compact'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => ['sm', 'md', 'lg', 'xl'].includes(value)
    },
    maxWidth: {
      type: String,
      default: 'none',
      validator: (value: string) => ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'].includes(value)
    },
    sanitize: {
      type: Boolean,
      default: true
    },
    allowedTags: {
      type: Array as () => string[],
      default: () => [
        'p', 'br', 'strong', 'em', 'u', 's', 'sub', 'sup',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote', 'pre', 'code',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span'
      ]
    },
    allowedAttributes: {
      type: Object as () => Record<string, string[]>,
      default: () => ({
        'a': ['href', 'title', 'target', 'rel'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        'blockquote': ['cite'],
        '*': ['class', 'id']
      })
    }
  },
  computed: {
    richTextClasses(): string[] {
      const classes = ['rich-text', 'prose', 'dark:prose-invert']
      
      // 尺寸
      switch (this.size) {
        case 'sm':
          classes.push('prose-sm')
          break
        case 'lg':
          classes.push('prose-lg')
          break
        case 'xl':
          classes.push('prose-xl')
          break
        default:
          classes.push('prose-base')
          break
      }
      
      // 最大宽度
      if (this.maxWidth !== 'none') {
        classes.push(`max-w-${this.maxWidth}`)
      } else {
        classes.push('max-w-none')
      }
      
      // 变体
      switch (this.variant) {
        case 'article':
          classes.push('prose-article')
          break
        case 'compact':
          classes.push('prose-compact')
          break
      }
      
      return classes
    },
    
    sanitizedContent(): string {
      if (!this.sanitize) {
        return this.content
      }
      
      return this.sanitizeHtml(this.content)
    }
  },
  methods: {
    sanitizeHtml(html: string): string {
      // 简单的 HTML 清理实现
      // 在生产环境中，建议使用专业的 HTML 清理库如 DOMPurify
      
      if (!html) return ''
      
      // 创建临时 DOM 元素
      const temp = document.createElement('div')
      temp.innerHTML = html
      
      // 递归清理元素
      this.cleanElement(temp)
      
      return temp.innerHTML
    },
    
    cleanElement(element: Element) {
      const children = Array.from(element.children)
      
      children.forEach(child => {
        const tagName = child.tagName.toLowerCase()
        
        // 检查标签是否允许
        if (!this.allowedTags.includes(tagName)) {
          // 移除不允许的标签，但保留内容
          const textContent = child.textContent || ''
          const textNode = document.createTextNode(textContent)
          child.parentNode?.replaceChild(textNode, child)
          return
        }
        
        // 清理属性
        const allowedAttrs = this.allowedAttributes[tagName] || this.allowedAttributes['*'] || []
        const attributes = Array.from(child.attributes)
        
        attributes.forEach(attr => {
          if (!allowedAttrs.includes(attr.name)) {
            child.removeAttribute(attr.name)
          }
        })
        
        // 递归处理子元素
        this.cleanElement(child)
      })
    }
  }
})
</script>

<style scoped>
.rich-text {
  @apply text-gray-900 dark:text-gray-100;
}

/* 基础排版样式 */
.rich-text :deep(h1),
.rich-text :deep(h2),
.rich-text :deep(h3),
.rich-text :deep(h4),
.rich-text :deep(h5),
.rich-text :deep(h6) {
  @apply font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-4 first:mt-0;
}

.rich-text :deep(h1) { @apply text-2xl; }
.rich-text :deep(h2) { @apply text-xl; }
.rich-text :deep(h3) { @apply text-lg; }
.rich-text :deep(h4) { @apply text-base; }
.rich-text :deep(h5) { @apply text-sm; }
.rich-text :deep(h6) { @apply text-xs; }

.rich-text :deep(p) {
  @apply mb-4 last:mb-0 leading-relaxed;
}

.rich-text :deep(strong) {
  @apply font-semibold;
}

.rich-text :deep(em) {
  @apply italic;
}

.rich-text :deep(u) {
  @apply underline;
}

.rich-text :deep(s) {
  @apply line-through;
}

.rich-text :deep(sub) {
  @apply text-xs align-sub;
}

.rich-text :deep(sup) {
  @apply text-xs align-super;
}

/* 列表样式 */
.rich-text :deep(ul),
.rich-text :deep(ol) {
  @apply mb-4 pl-6;
}

.rich-text :deep(ul) {
  @apply list-disc;
}

.rich-text :deep(ol) {
  @apply list-decimal;
}

.rich-text :deep(li) {
  @apply mb-1;
}

/* 引用样式 */
.rich-text :deep(blockquote) {
  @apply border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 mb-4 italic text-gray-700 dark:text-gray-300;
}

/* 代码样式 */
.rich-text :deep(code) {
  @apply bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono;
}

.rich-text :deep(pre) {
  @apply bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4 overflow-x-auto;
}

.rich-text :deep(pre code) {
  @apply bg-transparent p-0;
}

/* 链接样式 */
.rich-text :deep(a) {
  @apply text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline;
}

/* 图片样式 */
.rich-text :deep(img) {
  @apply max-w-full h-auto rounded-lg mb-4;
}

/* 表格样式 */
.rich-text :deep(table) {
  @apply w-full border-collapse border border-gray-300 dark:border-gray-600 mb-4;
}

.rich-text :deep(th),
.rich-text :deep(td) {
  @apply border border-gray-300 dark:border-gray-600 px-3 py-2 text-left;
}

.rich-text :deep(th) {
  @apply bg-gray-50 dark:bg-gray-700 font-semibold;
}

/* 变体样式 */
.rich-text.prose-article {
  @apply leading-relaxed;
}

.rich-text.prose-article :deep(p) {
  @apply mb-6;
}

.rich-text.prose-compact :deep(h1),
.rich-text.prose-compact :deep(h2),
.rich-text.prose-compact :deep(h3),
.rich-text.prose-compact :deep(h4),
.rich-text.prose-compact :deep(h5),
.rich-text.prose-compact :deep(h6) {
  @apply mt-4 mb-2;
}

.rich-text.prose-compact :deep(p) {
  @apply mb-2;
}

.rich-text.prose-compact :deep(ul),
.rich-text.prose-compact :deep(ol) {
  @apply mb-2;
}
</style>
