# 系统操作 IPC 通信框架

这是一个通用的系统级功能操作 IPC 通信框架，专为 Electron 应用设计，可以在不同的应用之间复用。框架提供了完整的系统级 API 访问，包括窗口管理、托盘、菜单、通知、剪贴板、对话框、硬件信息、电源管理等功能。

## 🚀 特性

### 窗口管理
- ✅ **createWindow** - 创建新窗口
- ✅ **closeWindow** - 关闭窗口
- ✅ **focusWindow** - 聚焦窗口
- ✅ **minimizeWindow** - 最小化窗口
- ✅ **maximizeWindow** - 最大化窗口
- ✅ **getWindowInfo** - 获取窗口信息
- ✅ **getAllWindows** - 获取所有窗口

### 系统托盘
- ✅ **createTray** - 创建托盘图标
- ✅ **updateTrayMenu** - 更新托盘菜单
- ✅ **destroyTray** - 销毁托盘

### 应用菜单
- ✅ **setApplicationMenu** - 动态设置应用菜单

### 通知系统
- ✅ **showNotification** - 显示系统通知
- ✅ 支持通知动作和事件监听

### 剪贴板操作
- ✅ **readClipboard** - 读取剪贴板内容
- ✅ **writeClipboard** - 写入剪贴板内容
- ✅ **clearClipboard** - 清空剪贴板
- ✅ 支持文本、HTML、图片、RTF、书签

### 原生对话框
- ✅ **showOpenDialog** - 文件打开对话框
- ✅ **showSaveDialog** - 文件保存对话框
- ✅ **showMessageBox** - 消息框
- ✅ **showErrorBox** - 错误框

### 硬件信息
- ✅ **getHardwareInfo** - 获取 CPU、内存、GPU 信息
- ✅ **getDisplayInfo** - 获取显示器信息

### 电源管理
- ✅ **preventSleep** - 阻止系统休眠
- ✅ **allowSleep** - 允许系统休眠
- ✅ **getPowerInfo** - 获取电源和电池状态

### 其他系统功能
- ✅ **openExternal** - 在默认浏览器中打开 URL
- ✅ **showItemInFolder** - 在文件管理器中显示文件
- ✅ **beep** - 播放系统提示音
- ✅ **getAppInfo** - 获取应用信息

## 📁 项目结构

```
src/ipc-core/system-operation/
├── types.ts                      # 完整的类型定义
├── MainSystemOperation.ts        # 主进程实现
├── ProxySystemOperation.ts       # 渲染进程代理
├── examples/
│   └── SystemOperationExample.ts # 使用示例
├── index.ts                      # 导出和工具函数
└── README.md                     # 文档
```

## 🛠️ 使用方法

### 基础使用

```typescript
import { ProxySystemOperation } from './ipc-core/system-operation'

const sysOp = new ProxySystemOperation()

// 创建窗口
const windowResult = await sysOp.createWindow({
  width: 800,
  height: 600,
  title: 'My Window',
  center: true
})

// 显示通知
await sysOp.showNotification({
  title: 'Hello',
  body: 'This is a notification'
})

// 读取剪贴板
const clipboard = await sysOp.readClipboard()
console.log('Clipboard text:', clipboard.text)
```

### 窗口管理

```typescript
// 创建窗口
const result = await sysOp.createWindow({
  width: 1200,
  height: 800,
  title: 'CmdKing',
  center: true,
  resizable: true,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true
  }
})

const windowId = result.data.windowId

// 窗口操作
await sysOp.minimizeWindow(windowId)
await sysOp.maximizeWindow(windowId)
await sysOp.focusWindow(windowId)

// 获取窗口信息
const windowInfo = await sysOp.getWindowInfo(windowId)
console.log('Window bounds:', windowInfo.bounds)
```

### 系统托盘

```typescript
// 创建托盘
await sysOp.createTray({
  icon: '/path/to/tray-icon.png',
  title: 'CmdKing',
  tooltip: 'CmdKing Application',
  menu: [
    {
      label: 'Show Window',
      type: 'normal'
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      type: 'normal',
      role: 'quit'
    }
  ]
})

// 更新托盘菜单
await sysOp.updateTrayMenu([
  {
    label: 'Status: Running',
    enabled: false
  },
  {
    type: 'separator'
  },
  {
    label: 'Settings'
  }
])
```

### 通知系统

```typescript
// 简单通知
await sysOp.showNotification({
  title: 'Task Complete',
  body: 'Your script has finished running.',
  icon: '/path/to/icon.png'
})

// 带动作的通知
await sysOp.showNotification({
  title: 'New Message',
  body: 'You have a new message.',
  actions: [
    { type: 'button', text: 'Reply' },
    { type: 'button', text: 'Dismiss' }
  ]
})
```

### 剪贴板操作

```typescript
// 写入文本
await sysOp.writeClipboard({
  text: 'Hello, World!'
})

// 写入 HTML
await sysOp.writeClipboard({
  html: '<h1>Hello</h1><p>World!</p>',
  text: 'Hello World!'
})

// 读取剪贴板
const data = await sysOp.readClipboard()
console.log('Text:', data.text)
console.log('HTML:', data.html)
```

### 对话框

```typescript
// 文件选择对话框
const openResult = await sysOp.showOpenDialog({
  title: 'Select files',
  filters: [
    { name: 'Text Files', extensions: ['txt', 'md'] },
    { name: 'All Files', extensions: ['*'] }
  ],
  properties: ['openFile', 'multiSelections']
})

if (!openResult.data.canceled) {
  console.log('Selected files:', openResult.data.filePaths)
}

// 消息框
const messageResult = await sysOp.showMessageBox({
  type: 'question',
  title: 'Confirm',
  message: 'Are you sure?',
  buttons: ['Yes', 'No'],
  defaultId: 0
})

console.log('User clicked:', messageResult.response === 0 ? 'Yes' : 'No')
```

### 硬件信息

```typescript
// 获取硬件信息
const hardware = await sysOp.getHardwareInfo()
console.log('CPU:', hardware.cpu.model)
console.log('Memory:', hardware.memory.total / 1024 / 1024 / 1024, 'GB')

// 获取显示器信息
const displays = await sysOp.getDisplayInfo()
displays.forEach((display, index) => {
  console.log(`Display ${index}:`, display.bounds)
})
```

### 电源管理

```typescript
// 获取电源状态
const power = await sysOp.getPowerInfo()
console.log('On battery:', power.onBattery)
console.log('Battery level:', power.battery?.level)

// 阻止休眠
const preventResult = await sysOp.preventSleep({
  type: 'prevent-display-sleep',
  reason: 'Running important task'
})

// 稍后允许休眠
setTimeout(async () => {
  await sysOp.allowSleep(preventResult.data.blockerKey)
}, 60000) // 1分钟后
```

### 事件监听

```typescript
// 监听窗口事件
sysOp.onWindowEvent((event) => {
  console.log('Window event:', event.type, event.windowId)
})

// 监听托盘事件
sysOp.onTrayEvent((event) => {
  if (event.type === 'tray-clicked') {
    console.log('Tray clicked')
  }
})

// 监听通知事件
sysOp.onNotificationEvent((event) => {
  if (event.type === 'notification-clicked') {
    console.log('Notification clicked')
  }
})

// 监听电源事件
sysOp.onPowerEvent((event) => {
  console.log('Power state changed:', event.data)
})
```

## 🔧 配置选项

### 窗口配置

```typescript
interface WindowConfig {
  width?: number
  height?: number
  x?: number
  y?: number
  center?: boolean
  resizable?: boolean
  minimizable?: boolean
  maximizable?: boolean
  title?: string
  icon?: string
  frame?: boolean
  transparent?: boolean
  alwaysOnTop?: boolean
  // ... 更多选项
}
```

### 通知配置

```typescript
interface NotificationConfig {
  title: string
  body?: string
  icon?: string
  sound?: boolean
  silent?: boolean
  urgency?: 'normal' | 'critical' | 'low'
  actions?: NotificationAction[]
}
```

## 🧪 测试

运行示例代码：

```typescript
import { systemOperationExample } from './ipc-core/system-operation'

// 运行所有示例
await systemOperationExample.runAllExamples()
```

## 📝 API 参考

详细的 API 文档请参考 `types.ts` 文件中的类型定义。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个框架。

## 📄 许可证

MIT License
