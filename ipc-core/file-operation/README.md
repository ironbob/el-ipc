# 文件操作 IPC 通信框架

这是一个通用的文件操作 IPC 通信框架，专为 Electron 应用设计，可以在不同的应用之间复用。框架提供了完整的文件操作功能，支持多种协议和丰富的操作类型。

## 🚀 特性

### 基础文件操作
- ✅ **read** - 读取文件（二进制）
- ✅ **readText** - 读取文本文件（自动编码检测）
- ✅ **write** - 写入文件
- ✅ **stat** - 获取文件统计信息
- ✅ **delete** - 删除文件或目录
- ✅ **listFiles** - 列出目录内容
- ✅ **rename** - 重命名文件或目录
- ✅ **newFile** - 创建新文件
- ✅ **newDir** - 创建新目录

### 高级文件操作
- ✅ **moveFiles** - 移动文件或目录
- ✅ **copyFiles** - 复制文件或目录
- ✅ **zipFiles** - 压缩文件或目录
- ✅ **extractZip** - 解压缩文件

### 工具功能
- ✅ **getFileHash** - 计算文件哈希值
- ✅ **compareFiles** - 比较两个文件
- ✅ **自动编码检测** - 支持多种文本编码
- ✅ **进度监控** - 实时操作进度反馈
- ✅ **事件系统** - 完整的事件通知机制

### 协议支持
- ✅ **LOCAL** - 本地文件系统
- 🚧 **HTTP/HTTPS** - HTTP 协议（计划支持）
- 🚧 **SMB** - SMB 网络共享（计划支持）
- 🚧 **FTP/SFTP** - FTP 协议（计划支持）
- 🚧 **S3** - AWS S3（计划支持）
- 🚧 **WebDAV** - WebDAV 协议（计划支持）

## 📁 项目结构

```
src/ipc-core/file-operation/
├── types.ts                    # 类型定义
├── MainFileOperation.ts        # 主进程实现
├── ProxyFileOperation.ts       # 渲染进程代理
├── examples/
│   └── FileOperationExample.ts # 使用示例
├── index.ts                    # 导出文件
└── README.md                   # 文档
```

## 🛠️ 安装和配置

### 1. 依赖安装

```bash
pnpm add archiver unzipper
pnpm add -D @types/archiver @types/unzipper
```

### 2. 主进程集成

在主进程中集成文件操作服务：

```typescript
// electron/app.ts
import { MainFileOperation } from '../src/ipc-core/file-operation'

let fileOperation: MainFileOperation | null = null

// 初始化服务
async function initializeServices() {
  fileOperation = new MainFileOperation()
  
  // 设置事件转发
  fileOperation.on('operationStart', (data) => {
    mainWindow?.webContents.send('file-operation-event', { type: 'operationStart', data })
  })
  
  fileOperation.on('operationProgress', (data) => {
    mainWindow?.webContents.send('file-operation-event', { type: 'operationProgress', data })
  })
  
  fileOperation.on('operationComplete', (data) => {
    mainWindow?.webContents.send('file-operation-event', { type: 'operationComplete', data })
  })
}

// 设置 IPC 处理器
function setupIpcHandlers() {
  ipcMain.handle('file-operation:read', async (_, path, protocol, options) => {
    const result = await fileOperation!.read(path, protocol, options)
    return Array.from(result) // Convert Buffer to Array for IPC
  })
  
  ipcMain.handle('file-operation:write', async (_, path, data, protocol, options) => {
    const writeData = Array.isArray(data) ? Buffer.from(data) : data
    return await fileOperation!.write(path, writeData, protocol, options)
  })
  
  // ... 其他 IPC 处理器
}
```

### 3. 预加载脚本配置

在 preload.ts 中添加 API 暴露：

```typescript
// electron/preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
  fileOperation: {
    read: (path: string, protocol: string, options: any) => 
      ipcRenderer.invoke('file-operation:read', path, protocol, options),
    write: (path: string, data: any, protocol: string, options: any) => 
      ipcRenderer.invoke('file-operation:write', path, data, protocol, options),
    // ... 其他方法
  },
  
  onFileOperationEvent: (callback: (event: any) => void) => {
    ipcRenderer.on('file-operation-event', (_, event) => callback(event))
  }
})
```

## 📖 使用指南

### 基础使用

```typescript
import { ProxyFileOperation, FileProtocol, FileEncoding } from './ipc-core/file-operation'

const fileOp = new ProxyFileOperation()

// 读取文件
const content = await fileOp.readText('/path/to/file.txt', FileProtocol.LOCAL)
console.log('File content:', content.content)
console.log('Detected encoding:', content.encoding)

// 写入文件
await fileOp.write('/path/to/file.txt', 'Hello World', FileProtocol.LOCAL, {
  encoding: FileEncoding.UTF8
})

// 获取文件信息
const stats = await fileOp.stat('/path/to/file.txt', FileProtocol.LOCAL)
console.log('File size:', stats.size)
console.log('Modified time:', stats.mtime)

// 列出目录
const files = await fileOp.listFiles('/path/to/directory', FileProtocol.LOCAL, {
  recursive: true,
  sortBy: 'name',
  sortOrder: 'asc'
})
```

### 高级操作

```typescript
// 复制文件
const copyResult = await fileOp.copyFiles(
  ['/source/file1.txt', '/source/file2.txt'],
  '/destination',
  FileProtocol.LOCAL,
  {
    preserveTimestamps: true,
    overwrite: false
  }
)

// 压缩文件
const zipResult = await fileOp.zipFiles(
  ['/path/to/folder'],
  '/path/to/archive.zip',
  FileProtocol.LOCAL,
  {
    compression: 'best',
    password: 'secret'
  }
)

// 解压文件
const extractResult = await fileOp.extractZip(
  '/path/to/archive.zip',
  '/path/to/extract',
  FileProtocol.LOCAL,
  {
    overwrite: true,
    password: 'secret'
  }
)
```

### 事件监听

```typescript
// 监听操作进度
fileOp.onProgress((progress) => {
  console.log(`Progress: ${progress.percentage}%`)
  console.log(`Current file: ${progress.currentFile}`)
})

// 监听操作开始
fileOp.onOperationStart((data) => {
  console.log('Operation started:', data.type)
})

// 监听操作完成
fileOp.onOperationComplete((data) => {
  console.log('Operation completed:', data.result)
})
```

### 文本编码处理

```typescript
// 自动检测编码
const result = await fileOp.readText('/path/to/file.txt', FileProtocol.LOCAL)
console.log('Detected encoding:', result.encoding)
console.log('Confidence:', result.confidence)
console.log('Has BOM:', result.bom)

// 指定编码读取
const utf16Result = await fileOp.readText('/path/to/file.txt', FileProtocol.LOCAL, {
  encoding: FileEncoding.UTF16LE
})

// 指定编码写入
await fileOp.write('/path/to/file.txt', 'Content', FileProtocol.LOCAL, {
  encoding: FileEncoding.UTF8
})
```

### 文件比较和哈希

```typescript
// 计算文件哈希
const hash = await fileOp.getFileHash('/path/to/file.txt', FileProtocol.LOCAL, {
  algorithm: 'sha256'
})

// 比较两个文件
const comparison = await fileOp.compareFiles(
  '/path/to/file1.txt',
  '/path/to/file2.txt',
  FileProtocol.LOCAL
)

console.log('Files identical:', comparison.identical)
console.log('Size difference:', comparison.sizeDiff)
console.log('Content different:', comparison.contentDiff)
```

## 🔧 扩展协议

框架设计支持多种协议扩展。要添加新协议支持：

1. 在 `types.ts` 中添加新的协议类型和选项
2. 在 `MainFileOperation.ts` 中实现协议处理逻辑
3. 更新 `validateProtocol` 方法

```typescript
// 示例：添加 HTTP 协议支持
case FileProtocol.HTTP:
  // 实现 HTTP 文件操作逻辑
  break
```

## 🧪 测试

运行示例代码：

```typescript
import { fileOperationExample } from './ipc-core/file-operation'

// 运行所有示例
await fileOperationExample.runAllExamples()
```

## 📝 API 参考

详细的 API 文档请参考 `types.ts` 文件中的类型定义。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个框架。

## 📄 许可证

MIT License
