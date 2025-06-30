<template>
  <div
    :class="htmlViewClasses"
    v-html="processedContent"
    v-bind="$attrs"
    v-on="$listeners"
  ></div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'HTMLView',
  inheritAttrs: false,
  props: {
    content: {
      type: String,
      required: true
    },
    baseUrl: {
      type: String,
      default: ''
    },
    linkTarget: {
      type: String,
      default: '_blank',
      validator: (value: string) => ['_self', '_blank', '_parent', '_top'].includes(value)
    },
    sandbox: {
      type: Boolean,
      default: true
    },
    allowScripts: {
      type: Boolean,
      default: false
    },
    allowForms: {
      type: Boolean,
      default: false
    },
    allowPopups: {
      type: Boolean,
      default: false
    },
    interceptLinks: {
      type: Boolean,
      default: true
    },
    maxHeight: {
      type: String,
      default: ''
    },
    scrollable: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    htmlViewClasses(): string[] {
      const classes = ['html-view']
      
      if (this.scrollable) {
        classes.push('overflow-auto')
      } else {
        classes.push('overflow-hidden')
      }
      
      if (this.sandbox) {
        classes.push('html-view-sandboxed')
      }
      
      return classes
    },
    
    processedContent(): string {
      let content = this.content
      
      if (!content) return ''
      
      // 处理相对 URL
      if (this.baseUrl) {
        content = this.resolveRelativeUrls(content)
      }
      
      // 处理链接
      if (this.interceptLinks) {
        content = this.processLinks(content)
      }
      
      // 移除脚本（如果不允许）
      if (!this.allowScripts) {
        content = this.removeScripts(content)
      }
      
      // 移除表单（如果不允许）
      if (!this.allowForms) {
        content = this.removeForms(content)
      }
      
      return content
    }
  },
  mounted() {
    this.setupEventListeners()
  },
  updated() {
    this.setupEventListeners()
  },
  methods: {
    resolveRelativeUrls(html: string): string {
      if (!this.baseUrl) return html
      
      // 创建临时 DOM 元素
      const temp = document.createElement('div')
      temp.innerHTML = html
      
      // 处理图片 src
      const images = temp.querySelectorAll('img[src]')
      images.forEach(img => {
        const src = img.getAttribute('src')
        if (src && !this.isAbsoluteUrl(src)) {
          img.setAttribute('src', this.resolveUrl(src))
        }
      })
      
      // 处理链接 href
      const links = temp.querySelectorAll('a[href]')
      links.forEach(link => {
        const href = link.getAttribute('href')
        if (href && !this.isAbsoluteUrl(href) && !href.startsWith('#')) {
          link.setAttribute('href', this.resolveUrl(href))
        }
      })
      
      // 处理其他资源
      const resources = temp.querySelectorAll('[src], [href]')
      resources.forEach(element => {
        const src = element.getAttribute('src')
        const href = element.getAttribute('href')
        
        if (src && !this.isAbsoluteUrl(src)) {
          element.setAttribute('src', this.resolveUrl(src))
        }
        if (href && !this.isAbsoluteUrl(href) && !href.startsWith('#')) {
          element.setAttribute('href', this.resolveUrl(href))
        }
      })
      
      return temp.innerHTML
    },
    
    processLinks(html: string): string {
      const temp = document.createElement('div')
      temp.innerHTML = html
      
      const links = temp.querySelectorAll('a[href]')
      links.forEach(link => {
        // 设置目标
        link.setAttribute('target', this.linkTarget)
        
        // 添加安全属性
        if (this.linkTarget === '_blank') {
          link.setAttribute('rel', 'noopener noreferrer')
        }
        
        // 添加数据属性用于事件处理
        link.setAttribute('data-html-view-link', 'true')
      })
      
      return temp.innerHTML
    },
    
    removeScripts(html: string): string {
      return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    },
    
    removeForms(html: string): string {
      return html.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    },
    
    isAbsoluteUrl(url: string): boolean {
      return /^https?:\/\//.test(url) || /^\/\//.test(url)
    },
    
    resolveUrl(url: string): string {
      try {
        return new URL(url, this.baseUrl).href
      } catch {
        return url
      }
    },
    
    setupEventListeners() {
      if (!this.interceptLinks) return
      
      const links = this.$el.querySelectorAll('a[data-html-view-link]')
      links.forEach(link => {
        link.removeEventListener('click', this.handleLinkClick)
        link.addEventListener('click', this.handleLinkClick)
      })
    },
    
    handleLinkClick(event: Event) {
      const link = event.target as HTMLAnchorElement
      const href = link.getAttribute('href')
      
      if (href) {
        // 发出链接点击事件
        this.$emit('link-click', {
          href,
          text: link.textContent,
          target: link.getAttribute('target'),
          event
        })
        
        // 如果事件被阻止，则阻止默认行为
        if (event.defaultPrevented) {
          return
        }
      }
    }
  },
  beforeDestroy() {
    // 清理事件监听器
    if (this.interceptLinks) {
      const links = this.$el.querySelectorAll('a[data-html-view-link]')
      links.forEach(link => {
        link.removeEventListener('click', this.handleLinkClick)
      })
    }
  }
})
</script>

<style scoped>
.html-view {
  @apply w-full;
}

.html-view[style*="max-height"] {
  @apply overflow-auto;
}

/* 沙盒模式样式 */
.html-view-sandboxed {
  @apply bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4;
}

/* 内容样式重置 */
.html-view :deep(*) {
  @apply max-w-full;
}

.html-view :deep(img) {
  @apply h-auto;
}

.html-view :deep(table) {
  @apply table-auto border-collapse;
}

.html-view :deep(pre) {
  @apply whitespace-pre-wrap break-words;
}

.html-view :deep(code) {
  @apply break-words;
}

/* 链接样式 */
.html-view :deep(a) {
  @apply text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline;
}

/* 表格样式 */
.html-view :deep(table) {
  @apply border border-gray-300 dark:border-gray-600;
}

.html-view :deep(th),
.html-view :deep(td) {
  @apply border border-gray-300 dark:border-gray-600 px-2 py-1;
}

.html-view :deep(th) {
  @apply bg-gray-100 dark:bg-gray-800 font-semibold;
}

/* 自定义滚动条 */
.html-view::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.html-view::-webkit-scrollbar-track {
  background: transparent;
}

.html-view::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

.html-view::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>
