# BaseUI - macOS 风格的 Vue 组件库

一个完整的、现代化的 Vue 2.7 组件库，采用 macOS 设计风格，使用 Tailwind CSS 构建。专为 CmdKing 项目设计，提供了丰富的组件和工具函数，帮助您快速构建美观、一致的用户界面。

## ✨ 特性

- 🎨 **macOS 设计风格** - 遵循 Apple Human Interface Guidelines
- 🌙 **深色模式支持** - 完整的深色主题适配
- 📱 **响应式设计** - 适配不同屏幕尺寸
- ♿ **无障碍友好** - 支持键盘导航和屏幕阅读器
- 🔧 **TypeScript 支持** - 完整的类型定义
- 🎭 **主题定制** - 灵活的主题系统
- 📦 **按需引入** - 支持 Tree Shaking
- ⚡ **Vue 2.7 优化** - 充分利用 Vue 2.7 的新特性

## 📦 安装

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

## 🚀 快速开始

### 1. 导入样式

在您的应用入口文件中导入 BaseUI 样式：

```css
/* 在您的 CSS 文件中 */
@import '@cmdking/baseui/dist/styles.css';
```

### 2. 使用组件

```tsx
import React from 'react'
import { Button, Card, Text, VStack } from '@cmdking/baseui'

function App() {
  return (
    <Card padding="lg">
      <VStack spacing={4}>
        <Text variant="h1">欢迎使用 BaseUI</Text>
        <Text variant="body1" color="secondary">
          这是一个 macOS 风格的 React 组件库
        </Text>
        <Button variant="primary" size="lg">
          开始使用
        </Button>
      </VStack>
    </Card>
  )
}

export default App
```

### 3. 配置 Toast 提供者

```tsx
import React from 'react'
import { ToastProvider } from '@cmdking/baseui'
import App from './App'

function Root() {
  return (
    <ToastProvider position="top-right">
      <App />
    </ToastProvider>
  )
}

export default Root
```

## 📚 组件分类

### 🏗️ 布局组件
- **Stack** - 灵活的堆叠布局容器
- **Grid** - CSS Grid 布局系统
- **SplitView** - 可调整大小的分割视图
- **Tabs** - 标签页容器
- **Toolbar** - 工具栏
- **Sidebar** - 侧边栏导航
- **Modal/Sheet** - 模态框和抽屉
- **Popover** - 弹出框
- **Divider/Spacer** - 分割线和间距

### 📝 文本组件
- **Text** - 文本显示组件
- **Heading** - 标题组件
- **Label** - 标签组件
- **Link** - 链接组件
- **CodeBlock** - 代码块显示

### 🔘 按钮组件
- **Button** - 基础按钮
- **IconButton** - 图标按钮
- **ToggleButton** - 切换按钮
- **SegmentedControl** - 分段控制器
- **DisclosureButton** - 展开/收起按钮

### 📋 表单组件
- **TextField** - 文本输入框
- **SecureField** - 密码输入框
- **TextArea** - 多行文本输入
- **SearchField** - 搜索输入框
- **Select** - 选择器
- **Checkbox** - 复选框
- **RadioButton** - 单选按钮
- **Slider** - 滑块
- **Stepper** - 数字步进器

### 💬 反馈组件
- **Alert** - 警告提示
- **Toast** - 消息提示
- **Progress** - 进度条
- **Spinner** - 加载旋转器
- **ProgressSteps** - 步骤进度条

### 📋 列表组件
- **List** - 基础列表
- **TreeView** - 树形视图
- **FileTree** - 文件树
- **ActionList** - 操作列表

### 📦 容器组件
- **Card** - 卡片容器
- **Panel** - 面板容器
- **Section** - 区域容器
- **Box** - 通用容器

### 🖼️ 视图组件
- **ImageView** - 图片显示
- **Avatar** - 头像组件
- **Icon** - 图标容器

## 🎨 主题定制

BaseUI 使用 Tailwind CSS 构建，您可以通过以下方式自定义主题：

### 1. Tailwind 配置

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  }
}
```

### 2. CSS 变量

```css
:root {
  --baseui-primary: #007AFF;
  --baseui-secondary: #5856D6;
  --baseui-success: #34C759;
  --baseui-warning: #FF9500;
  --baseui-error: #FF3B30;
}
```

## 🔧 高级用法

### 使用 Toast

```tsx
import { useToast } from '@cmdking/baseui'

function MyComponent() {
  const { toast } = useToast()
  
  const handleClick = () => {
    toast.success('操作成功', '您的操作已成功完成')
  }
  
  return (
    <Button onClick={handleClick}>
      显示提示
    </Button>
  )
}
```

### 表单验证

```tsx
import { TextField, Button, VStack } from '@cmdking/baseui'
import { useState } from 'react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!email) {
      newErrors.email = '请输入邮箱地址'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }
    
    if (!password) {
      newErrors.password = '请输入密码'
    } else if (password.length < 6) {
      newErrors.password = '密码至少需要 6 个字符'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = () => {
    if (validate()) {
      // 提交表单
      console.log('登录', { email, password })
    }
  }
  
  return (
    <VStack spacing={4}>
      <TextField
        label="邮箱"
        type="email"
        value={email}
        onChange={setEmail}
        error={!!errors.email}
        helperText={errors.email}
        required
      />
      
      <TextField
        label="密码"
        type="password"
        value={password}
        onChange={setPassword}
        error={!!errors.password}
        helperText={errors.password}
        required
      />
      
      <Button variant="primary" onClick={handleSubmit} fullWidth>
        登录
      </Button>
    </VStack>
  )
}
```

## 🤝 贡献

我们欢迎所有形式的贡献！请查看我们的[贡献指南](CONTRIBUTING.md)了解更多信息。

### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/cmdking/baseui.git

# 安装依赖
cd baseui
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test

# 构建
pnpm build
```

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Tailwind CSS](https://tailwindcss.com/) - 提供了强大的 CSS 框架
- [Headless UI](https://headlessui.dev/) - 提供了无障碍访问的组件基础
- [Apple Design Resources](https://developer.apple.com/design/resources/) - 提供了 macOS 设计规范

## 📞 支持

如果您在使用过程中遇到问题，可以通过以下方式获取帮助：

- 📖 [文档](https://baseui.cmdking.dev)
- 🐛 [问题反馈](https://github.com/cmdking/baseui/issues)
- 💬 [讨论区](https://github.com/cmdking/baseui/discussions)
- 📧 [邮件支持](mailto:support@cmdking.dev)
