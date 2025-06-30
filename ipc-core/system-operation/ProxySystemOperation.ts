import { EventEmitter } from '../../utils/EventEmitter'
import {
  WindowConfig,
  WindowInfo,
  TrayConfig,
  TrayMenuItem,
  AppMenuItem,
  NotificationConfig,
  ClipboardData,
  FileDialogOptions,
  MessageBoxOptions,
  MessageBoxResult,
  UpdateInfo,
  DownloadProgress,
  HardwareInfo,
  DisplayInfo,
  PowerInfo,
  SystemOperationResult,
  SystemEvent,
  SystemOperationError,
  SleepBlockerOptions
} from './types'

/**
 * 渲染进程系统操作代理类
 * 通过 IPC 与主进程的 MainSystemOperation 通信
 */
export class ProxySystemOperation extends EventEmitter {
  private electronAPI: any

  constructor() {
    super()
    this.electronAPI = (window as any).electronAPI
    
    if (!this.electronAPI) {
      throw new Error('Electron API not available')
    }

    this.setupEventListeners()
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    // 监听系统操作事件
    this.electronAPI.onSystemOperationEvent?.((event: SystemEvent) => {
      this.emit('systemEvent', event)
      this.emit(event.type, event)
    })
  }

  // ==================== 窗口管理 ====================

  /**
   * 创建新窗口
   */
  async createWindow(config: WindowConfig): Promise<SystemOperationResult> {
    try {
      return await this.electronAPI.systemOperation.createWindow(config)
    } catch (error) {
      throw new SystemOperationError('Failed to create window', 'WINDOW_CREATE_ERROR', 'createWindow', error)
    }
  }

  /**
   * 关闭窗口
   */
  async closeWindow(windowId: string): Promise<SystemOperationResult> {
    try {
      return await this.electronAPI.systemOperation.closeWindow(windowId)
    } catch (error) {
      throw new SystemOperationError('Failed to close window', 'WINDOW_CLOSE_ERROR', 'closeWindow', error)
    }
  }

  /**
   * 聚焦窗口
   */
  async focusWindow(windowId: string): Promise<SystemOperationResult> {
    try {
      return await this.electronAPI.systemOperation.focusWindow(windowId)
    } catch (error) {
      throw new SystemOperationError('Failed to focus window', 'WINDOW_FOCUS_ERROR', 'focusWindow', error)
    }
  }

  /**
   * 最小化窗口
   */
  async minimizeWindow(windowId: string): Promise<SystemOperationResult> {
    try {
      return await this.electronAPI.systemOperation.minimizeWindow(windowId)
    } catch (error) {
      throw new SystemOperationError('Failed to minimize window', 'WINDOW_MINIMIZE_ERROR', 'minimizeWindow', error)
    }
  }

  /**
   * 最大化窗口
   */
  async maximizeWindow(windowId: string): Promise<SystemOperationResult> {
    try {
      return await this.electronAPI.systemOperation.maximizeWindow(windowId)
    } catch (error) {
      throw new SystemOperationError('Failed to maximize window', 'WINDOW_MAXIMIZE_ERROR', 'maximizeWindow', error)
    }
  }

  /**
   * 获取窗口信息
   */
  async getWindowInfo(windowId: string): Promise<WindowInfo> {
    try {
      return await this.electronAPI.systemOperation.getWindowInfo(windowId)
    } catch (error) {
      throw new SystemOperationError('Failed to get window info', 'WINDOW_INFO_ERROR', 'getWindowInfo', error)
    }
  }

  /**
   * 获取所有窗口
   */
  async getAllWindows(): Promise<WindowInfo[]> {
    try {
      return await this.electronAPI.systemOperation.getAllWindows()
    } catch (error) {
      throw new SystemOperationError('Failed to get all windows', 'WINDOWS_LIST_ERROR', 'getAllWindows', error)
    }
  }

  // ==================== 系统托盘 ====================

  /**
   * 创建系统托盘
   */
  async createTray(config: TrayConfig): Promise<SystemOperationResult> {
    try {
      return await this.electronAPI.systemOperation.createTray(config)
    } catch (error) {
      throw new SystemOperationError('Failed to create tray', 'TRAY_CREATE_ERROR', 'createTray', error)
    }
  }

  /**
   * 更新托盘菜单
   */
  async updateTrayMenu(menu: TrayMenuItem[]): Promise<SystemOperationResult> {
    try {
      return await this.electronAPI.systemOperation.updateTrayMenu(menu)
    } catch (error) {
      throw new SystemOperationError('Failed to update tray menu', 'TRAY_MENU_ERROR', 'updateTrayMenu', error)
    }
  }

  /**
   * 销毁托盘
   */
  async destroyTray(): Promise<SystemOperationResult> {
    try {
      return await this.electronAPI.systemOperation.destroyTray()
    } catch (error) {
      throw new SystemOperationError('Failed to destroy tray', 'TRAY_DESTROY_ERROR', 'destroyTray', error)
    }
  }

  // ==================== 应用菜单 ====================

  /**
   * 设置应用菜单
   */
  async setApplicationMenu(menu: AppMenuItem[]): Promise<SystemOperationResult> {
    try {
      return await this.electronAPI.systemOperation.setApplicationMenu(menu)
    } catch (error) {
      throw new SystemOperationError('Failed to set application menu', 'APP_MENU_ERROR', 'setApplicationMenu', error)
    }
  }

  // ==================== 通知 ====================

  /**
   * 显示通知
   */
  async showNotification(config: NotificationConfig): Promise<SystemOperationResult> {
    try {
      return await this.electronAPI.systemOperation.showNotification(config)
    } catch (error) {
      throw new SystemOperationError('Failed to show notification', 'NOTIFICATION_ERROR', 'showNotification', error)
    }
  }

  // ==================== 剪贴板 ====================

  /**
   * 读取剪贴板
   */
  async readClipboard(): Promise<ClipboardData> {
    try {
      const result = await this.electronAPI.systemOperation.readClipboard()
      // 转换 Buffer 数据
      if (result.image && Array.isArray(result.image)) {
        result.image = Buffer.from(result.image)
      }
      return result
    } catch (error) {
      throw new SystemOperationError('Failed to read clipboard', 'CLIPBOARD_READ_ERROR', 'readClipboard', error)
    }
  }

  /**
   * 写入剪贴板
   */
  async writeClipboard(data: ClipboardData): Promise<SystemOperationResult> {
    try {
      // 转换 Buffer 为 Array 以便 IPC 传输
      const writeData = { ...data }
      if (writeData.image && Buffer.isBuffer(writeData.image)) {
        writeData.image = Array.from(writeData.image) as any
      }
      return await this.electronAPI.systemOperation.writeClipboard(writeData)
    } catch (error) {
      throw new SystemOperationError('Failed to write clipboard', 'CLIPBOARD_WRITE_ERROR', 'writeClipboard', error)
    }
  }

  /**
   * 清空剪贴板
   */
  async clearClipboard(): Promise<SystemOperationResult> {
    try {
      return await this.electronAPI.systemOperation.clearClipboard()
    } catch (error) {
      throw new SystemOperationError('Failed to clear clipboard', 'CLIPBOARD_CLEAR_ERROR', 'clearClipboard', error)
    }
  }

  // ==================== 原生对话框 ====================

  /**
   * 显示文件打开对话框
   */
  async showOpenDialog(options: FileDialogOptions): Promise<SystemOperationResult> {
    try {
      return await this.electronAPI.systemOperation.showOpenDialog(options)
    } catch (error) {
      throw new SystemOperationError('Failed to show open dialog', 'DIALOG_OPEN_ERROR', 'showOpenDialog', error)
    }
  }

  /**
   * 显示文件保存对话框
   */
  async showSaveDialog(options: FileDialogOptions): Promise<SystemOperationResult> {
    try {
      return await this.electronAPI.systemOperation.showSaveDialog(options)
    } catch (error) {
      throw new SystemOperationError('Failed to show save dialog', 'DIALOG_SAVE_ERROR', 'showSaveDialog', error)
    }
  }

  /**
   * 显示消息框
   */
  async showMessageBox(options: MessageBoxOptions): Promise<MessageBoxResult> {
    try {
      return await this.electronAPI.systemOperation.showMessageBox(options)
    } catch (error) {
      throw new SystemOperationError('Failed to show message box', 'DIALOG_MESSAGE_ERROR', 'showMessageBox', error)
    }
  }

  /**
   * 显示错误框
   */
  async showErrorBox(title: string, content: string): Promise<SystemOperationResult> {
    try {
      return await this.electronAPI.systemOperation.showErrorBox(title, content)
    } catch (error) {
      throw new SystemOperationError('Failed to show error box', 'DIALOG_ERROR_ERROR', 'showErrorBox', error)
    }
  }

  // ==================== 硬件信息 ====================

  /**
   * 获取硬件信息
   */
  async getHardwareInfo(): Promise<HardwareInfo> {
    try {
      return await this.electronAPI.systemOperation.getHardwareInfo()
    } catch (error) {
      throw new SystemOperationError('Failed to get hardware info', 'HARDWARE_INFO_ERROR', 'getHardwareInfo', error)
    }
  }

  /**
   * 获取显示器信息
   */
  async getDisplayInfo(): Promise<DisplayInfo[]> {
    try {
      return await this.electronAPI.systemOperation.getDisplayInfo()
    } catch (error) {
      throw new SystemOperationError('Failed to get display info', 'DISPLAY_INFO_ERROR', 'getDisplayInfo', error)
    }
  }

  // ==================== 电源管理 ====================

  /**
   * 阻止系统休眠
   */
  async preventSleep(options: SleepBlockerOptions): Promise<SystemOperationResult> {
    try {
      return await this.electronAPI.systemOperation.preventSleep(options)
    } catch (error) {
      throw new SystemOperationError('Failed to prevent sleep', 'SLEEP_PREVENT_ERROR', 'preventSleep', error)
    }
  }

  /**
   * 允许系统休眠
   */
  async allowSleep(blockerKey?: string): Promise<SystemOperationResult> {
    try {
      return await this.electronAPI.systemOperation.allowSleep(blockerKey)
    } catch (error) {
      throw new SystemOperationError('Failed to allow sleep', 'SLEEP_ALLOW_ERROR', 'allowSleep', error)
    }
  }

  /**
   * 获取电源信息
   */
  async getPowerInfo(): Promise<PowerInfo> {
    try {
      return await this.electronAPI.systemOperation.getPowerInfo()
    } catch (error) {
      throw new SystemOperationError('Failed to get power info', 'POWER_INFO_ERROR', 'getPowerInfo', error)
    }
  }

  // ==================== 其他系统功能 ====================

  /**
   * 在默认浏览器中打开 URL
   */
  async openExternal(url: string): Promise<SystemOperationResult> {
    try {
      return await this.electronAPI.systemOperation.openExternal(url)
    } catch (error) {
      throw new SystemOperationError('Failed to open URL', 'OPEN_EXTERNAL_ERROR', 'openExternal', error)
    }
  }

  /**
   * 在文件管理器中显示文件
   */
  async showItemInFolder(fullPath: string): Promise<SystemOperationResult> {
    try {
      return await this.electronAPI.systemOperation.showItemInFolder(fullPath)
    } catch (error) {
      throw new SystemOperationError('Failed to show item in folder', 'SHOW_ITEM_ERROR', 'showItemInFolder', error)
    }
  }

  /**
   * 播放系统提示音
   */
  async beep(): Promise<SystemOperationResult> {
    try {
      return await this.electronAPI.systemOperation.beep()
    } catch (error) {
      throw new SystemOperationError('Failed to play beep', 'BEEP_ERROR', 'beep', error)
    }
  }

  /**
   * 获取应用版本信息
   */
  async getAppInfo(): Promise<SystemOperationResult> {
    try {
      return await this.electronAPI.systemOperation.getAppInfo()
    } catch (error) {
      throw new SystemOperationError('Failed to get app info', 'APP_INFO_ERROR', 'getAppInfo', error)
    }
  }

  // ==================== 事件监听器 ====================

  /**
   * 监听窗口事件
   */
  onWindowEvent(callback: (event: SystemEvent) => void): void {
    const eventHandler = (customEvent: CustomEvent) => callback(customEvent.detail)
    this.on('window-created', eventHandler)
    this.on('window-closed', eventHandler)
    this.on('window-focused', eventHandler)
    this.on('window-blurred', eventHandler)
    this.on('window-minimized', eventHandler)
    this.on('window-maximized', eventHandler)
    this.on('window-restored', eventHandler)
    this.on('window-moved', eventHandler)
    this.on('window-resized', eventHandler)
  }

  /**
   * 监听托盘事件
   */
  onTrayEvent(callback: (event: SystemEvent) => void): void {
    const eventHandler = (customEvent: CustomEvent) => callback(customEvent.detail)
    this.on('tray-clicked', eventHandler)
    this.on('tray-right-clicked', eventHandler)
    this.on('tray-double-clicked', eventHandler)
  }

  /**
   * 监听通知事件
   */
  onNotificationEvent(callback: (event: SystemEvent) => void): void {
    const eventHandler = (customEvent: CustomEvent) => callback(customEvent.detail)
    this.on('notification-clicked', eventHandler)
    this.on('notification-closed', eventHandler)
    this.on('notification-action', eventHandler)
  }

  /**
   * 监听电源事件
   */
  onPowerEvent(callback: (event: SystemEvent) => void): void {
    const eventHandler = (customEvent: CustomEvent) => callback(customEvent.detail)
    this.on('power-state-changed', eventHandler)
  }

  /**
   * 监听显示器事件
   */
  onDisplayEvent(callback: (event: SystemEvent) => void): void {
    this.on('display-changed', callback)
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(event?: string): this {
    return super.removeAllListeners(event)
  }
}
