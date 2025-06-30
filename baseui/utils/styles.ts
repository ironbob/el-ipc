/**
 * BaseUI 样式工具函数
 */

import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Size, Variant, ComponentSize, ComponentVariant } from '../types'

/**
 * 合并 Tailwind CSS 类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * macOS 风格的基础样式
 */
export const macOSStyles = {
  // 基础颜色
  colors: {
    primary: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700',
    secondary: 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:active:bg-gray-600',
    tertiary: 'bg-transparent hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-800 dark:active:bg-gray-700',
    danger: 'bg-red-500 hover:bg-red-600 active:bg-red-700',
    warning: 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700',
    success: 'bg-green-500 hover:bg-green-600 active:bg-green-700',
  },
  
  // 文本颜色
  textColors: {
    primary: 'text-white',
    secondary: 'text-gray-900 dark:text-gray-100',
    tertiary: 'text-gray-700 dark:text-gray-300',
    danger: 'text-white',
    warning: 'text-white',
    success: 'text-white',
  },
  
  // 边框
  borders: {
    default: 'border border-gray-200 dark:border-gray-700',
    focus: 'ring-2 ring-blue-500 ring-opacity-50 border-blue-500',
    error: 'border-red-500 ring-2 ring-red-500 ring-opacity-50',
  },
  
  // 圆角
  borderRadius: {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  },
  
  // 阴影
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  },
  
  // 过渡动画
  transitions: {
    default: 'transition-all duration-200 ease-in-out',
    fast: 'transition-all duration-150 ease-in-out',
    slow: 'transition-all duration-300 ease-in-out',
  },
  
  // 背景模糊效果（macOS 风格）
  backdrop: {
    blur: 'backdrop-blur-md bg-white/80 dark:bg-gray-900/80',
    solid: 'bg-white dark:bg-gray-900',
  },
}

/**
 * 获取尺寸相关的样式
 */
export function getSizeStyles(size: ComponentSize = 'md') {
  const sizeMap = {
    xs: {
      padding: 'px-2 py-1',
      text: 'text-xs',
      height: 'h-6',
      minHeight: 'min-h-[24px]',
      icon: 'w-3 h-3',
    },
    sm: {
      padding: 'px-3 py-1.5',
      text: 'text-sm',
      height: 'h-8',
      minHeight: 'min-h-[32px]',
      icon: 'w-4 h-4',
    },
    md: {
      padding: 'px-4 py-2',
      text: 'text-sm',
      height: 'h-10',
      minHeight: 'min-h-[40px]',
      icon: 'w-5 h-5',
    },
    lg: {
      padding: 'px-6 py-3',
      text: 'text-base',
      height: 'h-12',
      minHeight: 'min-h-[48px]',
      icon: 'w-6 h-6',
    },
    xl: {
      padding: 'px-8 py-4',
      text: 'text-lg',
      height: 'h-14',
      minHeight: 'min-h-[56px]',
      icon: 'w-7 h-7',
    },
  }
  
  return sizeMap[size]
}

/**
 * 获取变体相关的样式
 */
export function getVariantStyles(variant: ComponentVariant = 'default') {
  const variantMap = {
    default: {
      background: macOSStyles.colors.secondary,
      text: macOSStyles.textColors.secondary,
      border: macOSStyles.borders.default,
    },
    primary: {
      background: macOSStyles.colors.primary,
      text: macOSStyles.textColors.primary,
      border: 'border border-blue-500',
    },
    secondary: {
      background: macOSStyles.colors.secondary,
      text: macOSStyles.textColors.secondary,
      border: macOSStyles.borders.default,
    },
    success: {
      background: macOSStyles.colors.success,
      text: macOSStyles.textColors.success,
      border: 'border border-green-500',
    },
    warning: {
      background: macOSStyles.colors.warning,
      text: macOSStyles.textColors.warning,
      border: 'border border-yellow-500',
    },
    error: {
      background: macOSStyles.colors.danger,
      text: macOSStyles.textColors.danger,
      border: 'border border-red-500',
    },
  }
  
  return variantMap[variant]
}

/**
 * 获取按钮样式
 */
export function getButtonStyles(variant: ComponentVariant = 'default', size: ComponentSize = 'md') {
  const baseStyles = 'inline-flex items-center justify-center font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
  const sizeStyles = getSizeStyles(size)
  const variantStyles = getVariantStyles(variant)
  
  return cn(
    baseStyles,
    sizeStyles.padding,
    sizeStyles.text,
    sizeStyles.minHeight,
    variantStyles.background,
    variantStyles.text,
    variantStyles.border,
    macOSStyles.borderRadius.md,
    macOSStyles.transitions.default
  )
}

/**
 * 获取输入框样式
 */
export function getInputStyles(size: ComponentSize = 'md', error: boolean = false) {
  const baseStyles = 'block w-full border focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
  const sizeStyles = getSizeStyles(size)
  
  const borderStyles = error 
    ? macOSStyles.borders.error 
    : `${macOSStyles.borders.default} focus:${macOSStyles.borders.focus.replace('ring-2 ring-blue-500 ring-opacity-50 ', '')}`
  
  return cn(
    baseStyles,
    sizeStyles.padding,
    sizeStyles.text,
    sizeStyles.minHeight,
    borderStyles,
    macOSStyles.borderRadius.md,
    macOSStyles.transitions.default,
    'bg-white dark:bg-gray-800',
    'text-gray-900 dark:text-gray-100',
    'placeholder-gray-500 dark:placeholder-gray-400'
  )
}

/**
 * 获取卡片样式
 */
export function getCardStyles(variant: 'default' | 'outlined' | 'elevated' = 'default') {
  const baseStyles = 'bg-white dark:bg-gray-800'
  
  const variantStyles = {
    default: '',
    outlined: macOSStyles.borders.default,
    elevated: macOSStyles.shadows.md,
  }
  
  return cn(
    baseStyles,
    variantStyles[variant],
    macOSStyles.borderRadius.lg,
    macOSStyles.transitions.default
  )
}

/**
 * 获取列表项样式
 */
export function getListItemStyles(selected: boolean = false, disabled: boolean = false) {
  const baseStyles = 'flex items-center px-4 py-2 cursor-pointer'
  
  if (disabled) {
    return cn(baseStyles, 'opacity-50 cursor-not-allowed')
  }
  
  if (selected) {
    return cn(
      baseStyles,
      'bg-blue-500 text-white',
      macOSStyles.transitions.default
    )
  }
  
  return cn(
    baseStyles,
    'hover:bg-gray-100 dark:hover:bg-gray-700',
    'text-gray-900 dark:text-gray-100',
    macOSStyles.transitions.default
  )
}

/**
 * 获取模态框样式
 */
export function getModalStyles(size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md') {
  const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  }
  
  return cn(
    'relative w-full',
    sizeMap[size],
    'bg-white dark:bg-gray-800',
    macOSStyles.borderRadius.lg,
    macOSStyles.shadows.xl,
    macOSStyles.transitions.default
  )
}

/**
 * 获取工具栏样式
 */
export function getToolbarStyles() {
  return cn(
    'flex items-center px-4 py-2',
    'bg-gray-50 dark:bg-gray-800',
    'border-b border-gray-200 dark:border-gray-700'
  )
}

/**
 * 获取侧边栏样式
 */
export function getSidebarStyles(collapsed: boolean = false) {
  return cn(
    'flex flex-col',
    'bg-gray-50 dark:bg-gray-800',
    'border-r border-gray-200 dark:border-gray-700',
    collapsed ? 'w-16' : 'w-64',
    macOSStyles.transitions.default
  )
}

/**
 * 获取标签页样式
 */
export function getTabStyles(active: boolean = false, variant: 'default' | 'pills' | 'underline' = 'default') {
  const baseStyles = 'inline-flex items-center px-4 py-2 text-sm font-medium cursor-pointer'
  
  const variantStyles = {
    default: active 
      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' 
      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100',
    pills: active 
      ? 'bg-blue-500 text-white rounded-full' 
      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full',
    underline: active 
      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' 
      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100',
  }
  
  return cn(
    baseStyles,
    variantStyles[variant],
    macOSStyles.transitions.default
  )
}

/**
 * 获取进度条样式
 */
export function getProgressStyles(variant: ComponentVariant = 'default') {
  const baseStyles = 'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'
  
  const variantColors = {
    default: 'bg-blue-500',
    primary: 'bg-blue-500',
    secondary: 'bg-gray-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  }
  
  return {
    container: cn(baseStyles),
    bar: cn(variantColors[variant], macOSStyles.transitions.default),
  }
}

/**
 * 获取徽章样式
 */
export function getBadgeStyles(variant: ComponentVariant = 'default', size: ComponentSize = 'md') {
  const baseStyles = 'inline-flex items-center justify-center font-medium'
  const sizeStyles = getSizeStyles(size)
  const variantStyles = getVariantStyles(variant)
  
  return cn(
    baseStyles,
    sizeStyles.padding,
    sizeStyles.text,
    variantStyles.background,
    variantStyles.text,
    macOSStyles.borderRadius.full
  )
}
