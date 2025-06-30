/**
 * 系统操作 IPC 通信框架类型定义
 */

// 窗口状态
export enum WindowState {
  NORMAL = 'normal',
  MINIMIZED = 'minimized',
  MAXIMIZED = 'maximized',
  FULLSCREEN = 'fullscreen',
  HIDDEN = 'hidden'
}

// 窗口类型
export enum WindowType {
  MAIN = 'main',
  MODAL = 'modal',
  POPUP = 'popup',
  SPLASH = 'splash',
  UTILITY = 'utility'
}

// 通知类型
export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success'
}

// 对话框类型
export enum DialogType {
  OPEN_FILE = 'openFile',
  OPEN_DIRECTORY = 'openDirectory',
  SAVE_FILE = 'saveFile',
  MESSAGE_BOX = 'messageBox',
  ERROR_BOX = 'errorBox'
}

// 消息框按钮类型
export enum MessageBoxType {
  NONE = 'none',
  INFO = 'info',
  ERROR = 'error',
  QUESTION = 'question',
  WARNING = 'warning'
}

// 更新状态
export enum UpdateStatus {
  CHECKING = 'checking',
  AVAILABLE = 'available',
  NOT_AVAILABLE = 'not-available',
  DOWNLOADING = 'downloading',
  DOWNLOADED = 'downloaded',
  ERROR = 'error'
}

// 电源状态
export enum PowerState {
  UNKNOWN = 'unknown',
  CHARGING = 'charging',
  DISCHARGING = 'discharging',
  NOT_CHARGING = 'not-charging',
  FULL = 'full'
}

// 窗口配置
export interface WindowConfig {
  width?: number
  height?: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  x?: number
  y?: number
  center?: boolean
  resizable?: boolean
  movable?: boolean
  minimizable?: boolean
  maximizable?: boolean
  closable?: boolean
  focusable?: boolean
  alwaysOnTop?: boolean
  fullscreen?: boolean
  kiosk?: boolean
  title?: string
  icon?: string
  show?: boolean
  frame?: boolean
  parent?: string // 父窗口ID
  modal?: boolean
  acceptFirstMouse?: boolean
  disableAutoHideCursor?: boolean
  autoHideMenuBar?: boolean
  enableLargerThanScreen?: boolean
  backgroundColor?: string
  hasShadow?: boolean
  opacity?: number
  darkTheme?: boolean
  transparent?: boolean
  type?: WindowType
  titleBarStyle?: 'default' | 'hidden' | 'hiddenInset' | 'customButtonsOnHover'
  webPreferences?: {
    nodeIntegration?: boolean
    contextIsolation?: boolean
    enableRemoteModule?: boolean
    preload?: string
    sandbox?: boolean
    webSecurity?: boolean
    allowRunningInsecureContent?: boolean
    experimentalFeatures?: boolean
  }
}

// 窗口信息
export interface WindowInfo {
  id: string
  title: string
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
  state: WindowState
  isVisible: boolean
  isFocused: boolean
  isMinimized: boolean
  isMaximized: boolean
  isFullScreen: boolean
  isAlwaysOnTop: boolean
  isModal: boolean
  parentId?: string
  type: WindowType
}

// 托盘配置
export interface TrayConfig {
  icon: string
  title?: string
  tooltip?: string
  menu?: TrayMenuItem[]
}

// 托盘菜单项
export interface TrayMenuItem {
  id?: string
  label?: string
  type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio'
  role?: string
  accelerator?: string
  icon?: string
  enabled?: boolean
  visible?: boolean
  checked?: boolean
  submenu?: TrayMenuItem[]
  click?: () => void
}

// 应用菜单项
export interface AppMenuItem {
  id?: string
  label?: string
  type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio'
  role?: string
  accelerator?: string
  icon?: string
  enabled?: boolean
  visible?: boolean
  checked?: boolean
  submenu?: AppMenuItem[]
  click?: () => void
}

// 通知配置
export interface NotificationConfig {
  title: string
  body?: string
  icon?: string
  sound?: boolean
  tag?: string
  silent?: boolean
  urgency?: 'normal' | 'critical' | 'low'
  timeoutType?: 'default' | 'never'
  actions?: NotificationAction[]
}

// 通知动作
export interface NotificationAction {
  type: string
  text: string
}

// 剪贴板数据
export interface ClipboardData {
  text?: string
  html?: string
  image?: Buffer
  rtf?: string
  bookmark?: {
    title: string
    url: string
  }
}

// 文件过滤器
export interface FileFilter {
  name: string
  extensions: string[]
}

// 文件对话框选项
export interface FileDialogOptions {
  title?: string
  defaultPath?: string
  buttonLabel?: string
  filters?: FileFilter[]
  properties?: Array<
    'openFile' | 'openDirectory' | 'multiSelections' | 
    'showHiddenFiles' | 'createDirectory' | 'promptToCreate' | 
    'noResolveAliases' | 'treatPackageAsDirectory' | 'dontAddToRecent'
  >
  message?: string // macOS only
  securityScopedBookmarks?: boolean // macOS only
}

// 消息框选项
export interface MessageBoxOptions {
  type?: MessageBoxType
  buttons?: string[]
  defaultId?: number
  title?: string
  message: string
  detail?: string
  checkboxLabel?: string
  checkboxChecked?: boolean
  icon?: string
  cancelId?: number
  noLink?: boolean
  normalizeAccessKeys?: boolean
}

// 消息框结果
export interface MessageBoxResult {
  response: number
  checkboxChecked?: boolean
}

// 更新信息
export interface UpdateInfo {
  version: string
  files: Array<{
    url: string
    sha512: string
    size: number
  }>
  path: string
  sha512: string
  releaseDate: string
  releaseName?: string
  releaseNotes?: string
}

// 下载进度
export interface DownloadProgress {
  bytesPerSecond: number
  percent: number
  transferred: number
  total: number
}

// 硬件信息
export interface HardwareInfo {
  cpu: {
    model: string
    speed: number
    cores: number
    usage?: number
  }
  memory: {
    total: number
    free: number
    used: number
    available: number
  }
  gpu?: Array<{
    vendor: string
    model: string
    memory?: number
  }>
  platform: string
  arch: string
  version: string
}

// 显示器信息
export interface DisplayInfo {
  id: number
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
  workArea: {
    x: number
    y: number
    width: number
    height: number
  }
  scaleFactor: number
  rotation: number
  touchSupport: 'available' | 'unavailable' | 'unknown'
  monochrome: boolean
  accelerometerSupport: 'available' | 'unavailable' | 'unknown'
  colorSpace: string
  colorDepth: number
  depthPerComponent: number
  displayFrequency: number
  internal: boolean
  label: string
  nativeOrigin: {
    x: number
    y: number
  }
  size: {
    width: number
    height: number
  }
  workAreaSize: {
    width: number
    height: number
  }
}

// 电池信息
export interface BatteryInfo {
  charging: boolean
  chargingTime: number
  dischargingTime: number
  level: number
}

// 电源信息
export interface PowerInfo {
  battery?: BatteryInfo
  onBattery: boolean
  state: PowerState
}

// 系统操作结果
export interface SystemOperationResult {
  success: boolean
  data?: any
  error?: string
  message?: string
}

// 系统事件类型
export enum SystemEventType {
  WINDOW_CREATED = 'window-created',
  WINDOW_CLOSED = 'window-closed',
  WINDOW_FOCUSED = 'window-focused',
  WINDOW_BLURRED = 'window-blurred',
  WINDOW_MINIMIZED = 'window-minimized',
  WINDOW_MAXIMIZED = 'window-maximized',
  WINDOW_RESTORED = 'window-restored',
  WINDOW_MOVED = 'window-moved',
  WINDOW_RESIZED = 'window-resized',
  TRAY_CLICKED = 'tray-clicked',
  TRAY_RIGHT_CLICKED = 'tray-right-clicked',
  TRAY_DOUBLE_CLICKED = 'tray-double-clicked',
  NOTIFICATION_CLICKED = 'notification-clicked',
  NOTIFICATION_CLOSED = 'notification-closed',
  NOTIFICATION_ACTION = 'notification-action',
  UPDATE_AVAILABLE = 'update-available',
  UPDATE_DOWNLOADED = 'update-downloaded',
  UPDATE_ERROR = 'update-error',
  POWER_STATE_CHANGED = 'power-state-changed',
  DISPLAY_CHANGED = 'display-changed'
}

// 系统事件
export interface SystemEvent {
  type: SystemEventType
  windowId?: string
  data?: any
  timestamp: Date
}

// 睡眠阻止器选项
export interface SleepBlockerOptions {
  type: 'prevent-app-suspension' | 'prevent-display-sleep'
  reason?: string
}

// 错误类型
export class SystemOperationError extends Error {
  constructor(
    message: string,
    public code: string,
    public operation?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'SystemOperationError'
  }
}
