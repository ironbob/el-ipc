import {
  FileProtocol,
  FileOptions,
  FileStats,
  DirectoryEntry,
  ReadFileOptions,
  WriteFileOptions,
  ListFilesOptions,
  MoveFileOptions,
  CopyFileOptions,
  ZipOptions,
  ExtractOptions,
  FileOperationResult,
  BatchOperationResult,
  TextDetectionResult,
  HashOptions,
  FileCompareResult,
  DiskUsage,
  FilePermissions,
  WatchOptions,
  FileWatchEvent,
  FileOperationError
} from './types'

/**
 * 渲染进程文件操作代理类
 * 通过 IPC 与主进程的 MainFileOperation 通信
 */
export class ProxyFileOperation extends EventTarget {
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
    // 监听文件操作事件
    this.electronAPI.onFileOperationEvent?.((event: any) => {
      this.dispatchEvent(new CustomEvent(event.type, { detail: event.data }))
    })
  }

  /**
   * 读取文件（二进制）
   */
  async read(path: string, protocol: FileProtocol, options: ReadFileOptions = {}): Promise<Buffer> {
    try {
      const result = await this.electronAPI.fileOperation.read(path, protocol, options)
      return Buffer.from(result)
    } catch (error) {
      throw new FileOperationError('Failed to read file', 'READ_ERROR', path, protocol, error)
    }
  }

  /**
   * 读取文本文件（自动检测编码）
   */
  async readText(path: string, protocol: FileProtocol, options: ReadFileOptions = {}): Promise<TextDetectionResult> {
    try {
      return await this.electronAPI.fileOperation.readText(path, protocol, options)
    } catch (error) {
      throw new FileOperationError('Failed to read text file', 'READ_TEXT_ERROR', path, protocol, error)
    }
  }

  /**
   * 写入文件
   */
  async write(path: string, data: Buffer | string, protocol: FileProtocol, options: WriteFileOptions = {}): Promise<FileOperationResult> {
    try {
      // 如果是 Buffer，转换为 Uint8Array 以便 IPC 传输
      const writeData = Buffer.isBuffer(data) ? Array.from(data) : data
      return await this.electronAPI.fileOperation.write(path, writeData, protocol, options)
    } catch (error) {
      throw new FileOperationError('Failed to write file', 'WRITE_ERROR', path, protocol, error)
    }
  }

  /**
   * 获取文件统计信息
   */
  async stat(path: string, protocol: FileProtocol, options: FileOptions = {}): Promise<FileStats> {
    try {
      const result = await this.electronAPI.fileOperation.stat(path, protocol, options)
      // 转换日期字符串为 Date 对象
      return {
        ...result,
        atime: new Date(result.atime),
        mtime: new Date(result.mtime),
        ctime: new Date(result.ctime),
        birthtime: new Date(result.birthtime)
      }
    } catch (error) {
      throw new FileOperationError('Failed to get file stats', 'STAT_ERROR', path, protocol, error)
    }
  }

  /**
   * 删除文件或目录
   */
  async delete(path: string, protocol: FileProtocol, options: FileOptions = {}): Promise<FileOperationResult> {
    try {
      return await this.electronAPI.fileOperation.delete(path, protocol, options)
    } catch (error) {
      throw new FileOperationError('Failed to delete', 'DELETE_ERROR', path, protocol, error)
    }
  }

  /**
   * 列出目录文件
   */
  async listFiles(path: string, protocol: FileProtocol, options: ListFilesOptions = {}): Promise<DirectoryEntry[]> {
    try {
      const result = await this.electronAPI.fileOperation.listFiles(path, protocol, options)
      // 转换日期字符串为 Date 对象
      return result.map((entry: any) => ({
        ...entry,
        mtime: entry.mtime ? new Date(entry.mtime) : undefined
      }))
    } catch (error) {
      throw new FileOperationError('Failed to list files', 'LIST_ERROR', path, protocol, error)
    }
  }

  /**
   * 重命名文件或目录
   */
  async rename(oldPath: string, newPath: string, protocol: FileProtocol, options: FileOptions = {}): Promise<FileOperationResult> {
    try {
      return await this.electronAPI.fileOperation.rename(oldPath, newPath, protocol, options)
    } catch (error) {
      throw new FileOperationError('Failed to rename', 'RENAME_ERROR', oldPath, protocol, error)
    }
  }

  /**
   * 创建新文件
   */
  async newFile(path: string, protocol: FileProtocol, options: WriteFileOptions = {}): Promise<FileOperationResult> {
    try {
      return await this.electronAPI.fileOperation.newFile(path, protocol, options)
    } catch (error) {
      throw new FileOperationError('Failed to create file', 'CREATE_FILE_ERROR', path, protocol, error)
    }
  }

  /**
   * 创建新目录
   */
  async newDir(path: string, protocol: FileProtocol, options: FileOptions = {}): Promise<FileOperationResult> {
    try {
      return await this.electronAPI.fileOperation.newDir(path, protocol, options)
    } catch (error) {
      throw new FileOperationError('Failed to create directory', 'MKDIR_ERROR', path, protocol, error)
    }
  }

  /**
   * 移动文件或目录
   */
  async moveFiles(sources: string[], destination: string, protocol: FileProtocol, options: MoveFileOptions = {}): Promise<BatchOperationResult> {
    try {
      return await this.electronAPI.fileOperation.moveFiles(sources, destination, protocol, options)
    } catch (error) {
      throw new FileOperationError('Failed to move files', 'MOVE_ERROR', sources[0], protocol, error)
    }
  }

  /**
   * 复制文件或目录
   */
  async copyFiles(sources: string[], destination: string, protocol: FileProtocol, options: CopyFileOptions = {}): Promise<BatchOperationResult> {
    try {
      return await this.electronAPI.fileOperation.copyFiles(sources, destination, protocol, options)
    } catch (error) {
      throw new FileOperationError('Failed to copy files', 'COPY_ERROR', sources[0], protocol, error)
    }
  }

  /**
   * 压缩文件或目录
   */
  async zipFiles(sources: string[], zipPath: string, protocol: FileProtocol, options: ZipOptions = {}): Promise<FileOperationResult> {
    try {
      return await this.electronAPI.fileOperation.zipFiles(sources, zipPath, protocol, options)
    } catch (error) {
      throw new FileOperationError('Failed to create zip', 'ZIP_ERROR', zipPath, protocol, error)
    }
  }

  /**
   * 解压文件
   */
  async extractZip(zipPath: string, destination: string, protocol: FileProtocol, options: ExtractOptions = {}): Promise<FileOperationResult> {
    try {
      return await this.electronAPI.fileOperation.extractZip(zipPath, destination, protocol, options)
    } catch (error) {
      throw new FileOperationError('Failed to extract zip', 'EXTRACT_ERROR', zipPath, protocol, error)
    }
  }

  /**
   * 计算文件哈希
   */
  async getFileHash(path: string, protocol: FileProtocol, options: HashOptions): Promise<string> {
    try {
      return await this.electronAPI.fileOperation.getFileHash(path, protocol, options)
    } catch (error) {
      throw new FileOperationError('Failed to calculate hash', 'HASH_ERROR', path, protocol, error)
    }
  }

  /**
   * 比较两个文件
   */
  async compareFiles(path1: string, path2: string, protocol: FileProtocol, options: FileOptions = {}): Promise<FileCompareResult> {
    try {
      return await this.electronAPI.fileOperation.compareFiles(path1, path2, protocol, options)
    } catch (error) {
      throw new FileOperationError('Failed to compare files', 'COMPARE_ERROR', path1, protocol, error)
    }
  }

  /**
   * 检查文件是否存在
   */
  async exists(path: string, protocol: FileProtocol, options: FileOptions = {}): Promise<boolean> {
    try {
      await this.stat(path, protocol, options)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 获取文件大小
   */
  async getSize(path: string, protocol: FileProtocol, options: FileOptions = {}): Promise<number> {
    try {
      const stats = await this.stat(path, protocol, options)
      return stats.size
    } catch (error) {
      throw new FileOperationError('Failed to get file size', 'SIZE_ERROR', path, protocol, error)
    }
  }

  /**
   * 检查是否为文件
   */
  async isFile(path: string, protocol: FileProtocol, options: FileOptions = {}): Promise<boolean> {
    try {
      const stats = await this.stat(path, protocol, options)
      return stats.isFile
    } catch (error) {
      return false
    }
  }

  /**
   * 检查是否为目录
   */
  async isDirectory(path: string, protocol: FileProtocol, options: FileOptions = {}): Promise<boolean> {
    try {
      const stats = await this.stat(path, protocol, options)
      return stats.isDirectory
    } catch (error) {
      return false
    }
  }

  /**
   * 获取文件扩展名
   */
  getExtension(path: string): string {
    const lastDot = path.lastIndexOf('.')
    const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
    
    if (lastDot > lastSlash && lastDot > 0) {
      return path.substring(lastDot + 1).toLowerCase()
    }
    return ''
  }

  /**
   * 获取文件名（不含扩展名）
   */
  getBaseName(path: string): string {
    const name = this.getFileName(path)
    const lastDot = name.lastIndexOf('.')
    return lastDot > 0 ? name.substring(0, lastDot) : name
  }

  /**
   * 获取文件名（含扩展名）
   */
  getFileName(path: string): string {
    const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
    return lastSlash >= 0 ? path.substring(lastSlash + 1) : path
  }

  /**
   * 获取目录路径
   */
  getDirectoryPath(path: string): string {
    const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
    return lastSlash >= 0 ? path.substring(0, lastSlash) : ''
  }

  /**
   * 连接路径
   */
  joinPath(...paths: string[]): string {
    return paths.join('/').replace(/\/+/g, '/')
  }

  /**
   * 规范化路径
   */
  normalizePath(path: string): string {
    return path.replace(/\\/g, '/').replace(/\/+/g, '/')
  }

  /**
   * 监听操作进度
   */
  onProgress(callback: (progress: any) => void): void {
    this.addEventListener('operationProgress', (event: Event) => {
      const customEvent = event as CustomEvent
      callback(customEvent.detail)
    })
  }

  /**
   * 监听操作开始
   */
  onOperationStart(callback: (data: any) => void): void {
    this.addEventListener('operationStart', (event: Event) => {
      const customEvent = event as CustomEvent
      callback(customEvent.detail)
    })
  }

  /**
   * 监听操作完成
   */
  onOperationComplete(callback: (data: any) => void): void {
    this.addEventListener('operationComplete', (event: Event) => {
      const customEvent = event as CustomEvent
      callback(customEvent.detail)
    })
  }

  /**
   * 移除所有监听器
   * 注意：EventTarget 没有内置的 removeAllListeners 方法
   * 这个方法保持接口兼容性，但实际功能有限
   */
  removeAllListeners(event?: string): this {
    // EventTarget 没有内置的 removeAllListeners 方法
    // 如果需要移除所有监听器，建议在外部管理监听器引用
    console.warn('removeAllListeners is not fully supported with EventTarget. Consider managing listeners externally.')
    return this
  }
}
