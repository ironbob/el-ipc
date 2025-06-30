/**
 * BaseUI 组件库类型定义
 */

// 基础类型
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type Variant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'warning' | 'success'
export type Color = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray' | 'indigo' | 'pink'
export type Position = 'top' | 'bottom' | 'left' | 'right'
export type Alignment = 'start' | 'center' | 'end' | 'stretch'

// 布局相关
export interface StackProps {
  direction?: 'horizontal' | 'vertical'
  spacing?: number | string
  alignment?: Alignment
  distribution?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'
  wrap?: boolean
  className?: string
  children: React.ReactNode
}

export interface GridProps {
  columns?: number | string
  rows?: number | string
  gap?: number | string
  className?: string
  children: React.ReactNode
}

export interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
  content: React.ReactNode
  disabled?: boolean
  closable?: boolean
}

export interface TabsProps {
  items: TabItem[]
  activeTab?: string
  onTabChange?: (tabId: string) => void
  onTabClose?: (tabId: string) => void
  variant?: 'default' | 'pills' | 'underline'
  size?: Size
  className?: string
}

// 按钮相关
export interface ButtonProps {
  variant?: Variant
  size?: Size
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  className?: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  children?: React.ReactNode
}

export interface IconButtonProps {
  icon: React.ReactNode
  size?: Size
  variant?: Variant
  disabled?: boolean
  loading?: boolean
  tooltip?: string
  className?: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export interface ToggleButtonProps {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  disabled?: boolean
  size?: Size
  variant?: Variant
  icon?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

export interface SegmentedControlItem {
  id: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

export interface SegmentedControlProps {
  items: SegmentedControlItem[]
  value?: string
  onValueChange?: (value: string) => void
  size?: Size
  fullWidth?: boolean
  className?: string
}

// 表单相关
export interface TextFieldProps {
  value?: string
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  error?: boolean
  helperText?: string
  label?: string
  size?: Size
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  className?: string
  onChange?: (value: string) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
}

export interface TextAreaProps {
  value?: string
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  error?: boolean
  helperText?: string
  label?: string
  rows?: number
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  className?: string
  onChange?: (value: string) => void
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void
}

export interface SearchFieldProps extends Omit<TextFieldProps, 'type'> {
  onSearch?: (value: string) => void
  onClear?: () => void
  showClearButton?: boolean
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  icon?: React.ReactNode
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
  error?: boolean
  helperText?: string
  label?: string
  size?: Size
  searchable?: boolean
  clearable?: boolean
  multiple?: boolean
  className?: string
  onChange?: (value: string | string[]) => void
}

// 反馈相关
export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  description?: string
  icon?: React.ReactNode
  closable?: boolean
  onClose?: () => void
  className?: string
  children?: React.ReactNode
}

export interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  className?: string
  children: React.ReactNode
}

export interface ToastProps {
  id?: string
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  description?: string
  duration?: number
  closable?: boolean
  onClose?: () => void
}

export interface ProgressProps {
  value?: number
  max?: number
  size?: Size
  variant?: 'default' | 'success' | 'warning' | 'error'
  showLabel?: boolean
  indeterminate?: boolean
  className?: string
}

// 列表相关
export interface ListItem {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  avatar?: string
  disabled?: boolean
  selected?: boolean
  actions?: React.ReactNode
}

export interface ListProps {
  items: ListItem[]
  selectable?: boolean
  multiSelect?: boolean
  selectedItems?: string[]
  onSelectionChange?: (selectedItems: string[]) => void
  onItemClick?: (item: ListItem) => void
  className?: string
}

export interface TreeNode {
  id: string
  label: string
  icon?: React.ReactNode
  children?: TreeNode[]
  expanded?: boolean
  selected?: boolean
  disabled?: boolean
}

export interface TreeViewProps {
  data: TreeNode[]
  selectedNodes?: string[]
  expandedNodes?: string[]
  onSelectionChange?: (selectedNodes: string[]) => void
  onExpandedChange?: (expandedNodes: string[]) => void
  onNodeClick?: (node: TreeNode) => void
  className?: string
}

// 导航相关
export interface SidebarItem {
  id: string
  label: string
  icon?: React.ReactNode
  href?: string
  children?: SidebarItem[]
  badge?: string | number
  disabled?: boolean
}

export interface SidebarProps {
  items: SidebarItem[]
  activeItem?: string
  collapsed?: boolean
  onItemClick?: (item: SidebarItem) => void
  onToggleCollapse?: () => void
  className?: string
}

export interface BreadcrumbItem {
  id: string
  label: string
  href?: string
  icon?: React.ReactNode
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  maxItems?: number
  onItemClick?: (item: BreadcrumbItem) => void
  className?: string
}

// 容器相关
export interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: Size
  header?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export interface PanelProps {
  title?: string
  collapsible?: boolean
  collapsed?: boolean
  onToggleCollapse?: () => void
  headerActions?: React.ReactNode
  className?: string
  children: React.ReactNode
}

// 视图相关
export interface ImageViewProps {
  src: string
  alt?: string
  width?: number | string
  height?: number | string
  fit?: 'cover' | 'contain' | 'fill' | 'scale-down'
  loading?: 'lazy' | 'eager'
  placeholder?: React.ReactNode
  fallback?: React.ReactNode
  className?: string
  onLoad?: () => void
  onError?: () => void
}

export interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: Size
  variant?: 'circle' | 'square'
  fallback?: React.ReactNode
  className?: string
}

// 事件类型
export interface BaseEvent {
  preventDefault: () => void
  stopPropagation: () => void
}

export interface ClickEvent extends BaseEvent {
  target: EventTarget | null
  currentTarget: EventTarget | null
}

export interface ChangeEvent<T = string> extends BaseEvent {
  value: T
}

export interface FocusEvent extends BaseEvent {
  target: EventTarget | null
}

// 主题相关
export interface Theme {
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    info: string
    background: string
    surface: string
    text: {
      primary: string
      secondary: string
      disabled: string
    }
    border: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
    full: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}

// 工具类型
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type ComponentVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
export type ComponentState = 'default' | 'hover' | 'active' | 'disabled' | 'loading'
