import { ProxySystemOperation } from '../ProxySystemOperation'
import { 
  WindowType, 
  NotificationType, 
  MessageBoxType,
  SystemEventType 
} from '../types'

/**
 * 系统操作使用示例
 */
export class SystemOperationExample {
  private sysOp: ProxySystemOperation

  constructor() {
    this.sysOp = new ProxySystemOperation()
    this.setupEventListeners()
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    // 监听窗口事件
    this.sysOp.onWindowEvent((event) => {
      console.log('Window event:', event)
    })

    // 监听托盘事件
    this.sysOp.onTrayEvent((event) => {
      console.log('Tray event:', event)
    })

    // 监听通知事件
    this.sysOp.onNotificationEvent((event) => {
      console.log('Notification event:', event)
    })

    // 监听电源事件
    this.sysOp.onPowerEvent((event) => {
      console.log('Power event:', event)
    })

    // 监听显示器事件
    this.sysOp.onDisplayEvent((event) => {
      console.log('Display event:', event)
    })
  }

  /**
   * 窗口管理示例
   */
  async windowManagementExample(): Promise<void> {
    console.log('=== Window Management Example ===')

    try {
      // 创建新窗口
      const windowResult = await this.sysOp.createWindow({
        width: 800,
        height: 600,
        title: 'Test Window',
        center: true,
        resizable: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      })

      if (windowResult.success) {
        const windowId = windowResult.data.windowId
        console.log('Window created:', windowId)

        // 获取窗口信息
        const windowInfo = await this.sysOp.getWindowInfo(windowId)
        console.log('Window info:', windowInfo)

        // 最小化窗口
        await this.sysOp.minimizeWindow(windowId)
        console.log('Window minimized')

        // 等待一秒后恢复
        setTimeout(async () => {
          await this.sysOp.focusWindow(windowId)
          console.log('Window focused')

          // 最大化窗口
          setTimeout(async () => {
            await this.sysOp.maximizeWindow(windowId)
            console.log('Window maximized')

            // 关闭窗口
            setTimeout(async () => {
              await this.sysOp.closeWindow(windowId)
              console.log('Window closed')
            }, 2000)
          }, 1000)
        }, 1000)
      }

      // 获取所有窗口
      const allWindows = await this.sysOp.getAllWindows()
      console.log('All windows:', allWindows.length)

    } catch (error) {
      console.error('Window management error:', error)
    }
  }

  /**
   * 系统托盘示例
   */
  async systemTrayExample(): Promise<void> {
    console.log('\n=== System Tray Example ===')

    try {
      // 创建系统托盘
      const trayResult = await this.sysOp.createTray({
        icon: '/path/to/tray-icon.png', // 需要提供实际的图标路径
        title: 'CmdKing',
        tooltip: 'CmdKing Application',
        menu: [
          {
            id: 'show',
            label: 'Show Window',
            type: 'normal'
          },
          {
            type: 'separator'
          },
          {
            id: 'about',
            label: 'About',
            type: 'normal'
          },
          {
            id: 'quit',
            label: 'Quit',
            type: 'normal',
            role: 'quit'
          }
        ]
      })

      if (trayResult.success) {
        console.log('Tray created successfully')

        // 更新托盘菜单
        setTimeout(async () => {
          await this.sysOp.updateTrayMenu([
            {
              id: 'status',
              label: 'Status: Running',
              type: 'normal',
              enabled: false
            },
            {
              type: 'separator'
            },
            {
              id: 'settings',
              label: 'Settings',
              type: 'normal'
            },
            {
              id: 'quit',
              label: 'Quit',
              type: 'normal'
            }
          ])
          console.log('Tray menu updated')
        }, 3000)
      }

    } catch (error) {
      console.error('System tray error:', error)
    }
  }

  /**
   * 应用菜单示例
   */
  async applicationMenuExample(): Promise<void> {
    console.log('\n=== Application Menu Example ===')

    try {
      await this.sysOp.setApplicationMenu([
        {
          label: 'File',
          submenu: [
            {
              label: 'New',
              accelerator: 'CmdOrCtrl+N'
            },
            {
              label: 'Open',
              accelerator: 'CmdOrCtrl+O'
            },
            {
              type: 'separator'
            },
            {
              label: 'Exit',
              role: 'quit'
            }
          ]
        },
        {
          label: 'Edit',
          submenu: [
            {
              label: 'Undo',
              role: 'undo'
            },
            {
              label: 'Redo',
              role: 'redo'
            },
            {
              type: 'separator'
            },
            {
              label: 'Cut',
              role: 'cut'
            },
            {
              label: 'Copy',
              role: 'copy'
            },
            {
              label: 'Paste',
              role: 'paste'
            }
          ]
        },
        {
          label: 'View',
          submenu: [
            {
              label: 'Reload',
              role: 'reload'
            },
            {
              label: 'Force Reload',
              role: 'forceReload'
            },
            {
              label: 'Toggle Developer Tools',
              role: 'toggleDevTools'
            }
          ]
        }
      ])

      console.log('Application menu set successfully')

    } catch (error) {
      console.error('Application menu error:', error)
    }
  }

  /**
   * 通知示例
   */
  async notificationExample(): Promise<void> {
    console.log('\n=== Notification Example ===')

    try {
      // 显示简单通知
      await this.sysOp.showNotification({
        title: 'Hello from CmdKing!',
        body: 'This is a test notification.',
        icon: '/path/to/notification-icon.png'
      })

      // 显示带动作的通知
      setTimeout(async () => {
        await this.sysOp.showNotification({
          title: 'Script Execution Complete',
          body: 'Your script has finished running successfully.',
          tag: 'script-complete',
          actions: [
            {
              type: 'button',
              text: 'View Results'
            },
            {
              type: 'button',
              text: 'Dismiss'
            }
          ]
        })
      }, 2000)

      console.log('Notifications shown')

    } catch (error) {
      console.error('Notification error:', error)
    }
  }

  /**
   * 剪贴板示例
   */
  async clipboardExample(): Promise<void> {
    console.log('\n=== Clipboard Example ===')

    try {
      // 写入文本到剪贴板
      await this.sysOp.writeClipboard({
        text: 'Hello from CmdKing clipboard!'
      })
      console.log('Text written to clipboard')

      // 读取剪贴板内容
      const clipboardData = await this.sysOp.readClipboard()
      console.log('Clipboard content:', clipboardData)

      // 写入 HTML 到剪贴板
      await this.sysOp.writeClipboard({
        html: '<h1>Hello from CmdKing!</h1><p>This is <strong>HTML</strong> content.</p>',
        text: 'Hello from CmdKing! This is HTML content.'
      })
      console.log('HTML written to clipboard')

      // 再次读取
      const htmlClipboard = await this.sysOp.readClipboard()
      console.log('HTML clipboard content:', htmlClipboard)

      // 清空剪贴板
      setTimeout(async () => {
        await this.sysOp.clearClipboard()
        console.log('Clipboard cleared')
      }, 3000)

    } catch (error) {
      console.error('Clipboard error:', error)
    }
  }

  /**
   * 对话框示例
   */
  async dialogExample(): Promise<void> {
    console.log('\n=== Dialog Example ===')

    try {
      // 显示消息框
      const messageResult = await this.sysOp.showMessageBox({
        type: MessageBoxType.INFO,
        title: 'Information',
        message: 'This is an information dialog',
        detail: 'This is additional detail text.',
        buttons: ['OK', 'Cancel'],
        defaultId: 0
      })
      console.log('Message box result:', messageResult)

      // 显示文件打开对话框
      const openResult = await this.sysOp.showOpenDialog({
        title: 'Select a file',
        filters: [
          { name: 'Text Files', extensions: ['txt', 'md'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile', 'multiSelections']
      })
      console.log('Open dialog result:', openResult)

      // 显示文件保存对话框
      const saveResult = await this.sysOp.showSaveDialog({
        title: 'Save file',
        defaultPath: 'untitled.txt',
        filters: [
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })
      console.log('Save dialog result:', saveResult)

      // 显示错误框
      await this.sysOp.showErrorBox('Error', 'This is an error message for demonstration.')

    } catch (error) {
      console.error('Dialog error:', error)
    }
  }

  /**
   * 硬件信息示例
   */
  async hardwareInfoExample(): Promise<void> {
    console.log('\n=== Hardware Info Example ===')

    try {
      // 获取硬件信息
      const hardwareInfo = await this.sysOp.getHardwareInfo()
      console.log('Hardware info:', hardwareInfo)

      // 获取显示器信息
      const displayInfo = await this.sysOp.getDisplayInfo()
      console.log('Display info:', displayInfo)

      // 获取应用信息
      const appInfo = await this.sysOp.getAppInfo()
      console.log('App info:', appInfo)

    } catch (error) {
      console.error('Hardware info error:', error)
    }
  }

  /**
   * 电源管理示例
   */
  async powerManagementExample(): Promise<void> {
    console.log('\n=== Power Management Example ===')

    try {
      // 获取电源信息
      const powerInfo = await this.sysOp.getPowerInfo()
      console.log('Power info:', powerInfo)

      // 阻止系统休眠
      const preventResult = await this.sysOp.preventSleep({
        type: 'prevent-display-sleep',
        reason: 'Running important script'
      })
      console.log('Sleep prevention result:', preventResult)

      // 5秒后允许休眠
      setTimeout(async () => {
        const allowResult = await this.sysOp.allowSleep(preventResult.data?.blockerKey)
        console.log('Sleep allow result:', allowResult)
      }, 5000)

    } catch (error) {
      console.error('Power management error:', error)
    }
  }

  /**
   * 其他系统功能示例
   */
  async otherSystemFeaturesExample(): Promise<void> {
    console.log('\n=== Other System Features Example ===')

    try {
      // 播放系统提示音
      await this.sysOp.beep()
      console.log('Beep played')

      // 在默认浏览器中打开 URL
      await this.sysOp.openExternal('https://github.com')
      console.log('URL opened in browser')

      // 在文件管理器中显示文件（需要提供实际存在的文件路径）
      // await this.sysOp.showItemInFolder('/path/to/some/file.txt')
      // console.log('Item shown in folder')

    } catch (error) {
      console.error('Other system features error:', error)
    }
  }

  /**
   * 运行所有示例
   */
  async runAllExamples(): Promise<void> {
    console.log('🚀 Starting System Operation Examples')
    
    try {
      await this.windowManagementExample()
      await this.systemTrayExample()
      await this.applicationMenuExample()
      await this.notificationExample()
      await this.clipboardExample()
      await this.dialogExample()
      await this.hardwareInfoExample()
      await this.powerManagementExample()
      await this.otherSystemFeaturesExample()
      
      console.log('\n✅ All examples completed successfully!')
      
    } catch (error) {
      console.error('❌ Example execution failed:', error)
    }
  }
}

// 导出示例实例
export const systemOperationExample = new SystemOperationExample()
