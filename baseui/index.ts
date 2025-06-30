/**
 * BaseUI - macOS 风格的 Vue 组件库
 *
 * 这是一个完整的 macOS 风格组件库，使用 Tailwind CSS 构建，
 * 提供了丰富的组件和工具函数，可以快速构建现代化的用户界面。
 */

// 类型定义
export * from './types'

// 工具函数
export * from './utils/styles'

// 按钮组件
export * from './components/buttons'

// 文本组件
export * from './components/text'

// 表单组件
export * from './components/forms'

// 容器组件
export * from './components/containers'

/**
 * 版本信息
 */
export const VERSION = '1.0.0'

/**
 * 组件库信息
 */
export const BASEUI_INFO = {
  name: 'BaseUI',
  version: VERSION,
  description: 'macOS 风格的 React 组件库',
  author: 'CmdKing Team',
  license: 'MIT',
  repository: 'https://github.com/cmdking/baseui',
  documentation: 'https://baseui.cmdking.dev',
}

/**
 * 快速开始指南
 * 
 * 1. 安装依赖：
 *    ```bash
 *    npm install @cmdking/baseui
 *    ```
 * 
 * 2. 导入样式：
 *    ```css
 *    @import '@cmdking/baseui/dist/styles.css';
 *    ```
 * 
 * 3. 使用组件：
 *    ```tsx
 *    import { Button, Card, Text } from '@cmdking/baseui'
 *    
 *    function App() {
 *      return (
 *        <Card>
 *          <Text variant="h1">Hello BaseUI!</Text>
 *          <Button variant="primary">Click me</Button>
 *        </Card>
 *      )
 *    }
 *    ```
 * 
 * 4. 主题配置：
 *    ```tsx
 *    import { ToastProvider } from '@cmdking/baseui'
 *    
 *    function App() {
 *      return (
 *        <ToastProvider position="top-right">
 *          <YourApp />
 *        </ToastProvider>
 *      )
 *    }
 *    ```
 */

/**
 * 组件分类
 */
export const COMPONENT_CATEGORIES = {
  layout: [
    'Stack', 'HStack', 'VStack',
    'Grid', 'GridItem',
    'SplitView', 'Pane',
    'Tabs', 'TabPanel',
    'Toolbar', 'ToolbarGroup', 'ToolbarSeparator', 'ToolbarButton',
    'Sidebar', 'SidebarSection',
    'Modal', 'Sheet',
    'Popover', 'PopoverContent',
    'Divider', 'Spacer', 'HSpacer', 'VSpacer'
  ],
  text: [
    'Text', 'Label', 'Heading',
    'Link', 'TextLink', 'ButtonLink',
    'CodeBlock', 'InlineCode', 'CodeEditor'
  ],
  buttons: [
    'Button', 'IconButton', 'ToggleButton',
    'SegmentedControl', 'DisclosureButton'
  ],
  forms: [
    'TextField', 'SecureField', 'TextArea',
    'SearchField', 'QuickSearch',
    'Select', 'ComboBox',
    'Checkbox', 'RadioButton', 'RadioGroup',
    'Slider', 'Stepper'
  ],
  feedback: [
    'Alert', 'AlertTitle', 'AlertDescription', 'AlertActions',
    'Toast', 'ToastContainer', 'ToastProvider',
    'Progress', 'CircularProgress', 'Spinner', 'ProgressSteps'
  ],
  lists: [
    'List', 'SimpleList', 'DescriptionList', 'ActionList',
    'TreeView', 'FileTree'
  ],
  containers: [
    'Card', 'CardHeader', 'CardContent', 'CardFooter', 'StatsCard', 'FeatureCard',
    'Panel', 'GroupBox', 'Section', 'Box'
  ],
  views: [
    'ImageView', 'Avatar', 'AvatarGroup', 'Icon'
  ]
} as const

/**
 * 设计原则
 */
export const DESIGN_PRINCIPLES = {
  consistency: '保持设计的一致性，遵循 macOS 设计规范',
  accessibility: '确保所有组件都具有良好的可访问性',
  performance: '优化性能，减少不必要的重渲染',
  flexibility: '提供灵活的 API，支持自定义和扩展',
  simplicity: '保持 API 简单易用，降低学习成本'
} as const

/**
 * 主题配置
 */
export const DEFAULT_THEME = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#5AC8FA',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: {
      primary: '#000000',
      secondary: '#3C3C43',
      disabled: '#8E8E93'
    },
    border: '#C6C6C8'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  }
} as const
