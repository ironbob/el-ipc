/**
 * 系统操作 IPC 通信框架
 * 
 * 这是一个通用的系统级功能操作框架，可以在不同的 Electron 应用之间复用。
 * 提供了完整的系统级 API 访问，包括窗口管理、托盘、菜单、通知、剪贴板、
 * 对话框、硬件信息、电源管理等功能。
 */

// 导出类型定义
export * from './types'

// 导出主进程类
export { MainSystemOperation } from './MainSystemOperation'

// 导出渲染进程代理类
export { ProxySystemOperation } from './ProxySystemOperation'

// 导出示例
export { SystemOperationExample, systemOperationExample } from './examples/SystemOperationExample'

/**
 * 快速开始指南：
 * 
 * 1. 在主进程中：
 *    ```typescript
 *    import { MainSystemOperation } from './ipc-core/system-operation'
 *    
 *    const systemOperation = new MainSystemOperation()
 *    // 设置 IPC 处理器...
 *    ```
 * 
 * 2. 在渲染进程中：
 *    ```typescript
 *    import { ProxySystemOperation } from './ipc-core/system-operation'
 *    
 *    const sysOp = new ProxySystemOperation()
 *    
 *    // 创建窗口
 *    const result = await sysOp.createWindow({
 *      width: 800,
 *      height: 600,
 *      title: 'My Window'
 *    })
 *    
 *    // 显示通知
 *    await sysOp.showNotification({
 *      title: 'Hello',
 *      body: 'This is a notification'
 *    })
 *    
 *    // 读取剪贴板
 *    const clipboard = await sysOp.readClipboard()
 *    ```
 * 
 * 3. 支持的功能：
 *    - 窗口管理：创建、关闭、聚焦、最小化、最大化窗口
 *    - 系统托盘：创建托盘图标、更新菜单
 *    - 应用菜单：动态设置应用菜单
 *    - 通知：显示系统通知
 *    - 剪贴板：读写剪贴板内容
 *    - 原生对话框：文件选择、保存、消息框
 *    - 硬件信息：获取 CPU、内存、GPU、显示器信息
 *    - 电源管理：防止休眠、获取电池状态
 *    - 其他：打开外部链接、播放提示音等
 * 
 * 4. 事件监听：
 *    ```typescript
 *    sysOp.onWindowEvent((event) => {
 *      console.log('Window event:', event)
 *    })
 *    
 *    sysOp.onTrayEvent((event) => {
 *      console.log('Tray event:', event)
 *    })
 *    
 *    sysOp.onNotificationEvent((event) => {
 *      console.log('Notification event:', event)
 *    })
 *    ```
 */

/**
 * 创建系统操作实例的工厂函数
 */
export function createSystemOperation(): ProxySystemOperation {
  return new ProxySystemOperation()
}

/**
 * 常用的系统操作工具函数
 */
export class SystemUtils {
  /**
   * 检查是否为 macOS
   */
  static isMacOS(): boolean {
    return process.platform === 'darwin'
  }

  /**
   * 检查是否为 Windows
   */
  static isWindows(): boolean {
    return process.platform === 'win32'
  }

  /**
   * 检查是否为 Linux
   */
  static isLinux(): boolean {
    return process.platform === 'linux'
  }

  /**
   * 获取平台特定的快捷键修饰符
   */
  static getCommandKey(): string {
    return this.isMacOS() ? 'Cmd' : 'Ctrl'
  }

  /**
   * 格式化内存大小
   */
  static formatMemorySize(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 格式化 CPU 频率
   */
  static formatCpuSpeed(mhz: number): string {
    if (mhz >= 1000) {
      return (mhz / 1000).toFixed(2) + ' GHz'
    }
    return mhz + ' MHz'
  }

  /**
   * 获取电池电量百分比文本
   */
  static formatBatteryLevel(level: number): string {
    return Math.round(level * 100) + '%'
  }

  /**
   * 格式化时间（秒转为可读格式）
   */
  static formatTime(seconds: number): string {
    if (seconds === Infinity) return 'Unknown'
    if (seconds < 60) return `${Math.round(seconds)}s`
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`
    return `${Math.round(seconds / 3600)}h`
  }

  /**
   * 创建标准的应用菜单模板（macOS 风格）
   */
  static createStandardMenuTemplate(appName: string = 'App'): any[] {
    const isMac = this.isMacOS()
    
    const template: any[] = [
      // macOS 应用菜单
      ...(isMac ? [{
        label: appName,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      }] : []),
      
      // 文件菜单
      {
        label: 'File',
        submenu: [
          { label: 'New', accelerator: 'CmdOrCtrl+N' },
          { label: 'Open', accelerator: 'CmdOrCtrl+O' },
          { type: 'separator' },
          { label: 'Save', accelerator: 'CmdOrCtrl+S' },
          { label: 'Save As', accelerator: 'CmdOrCtrl+Shift+S' },
          { type: 'separator' },
          ...(isMac ? [] : [{ role: 'quit' }])
        ]
      },
      
      // 编辑菜单
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          ...(isMac ? [
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
            {
              label: 'Speech',
              submenu: [
                { role: 'startSpeaking' },
                { role: 'stopSpeaking' }
              ]
            }
          ] : [
            { role: 'delete' },
            { type: 'separator' },
            { role: 'selectAll' }
          ])
        ]
      },
      
      // 视图菜单
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      
      // 窗口菜单
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' },
          ...(isMac ? [
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' }
          ] : [])
        ]
      },
      
      // 帮助菜单
      {
        role: 'help',
        submenu: [
          {
            label: 'Learn More',
            click: async () => {
              const { shell } = require('electron')
              await shell.openExternal('https://electronjs.org')
            }
          }
        ]
      }
    ]
    
    return template
  }

  /**
   * 创建简单的托盘菜单模板
   */
  static createSimpleTrayMenuTemplate(): any[] {
    return [
      {
        label: 'Show App',
        type: 'normal'
      },
      {
        type: 'separator'
      },
      {
        label: 'Preferences',
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
  }

  /**
   * 验证窗口配置
   */
  static validateWindowConfig(config: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (config.width && (config.width < 100 || config.width > 10000)) {
      errors.push('Width must be between 100 and 10000 pixels')
    }
    
    if (config.height && (config.height < 100 || config.height > 10000)) {
      errors.push('Height must be between 100 and 10000 pixels')
    }
    
    if (config.minWidth && config.maxWidth && config.minWidth > config.maxWidth) {
      errors.push('Minimum width cannot be greater than maximum width')
    }
    
    if (config.minHeight && config.maxHeight && config.minHeight > config.maxHeight) {
      errors.push('Minimum height cannot be greater than maximum height')
    }
    
    if (config.opacity && (config.opacity < 0 || config.opacity > 1)) {
      errors.push('Opacity must be between 0 and 1')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}
