/**
 * 文件操作 IPC 通信框架
 * 
 * 这是一个通用的文件操作框架，可以在不同的 Electron 应用之间复用。
 * 支持多种协议（本地文件系统、HTTP、SMB 等）和丰富的文件操作功能。
 */

// 导出类型定义
export * from './types'

// 导出主进程类
export { MainFileOperation } from './MainFileOperation'

// 导出渲染进程代理类
export { ProxyFileOperation } from './ProxyFileOperation'

// 导出示例
export { FileOperationExample, fileOperationExample } from './examples/FileOperationExample'

/**
 * 快速开始指南：
 * 
 * 1. 在主进程中：
 *    ```typescript
 *    import { MainFileOperation } from './ipc-core/file-operation'
 *    
 *    const fileOperation = new MainFileOperation()
 *    // 设置 IPC 处理器...
 *    ```
 * 
 * 2. 在渲染进程中：
 *    ```typescript
 *    import { ProxyFileOperation, FileProtocol } from './ipc-core/file-operation'
 *    
 *    const fileOp = new ProxyFileOperation()
 *    
 *    // 读取文件
 *    const content = await fileOp.readText('/path/to/file.txt', FileProtocol.LOCAL)
 *    
 *    // 写入文件
 *    await fileOp.write('/path/to/file.txt', 'Hello World', FileProtocol.LOCAL)
 *    
 *    // 复制文件
 *    await fileOp.copyFiles(['/source/file.txt'], '/destination', FileProtocol.LOCAL)
 *    ```
 * 
 * 3. 支持的操作：
 *    - 基础操作：read, write, stat, delete, listFiles, rename, newFile, newDir
 *    - 高级操作：moveFiles, copyFiles, zipFiles, extractZip
 *    - 工具操作：getFileHash, compareFiles
 *    - 文本处理：自动编码检测，多编码支持
 * 
 * 4. 支持的协议：
 *    - FileProtocol.LOCAL: 本地文件系统
 *    - FileProtocol.HTTP/HTTPS: HTTP 协议（计划支持）
 *    - FileProtocol.SMB: SMB 网络共享（计划支持）
 *    - FileProtocol.FTP/SFTP: FTP 协议（计划支持）
 * 
 * 5. 事件监听：
 *    ```typescript
 *    fileOp.onProgress((progress) => {
 *      console.log(`Progress: ${progress.percentage}%`)
 *    })
 *    
 *    fileOp.onOperationComplete((result) => {
 *      console.log('Operation completed:', result)
 *    })
 *    ```
 */

/**
 * 创建文件操作实例的工厂函数
 */
export function createFileOperation(): ProxyFileOperation {
  return new ProxyFileOperation()
}

/**
 * 常用的文件操作工具函数
 */
export class FileUtils {
  /**
   * 检查文件扩展名
   */
  static isImageFile(path: string): boolean {
    const ext = this.getExtension(path)
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)
  }

  /**
   * 检查是否为文本文件
   */
  static isTextFile(path: string): boolean {
    const ext = this.getExtension(path)
    return ['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'ts', 'py', 'java', 'cpp', 'c', 'h'].includes(ext)
  }

  /**
   * 检查是否为压缩文件
   */
  static isArchiveFile(path: string): boolean {
    const ext = this.getExtension(path)
    return ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext)
  }

  /**
   * 获取文件扩展名
   */
  static getExtension(path: string): string {
    const lastDot = path.lastIndexOf('.')
    const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
    
    if (lastDot > lastSlash && lastDot > 0) {
      return path.substring(lastDot + 1).toLowerCase()
    }
    return ''
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 验证文件名
   */
  static isValidFileName(name: string): boolean {
    // 检查非法字符
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/
    if (invalidChars.test(name)) return false
    
    // 检查保留名称（Windows）
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']
    if (reservedNames.includes(name.toUpperCase())) return false
    
    // 检查长度
    if (name.length === 0 || name.length > 255) return false
    
    // 检查结尾字符
    if (name.endsWith('.') || name.endsWith(' ')) return false
    
    return true
  }

  /**
   * 生成安全的文件名
   */
  static sanitizeFileName(name: string): string {
    // 替换非法字符
    let sanitized = name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    
    // 处理保留名称
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']
    if (reservedNames.includes(sanitized.toUpperCase())) {
      sanitized = '_' + sanitized
    }
    
    // 处理结尾字符
    sanitized = sanitized.replace(/[. ]+$/, '')
    
    // 限制长度
    if (sanitized.length > 255) {
      sanitized = sanitized.substring(0, 255)
    }
    
    // 确保不为空
    if (sanitized.length === 0) {
      sanitized = 'untitled'
    }
    
    return sanitized
  }

  /**
   * 获取 MIME 类型
   */
  static getMimeType(path: string): string {
    const ext = this.getExtension(path)
    const mimeTypes: Record<string, string> = {
      // 文本
      'txt': 'text/plain',
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'json': 'application/json',
      'xml': 'application/xml',
      
      // 图片
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      
      // 音频
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      
      // 视频
      'mp4': 'video/mp4',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime',
      
      // 文档
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      
      // 压缩
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',
      'tar': 'application/x-tar',
      'gz': 'application/gzip'
    }
    
    return mimeTypes[ext] || 'application/octet-stream'
  }
}
