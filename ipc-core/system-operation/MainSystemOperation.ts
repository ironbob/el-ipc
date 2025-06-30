import { 
  app, 
  BrowserWindow, 
  Tray, 
  Menu, 
  Notification, 
  clipboard, 
  dialog, 
  screen, 
  powerMonitor, 
  powerSaveBlocker,
  shell,
  nativeImage
} from 'electron'
import { EventEmitter } from 'events'
import { join } from 'path'
import {
  WindowConfig,
  WindowInfo,
  WindowState,
  WindowType,
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
  BatteryInfo,
  SystemOperationResult,
  SystemEvent,
  SystemEventType,
  SystemOperationError,
  SleepBlockerOptions,
  PowerState
} from './types'

/**
 * 主进程系统操作类
 * 提供所有系统级功能的具体实现
 */
export class MainSystemOperation extends EventEmitter {
  private windows: Map<string, BrowserWindow> = new Map()
  private tray: Tray | null = null
  private sleepBlockers: Map<string, number> = new Map()
  private operationId: number = 0

  constructor() {
    super()
    this.setupEventListeners()
  }

  /**
   * 生成操作ID
   */
  private generateOperationId(): string {
    return `sys_op_${Date.now()}_${++this.operationId}`
  }

  /**
   * 获取错误消息
   */
  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error)
  }

  /**
   * 设置系统事件监听
   */
  private setupEventListeners(): void {
    // 电源监控
    powerMonitor.on('suspend', () => {
      this.emitSystemEvent(SystemEventType.POWER_STATE_CHANGED, { state: 'suspend' })
    })

    powerMonitor.on('resume', () => {
      this.emitSystemEvent(SystemEventType.POWER_STATE_CHANGED, { state: 'resume' })
    })

    powerMonitor.on('on-ac', () => {
      this.emitSystemEvent(SystemEventType.POWER_STATE_CHANGED, { state: 'on-ac' })
    })

    powerMonitor.on('on-battery', () => {
      this.emitSystemEvent(SystemEventType.POWER_STATE_CHANGED, { state: 'on-battery' })
    })

    // 显示器变化
    screen.on('display-added', (event, newDisplay) => {
      this.emitSystemEvent(SystemEventType.DISPLAY_CHANGED, { type: 'added', display: newDisplay })
    })

    screen.on('display-removed', (event, oldDisplay) => {
      this.emitSystemEvent(SystemEventType.DISPLAY_CHANGED, { type: 'removed', display: oldDisplay })
    })

    screen.on('display-metrics-changed', (event, display, changedMetrics) => {
      this.emitSystemEvent(SystemEventType.DISPLAY_CHANGED, { 
        type: 'metrics-changed', 
        display, 
        changedMetrics 
      })
    })
  }

  /**
   * 发送系统事件
   */
  private emitSystemEvent(type: SystemEventType, data?: any, windowId?: string): void {
    const event: SystemEvent = {
      type,
      windowId,
      data,
      timestamp: new Date()
    }
    this.emit('systemEvent', event)
  }

  /**
   * 设置窗口事件监听
   */
  private setupWindowEventListeners(window: BrowserWindow, windowId: string): void {
    window.on('closed', () => {
      this.windows.delete(windowId)
      this.emitSystemEvent(SystemEventType.WINDOW_CLOSED, null, windowId)
    })

    window.on('focus', () => {
      this.emitSystemEvent(SystemEventType.WINDOW_FOCUSED, null, windowId)
    })

    window.on('blur', () => {
      this.emitSystemEvent(SystemEventType.WINDOW_BLURRED, null, windowId)
    })

    window.on('minimize', () => {
      this.emitSystemEvent(SystemEventType.WINDOW_MINIMIZED, null, windowId)
    })

    window.on('maximize', () => {
      this.emitSystemEvent(SystemEventType.WINDOW_MAXIMIZED, null, windowId)
    })

    window.on('restore', () => {
      this.emitSystemEvent(SystemEventType.WINDOW_RESTORED, null, windowId)
    })

    window.on('moved', () => {
      const bounds = window.getBounds()
      this.emitSystemEvent(SystemEventType.WINDOW_MOVED, { bounds }, windowId)
    })

    window.on('resized', () => {
      const bounds = window.getBounds()
      this.emitSystemEvent(SystemEventType.WINDOW_RESIZED, { bounds }, windowId)
    })
  }

  // ==================== 窗口管理 ====================

  /**
   * 创建新窗口
   */
  async createWindow(config: WindowConfig): Promise<SystemOperationResult> {
    try {
      const windowId = this.generateOperationId()
      
      const browserWindowOptions: Electron.BrowserWindowConstructorOptions = {
        width: config.width || 800,
        height: config.height || 600,
        minWidth: config.minWidth,
        minHeight: config.minHeight,
        maxWidth: config.maxWidth,
        maxHeight: config.maxHeight,
        x: config.x,
        y: config.y,
        center: config.center,
        resizable: config.resizable !== false,
        movable: config.movable !== false,
        minimizable: config.minimizable !== false,
        maximizable: config.maximizable !== false,
        closable: config.closable !== false,
        focusable: config.focusable !== false,
        alwaysOnTop: config.alwaysOnTop || false,
        fullscreen: config.fullscreen || false,
        kiosk: config.kiosk || false,
        title: config.title || 'CmdKing',
        icon: config.icon,
        show: config.show !== false,
        frame: config.frame !== false,
        modal: config.modal || false,
        acceptFirstMouse: config.acceptFirstMouse,
        disableAutoHideCursor: config.disableAutoHideCursor,
        autoHideMenuBar: config.autoHideMenuBar,
        enableLargerThanScreen: config.enableLargerThanScreen,
        backgroundColor: config.backgroundColor,
        hasShadow: config.hasShadow,
        opacity: config.opacity,
        darkTheme: config.darkTheme,
        transparent: config.transparent,
        titleBarStyle: config.titleBarStyle,
        webPreferences: {
          nodeIntegration: config.webPreferences?.nodeIntegration || false,
          contextIsolation: config.webPreferences?.contextIsolation !== false,
          // enableRemoteModule: config.webPreferences?.enableRemoteModule || false, // 已废弃
          preload: config.webPreferences?.preload,
          sandbox: config.webPreferences?.sandbox,
          webSecurity: config.webPreferences?.webSecurity,
          allowRunningInsecureContent: config.webPreferences?.allowRunningInsecureContent,
          experimentalFeatures: config.webPreferences?.experimentalFeatures
        }
      }

      // 设置父窗口
      if (config.parent) {
        const parentWindow = this.windows.get(config.parent)
        if (parentWindow) {
          browserWindowOptions.parent = parentWindow
        }
      }

      const window = new BrowserWindow(browserWindowOptions)
      this.windows.set(windowId, window)
      this.setupWindowEventListeners(window, windowId)

      this.emitSystemEvent(SystemEventType.WINDOW_CREATED, { config }, windowId)

      return {
        success: true,
        data: { windowId },
        message: 'Window created successfully'
      }
    } catch (error) {
      throw new SystemOperationError(
        `Failed to create window: ${this.getErrorMessage(error)}`,
        'WINDOW_CREATE_ERROR',
        'createWindow',
        error
      )
    }
  }

  /**
   * 关闭窗口
   */
  async closeWindow(windowId: string): Promise<SystemOperationResult> {
    try {
      const window = this.windows.get(windowId)
      if (!window) {
        throw new Error(`Window with id ${windowId} not found`)
      }

      window.close()

      return {
        success: true,
        message: 'Window closed successfully'
      }
    } catch (error) {
      throw new SystemOperationError(
        `Failed to close window: ${this.getErrorMessage(error)}`,
        'WINDOW_CLOSE_ERROR',
        'closeWindow',
        error
      )
    }
  }

  /**
   * 聚焦窗口
   */
  async focusWindow(windowId: string): Promise<SystemOperationResult> {
    try {
      const window = this.windows.get(windowId)
      if (!window) {
        throw new Error(`Window with id ${windowId} not found`)
      }

      window.focus()

      return {
        success: true,
        message: 'Window focused successfully'
      }
    } catch (error) {
      throw new SystemOperationError(
        `Failed to focus window: ${this.getErrorMessage(error)}`,
        'WINDOW_FOCUS_ERROR',
        'focusWindow',
        error
      )
    }
  }

  /**
   * 最小化窗口
   */
  async minimizeWindow(windowId: string): Promise<SystemOperationResult> {
    try {
      const window = this.windows.get(windowId)
      if (!window) {
        throw new Error(`Window with id ${windowId} not found`)
      }

      window.minimize()

      return {
        success: true,
        message: 'Window minimized successfully'
      }
    } catch (error) {
      throw new SystemOperationError(
        `Failed to minimize window: ${this.getErrorMessage(error)}`,
        'WINDOW_MINIMIZE_ERROR',
        'minimizeWindow',
        error
      )
    }
  }

  /**
   * 最大化窗口
   */
  async maximizeWindow(windowId: string): Promise<SystemOperationResult> {
    try {
      const window = this.windows.get(windowId)
      if (!window) {
        throw new Error(`Window with id ${windowId} not found`)
      }

      if (window.isMaximized()) {
        window.restore()
      } else {
        window.maximize()
      }

      return {
        success: true,
        message: 'Window maximize state toggled successfully'
      }
    } catch (error) {
      throw new SystemOperationError(
        `Failed to maximize window: ${this.getErrorMessage(error)}`,
        'WINDOW_MAXIMIZE_ERROR',
        'maximizeWindow',
        error
      )
    }
  }

  /**
   * 获取窗口信息
   */
  async getWindowInfo(windowId: string): Promise<WindowInfo> {
    try {
      const window = this.windows.get(windowId)
      if (!window) {
        throw new Error(`Window with id ${windowId} not found`)
      }

      const bounds = window.getBounds()
      
      return {
        id: windowId,
        title: window.getTitle(),
        bounds,
        state: this.getWindowState(window),
        isVisible: window.isVisible(),
        isFocused: window.isFocused(),
        isMinimized: window.isMinimized(),
        isMaximized: window.isMaximized(),
        isFullScreen: window.isFullScreen(),
        isAlwaysOnTop: window.isAlwaysOnTop(),
        isModal: window.isModal(),
        type: WindowType.MAIN // 可以根据需要扩展
      }
    } catch (error) {
      throw new SystemOperationError(
        `Failed to get window info: ${this.getErrorMessage(error)}`,
        'WINDOW_INFO_ERROR',
        'getWindowInfo',
        error
      )
    }
  }

  /**
   * 获取窗口状态
   */
  private getWindowState(window: BrowserWindow): WindowState {
    if (window.isFullScreen()) return WindowState.FULLSCREEN
    if (window.isMaximized()) return WindowState.MAXIMIZED
    if (window.isMinimized()) return WindowState.MINIMIZED
    if (!window.isVisible()) return WindowState.HIDDEN
    return WindowState.NORMAL
  }

  /**
   * 获取所有窗口
   */
  async getAllWindows(): Promise<WindowInfo[]> {
    try {
      const windowInfos: WindowInfo[] = []

      for (const [windowId, window] of this.windows) {
        const info = await this.getWindowInfo(windowId)
        windowInfos.push(info)
      }

      return windowInfos
    } catch (error) {
      throw new SystemOperationError(
        `Failed to get all windows: ${this.getErrorMessage(error)}`,
        'WINDOWS_LIST_ERROR',
        'getAllWindows',
        error
      )
    }
  }

  // ==================== 系统托盘 ====================

  /**
   * 创建系统托盘
   */
  async createTray(config: TrayConfig): Promise<SystemOperationResult> {
    try {
      if (this.tray) {
        this.tray.destroy()
      }

      const icon = nativeImage.createFromPath(config.icon)
      this.tray = new Tray(icon)

      if (config.title) {
        this.tray.setTitle(config.title)
      }

      if (config.tooltip) {
        this.tray.setToolTip(config.tooltip)
      }

      if (config.menu) {
        const menu = this.buildTrayMenu(config.menu)
        this.tray.setContextMenu(menu)
      }

      // 设置托盘事件
      this.tray.on('click', () => {
        this.emitSystemEvent(SystemEventType.TRAY_CLICKED)
      })

      this.tray.on('right-click', () => {
        this.emitSystemEvent(SystemEventType.TRAY_RIGHT_CLICKED)
      })

      this.tray.on('double-click', () => {
        this.emitSystemEvent(SystemEventType.TRAY_DOUBLE_CLICKED)
      })

      return {
        success: true,
        message: 'Tray created successfully'
      }
    } catch (error) {
      throw new SystemOperationError(
        `Failed to create tray: ${this.getErrorMessage(error)}`,
        'TRAY_CREATE_ERROR',
        'createTray',
        error
      )
    }
  }

  /**
   * 更新托盘菜单
   */
  async updateTrayMenu(menu: TrayMenuItem[]): Promise<SystemOperationResult> {
    try {
      if (!this.tray) {
        throw new Error('Tray not created')
      }

      const contextMenu = this.buildTrayMenu(menu)
      this.tray.setContextMenu(contextMenu)

      return {
        success: true,
        message: 'Tray menu updated successfully'
      }
    } catch (error) {
      throw new SystemOperationError(
        `Failed to update tray menu: ${this.getErrorMessage(error)}`,
        'TRAY_MENU_ERROR',
        'updateTrayMenu',
        error
      )
    }
  }

  /**
   * 构建托盘菜单
   */
  private buildTrayMenu(menuItems: TrayMenuItem[]): Menu {
    const template = menuItems.map(item => this.convertTrayMenuItem(item))
    return Menu.buildFromTemplate(template)
  }

  /**
   * 转换托盘菜单项
   */
  private convertTrayMenuItem(item: TrayMenuItem): Electron.MenuItemConstructorOptions {
    const menuItem: Electron.MenuItemConstructorOptions = {
      id: item.id,
      label: item.label,
      type: item.type as any,
      role: item.role as any,
      accelerator: item.accelerator,
      enabled: item.enabled,
      visible: item.visible,
      checked: item.checked
    }

    if (item.icon) {
      menuItem.icon = nativeImage.createFromPath(item.icon)
    }

    if (item.click) {
      menuItem.click = item.click
    }

    if (item.submenu) {
      menuItem.submenu = item.submenu.map(subItem => this.convertTrayMenuItem(subItem))
    }

    return menuItem
  }

  /**
   * 销毁托盘
   */
  async destroyTray(): Promise<SystemOperationResult> {
    try {
      if (this.tray) {
        this.tray.destroy()
        this.tray = null
      }

      return {
        success: true,
        message: 'Tray destroyed successfully'
      }
    } catch (error) {
      throw new SystemOperationError(
        `Failed to destroy tray: ${this.getErrorMessage(error)}`,
        'TRAY_DESTROY_ERROR',
        'destroyTray',
        error
      )
    }
  }

  // ==================== 应用菜单 ====================

  /**
   * 设置应用菜单
   */
  async setApplicationMenu(menu: AppMenuItem[]): Promise<SystemOperationResult> {
    try {
      const template = menu.map(item => this.convertAppMenuItem(item))
      const appMenu = Menu.buildFromTemplate(template)
      Menu.setApplicationMenu(appMenu)

      return {
        success: true,
        message: 'Application menu set successfully'
      }
    } catch (error) {
      throw new SystemOperationError(
        `Failed to set application menu: ${this.getErrorMessage(error)}`,
        'APP_MENU_ERROR',
        'setApplicationMenu',
        error
      )
    }
  }

  /**
   * 转换应用菜单项
   */
  private convertAppMenuItem(item: AppMenuItem): Electron.MenuItemConstructorOptions {
    const menuItem: Electron.MenuItemConstructorOptions = {
      id: item.id,
      label: item.label,
      type: item.type as any,
      role: item.role as any,
      accelerator: item.accelerator,
      enabled: item.enabled,
      visible: item.visible,
      checked: item.checked
    }

    if (item.icon) {
      menuItem.icon = nativeImage.createFromPath(item.icon)
    }

    if (item.click) {
      menuItem.click = item.click
    }

    if (item.submenu) {
      menuItem.submenu = item.submenu.map(subItem => this.convertAppMenuItem(subItem))
    }

    return menuItem
  }

  // ==================== 通知 ====================

  /**
   * 显示通知
   */
  async showNotification(config: NotificationConfig): Promise<SystemOperationResult> {
    try {
      if (!Notification.isSupported()) {
        throw new Error('Notifications are not supported on this system')
      }

      const notification = new Notification({
        title: config.title,
        body: config.body,
        icon: config.icon,
        silent: config.silent,
        urgency: config.urgency,
        timeoutType: config.timeoutType,
        actions: config.actions as Electron.NotificationAction[]
      })

      notification.on('click', () => {
        this.emitSystemEvent(SystemEventType.NOTIFICATION_CLICKED, { tag: config.tag })
      })

      notification.on('close', () => {
        this.emitSystemEvent(SystemEventType.NOTIFICATION_CLOSED, { tag: config.tag })
      })

      notification.on('action', (event, index) => {
        this.emitSystemEvent(SystemEventType.NOTIFICATION_ACTION, {
          tag: config.tag,
          actionIndex: index
        })
      })

      notification.show()

      return {
        success: true,
        message: 'Notification shown successfully'
      }
    } catch (error) {
      throw new SystemOperationError(
        `Failed to show notification: ${this.getErrorMessage(error)}`,
        'NOTIFICATION_ERROR',
        'showNotification',
        error
      )
    }
  }

  // ==================== 剪贴板 ====================

  /**
   * 读取剪贴板
   */
  async readClipboard(): Promise<ClipboardData> {
    try {
      const data: ClipboardData = {}

      if (clipboard.has('text/plain')) {
        data.text = clipboard.readText()
      }

      if (clipboard.has('text/html')) {
        data.html = clipboard.readHTML()
      }

      if (clipboard.has('text/rtf')) {
        data.rtf = clipboard.readRTF()
      }

      if (clipboard.has('image/png')) {
        const image = clipboard.readImage()
        data.image = image.toPNG()
      }

      const bookmark = clipboard.readBookmark()
      if (bookmark.title || bookmark.url) {
        data.bookmark = bookmark
      }

      return data
    } catch (error) {
      throw new SystemOperationError(
        `Failed to read clipboard: ${this.getErrorMessage(error)}`,
        'CLIPBOARD_READ_ERROR',
        'readClipboard',
        error
      )
    }
  }

  /**
   * 写入剪贴板
   */
  async writeClipboard(data: ClipboardData): Promise<SystemOperationResult> {
    try {
      if (data.text) {
        clipboard.writeText(data.text)
      }

      if (data.html) {
        clipboard.writeHTML(data.html)
      }

      if (data.rtf) {
        clipboard.writeRTF(data.rtf)
      }

      if (data.image) {
        const image = nativeImage.createFromBuffer(data.image)
        clipboard.writeImage(image)
      }

      if (data.bookmark) {
        clipboard.writeBookmark(data.bookmark.title, data.bookmark.url)
      }

      return {
        success: true,
        message: 'Clipboard written successfully'
      }
    } catch (error) {
      throw new SystemOperationError(
        `Failed to write clipboard: ${this.getErrorMessage(error)}`,
        'CLIPBOARD_WRITE_ERROR',
        'writeClipboard',
        error
      )
    }
  }

  /**
   * 清空剪贴板
   */
  async clearClipboard(): Promise<SystemOperationResult> {
    try {
      clipboard.clear()

      return {
        success: true,
        message: 'Clipboard cleared successfully'
      }
    } catch (error) {
      throw new SystemOperationError(
        `Failed to clear clipboard: ${this.getErrorMessage(error)}`,
        'CLIPBOARD_CLEAR_ERROR',
        'clearClipboard',
        error
      )
    }
  }

  // ==================== 原生对话框 ====================

  /**
   * 显示文件打开对话框
   */
  async showOpenDialog(options: FileDialogOptions): Promise<SystemOperationResult> {
    try {
      const result = await dialog.showOpenDialog({
        title: options.title,
        defaultPath: options.defaultPath,
        buttonLabel: options.buttonLabel,
        filters: options.filters,
        properties: options.properties as any,
        message: options.message,
        securityScopedBookmarks: options.securityScopedBookmarks
      })

      return {
        success: !result.canceled,
        data: {
          canceled: result.canceled,
          filePaths: result.filePaths,
          bookmarks: result.bookmarks
        },
        message: result.canceled ? 'Dialog canceled' : 'Files selected successfully'
      }
    } catch (error) {
      throw new SystemOperationError(
        `Failed to show open dialog: ${this.getErrorMessage(error)}`,
        'DIALOG_OPEN_ERROR',
        'showOpenDialog',
        error
      )
    }
  }

  /**
   * 显示文件保存对话框
   */
  async showSaveDialog(options: FileDialogOptions): Promise<SystemOperationResult> {
    try {
      const result = await dialog.showSaveDialog({
        title: options.title,
        defaultPath: options.defaultPath,
        buttonLabel: options.buttonLabel,
        filters: options.filters,
        message: options.message,
        nameFieldLabel: options.message,
        showsTagField: false
      })

      return {
        success: !result.canceled,
        data: {
          canceled: result.canceled,
          filePath: result.filePath,
          bookmark: result.bookmark
        },
        message: result.canceled ? 'Dialog canceled' : 'Save path selected successfully'
      }
    } catch (error) {
      throw new SystemOperationError(
        `Failed to show save dialog: ${this.getErrorMessage(error)}`,
        'DIALOG_SAVE_ERROR',
        'showSaveDialog',
        error
      )
    }
  }

  /**
   * 显示消息框
   */
  async showMessageBox(options: MessageBoxOptions): Promise<MessageBoxResult> {
    try {
      const result = await dialog.showMessageBox({
        type: options.type,
        buttons: options.buttons,
        defaultId: options.defaultId,
        title: options.title,
        message: options.message,
        detail: options.detail,
        checkboxLabel: options.checkboxLabel,
        checkboxChecked: options.checkboxChecked,
        icon: options.icon,
        cancelId: options.cancelId,
        noLink: options.noLink,
        normalizeAccessKeys: options.normalizeAccessKeys
      })

      return {
        response: result.response,
        checkboxChecked: result.checkboxChecked
      }
    } catch (error) {
      throw new SystemOperationError(
        `Failed to show message box: ${this.getErrorMessage(error)}`,
        'DIALOG_MESSAGE_ERROR',
        'showMessageBox',
        error
      )
    }
  }

  /**
   * 显示错误框
   */
  async showErrorBox(title: string, content: string): Promise<SystemOperationResult> {
    try {
      dialog.showErrorBox(title, content)

      return {
        success: true,
        message: 'Error box shown successfully'
      }
    } catch (error) {
      throw new SystemOperationError(
        `Failed to show error box: ${this.getErrorMessage(error)}`,
        'DIALOG_ERROR_ERROR',
        'showErrorBox',
        error
      )
    }
  }

  // ==================== 硬件信息 ====================

  /**
   * 获取硬件信息
   */
  async getHardwareInfo(): Promise<HardwareInfo> {
    try {
      const os = require('os')

      const hardwareInfo: HardwareInfo = {
        cpu: {
          model: os.cpus()[0]?.model || 'Unknown',
          speed: os.cpus()[0]?.speed || 0,
          cores: os.cpus().length
        },
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
          available: os.freemem()
        },
        platform: os.platform(),
        arch: os.arch(),
        version: os.release()
      }

      // GPU 信息暂时不可用，需要额外的库支持
      // 可以在未来添加 GPU 检测功能

      return hardwareInfo
    } catch (error) {
      throw new SystemOperationError(
        `Failed to get hardware info: ${this.getErrorMessage(error)}`,
        'HARDWARE_INFO_ERROR',
        'getHardwareInfo',
        error
      )
    }
  }

  /**
   * 获取显示器信息
   */
  async getDisplayInfo(): Promise<DisplayInfo[]> {
    try {
      const displays = screen.getAllDisplays()

      return displays.map(display => ({
        id: display.id,
        bounds: display.bounds,
        workArea: display.workArea,
        scaleFactor: display.scaleFactor,
        rotation: display.rotation,
        touchSupport: display.touchSupport,
        monochrome: display.monochrome,
        accelerometerSupport: display.accelerometerSupport,
        colorSpace: display.colorSpace,
        colorDepth: display.colorDepth,
        depthPerComponent: display.depthPerComponent,
        displayFrequency: display.displayFrequency,
        internal: display.internal,
        label: display.label,
        nativeOrigin: display.nativeOrigin,
        size: display.size,
        workAreaSize: display.workAreaSize
      }))
    } catch (error) {
      throw new SystemOperationError(
        `Failed to get display info: ${this.getErrorMessage(error)}`,
        'DISPLAY_INFO_ERROR',
        'getDisplayInfo',
        error
      )
    }
  }

  // ==================== 电源管理 ====================

  /**
   * 阻止系统休眠
   */
  async preventSleep(options: SleepBlockerOptions): Promise<SystemOperationResult> {
    try {
      const blockerId = powerSaveBlocker.start(options.type)
      const blockerKey = options.reason || 'default'
      this.sleepBlockers.set(blockerKey, blockerId)

      return {
        success: true,
        data: { blockerKey },
        message: 'Sleep prevention started successfully'
      }
    } catch (error) {
      throw new SystemOperationError(
        `Failed to prevent sleep: ${this.getErrorMessage(error)}`,
        'SLEEP_PREVENT_ERROR',
        'preventSleep',
        error
      )
    }
  }

  /**
   * 允许系统休眠
   */
  async allowSleep(blockerKey?: string): Promise<SystemOperationResult> {
    try {
      if (blockerKey) {
        const blockerId = this.sleepBlockers.get(blockerKey)
        if (blockerId !== undefined) {
          powerSaveBlocker.stop(blockerId)
          this.sleepBlockers.delete(blockerKey)
        }
      } else {
        // 停止所有阻止器
        for (const [key, blockerId] of this.sleepBlockers) {
          powerSaveBlocker.stop(blockerId)
          this.sleepBlockers.delete(key)
        }
      }

      return {
        success: true,
        message: 'Sleep prevention stopped successfully'
      }
    } catch (error) {
      throw new SystemOperationError(
        `Failed to allow sleep: ${this.getErrorMessage(error)}`,
        'SLEEP_ALLOW_ERROR',
        'allowSleep',
        error
      )
    }
  }

  /**
   * 获取电源信息
   */
  async getPowerInfo(): Promise<PowerInfo> {
    try {
      const powerInfo: PowerInfo = {
        onBattery: powerMonitor.isOnBatteryPower(),
        state: powerMonitor.isOnBatteryPower() ? PowerState.DISCHARGING : PowerState.CHARGING
      }

      // 电池信息在主进程中不直接可用
      // 可以通过其他方式获取电池信息，如系统命令或原生模块

      return powerInfo
    } catch (error) {
      throw new SystemOperationError(
        `Failed to get power info: ${this.getErrorMessage(error)}`,
        'POWER_INFO_ERROR',
        'getPowerInfo',
        error
      )
    }
  }

  // ==================== 其他系统功能 ====================

  /**
   * 在默认浏览器中打开 URL
   */
  async openExternal(url: string): Promise<SystemOperationResult> {
    try {
      await shell.openExternal(url)

      return {
        success: true,
        message: 'URL opened successfully'
      }
    } catch (error) {
      throw new SystemOperationError(
        `Failed to open URL: ${this.getErrorMessage(error)}`,
        'OPEN_EXTERNAL_ERROR',
        'openExternal',
        error
      )
    }
  }

  /**
   * 在文件管理器中显示文件
   */
  async showItemInFolder(fullPath: string): Promise<SystemOperationResult> {
    try {
      shell.showItemInFolder(fullPath)

      return {
        success: true,
        message: 'Item shown in folder successfully'
      }
    } catch (error) {
      throw new SystemOperationError(
        `Failed to show item in folder: ${this.getErrorMessage(error)}`,
        'SHOW_ITEM_ERROR',
        'showItemInFolder',
        error
      )
    }
  }

  /**
   * 播放系统提示音
   */
  async beep(): Promise<SystemOperationResult> {
    try {
      shell.beep()

      return {
        success: true,
        message: 'Beep played successfully'
      }
    } catch (error) {
      throw new SystemOperationError(
        `Failed to play beep: ${this.getErrorMessage(error)}`,
        'BEEP_ERROR',
        'beep',
        error
      )
    }
  }

  /**
   * 获取应用版本信息
   */
  async getAppInfo(): Promise<SystemOperationResult> {
    try {
      const appInfo = {
        name: app.getName(),
        version: app.getVersion(),
        path: app.getAppPath(),
        userDataPath: app.getPath('userData'),
        tempPath: app.getPath('temp'),
        desktopPath: app.getPath('desktop'),
        documentsPath: app.getPath('documents'),
        downloadsPath: app.getPath('downloads'),
        musicPath: app.getPath('music'),
        picturesPath: app.getPath('pictures'),
        videosPath: app.getPath('videos'),
        logsPath: app.getPath('logs')
      }

      return {
        success: true,
        data: appInfo,
        message: 'App info retrieved successfully'
      }
    } catch (error) {
      throw new SystemOperationError(
        `Failed to get app info: ${this.getErrorMessage(error)}`,
        'APP_INFO_ERROR',
        'getAppInfo',
        error
      )
    }
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    // 停止所有睡眠阻止器
    await this.allowSleep()

    // 销毁托盘
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
    }

    // 关闭所有窗口
    for (const [windowId, window] of this.windows) {
      if (!window.isDestroyed()) {
        window.close()
      }
    }
    this.windows.clear()
  }
}
