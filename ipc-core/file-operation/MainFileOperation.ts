import { promises as fs, constants, createReadStream, createWriteStream } from 'fs'
import { stat, access, readdir, mkdir, rmdir, unlink, rename as fsRename } from 'fs/promises'
import { join, dirname, basename, extname, resolve } from 'path'
import { createHash } from 'crypto'
import { pipeline } from 'stream/promises'
import { createGzip, createGunzip } from 'zlib'
import archiver from 'archiver'
import * as unzipper from 'unzipper'
import { EventEmitter } from 'events'
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
  FileOperationError,
  TextDetectionResult,
  FileEncoding,
  HashOptions,
  FileCompareResult,
  DiskUsage,
  FilePermissions,
  WatchOptions,
  FileWatchEvent
} from './types'

/**
 * 主进程文件操作类
 * 提供所有文件操作的具体实现
 */
export class MainFileOperation extends EventEmitter {
  private operationId: number = 0

  constructor() {
    super()
  }

  /**
   * 获取错误消息
   */
  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error)
  }

  /**
   * 生成操作ID
   */
  private generateOperationId(): string {
    return `file_op_${Date.now()}_${++this.operationId}`
  }

  /**
   * 验证协议支持
   */
  private validateProtocol(protocol: FileProtocol): void {
    if (protocol !== FileProtocol.LOCAL) {
      throw new FileOperationError(
        `Protocol ${protocol} is not yet implemented`,
        'PROTOCOL_NOT_SUPPORTED',
        undefined,
        protocol
      )
    }
  }

  /**
   * 处理文件路径
   */
  private resolvePath(path: string): string {
    return resolve(path)
  }

  /**
   * 读取文件（二进制）
   */
  async read(path: string, protocol: FileProtocol, options: ReadFileOptions = {}): Promise<Buffer> {
    this.validateProtocol(protocol)
    
    try {
      const resolvedPath = this.resolvePath(path)
      
      if (options.start !== undefined || options.end !== undefined) {
        // 部分读取
        const stream = createReadStream(resolvedPath, {
          start: options.start,
          end: options.end
        })
        
        const chunks: Buffer[] = []
        for await (const chunk of stream) {
          chunks.push(chunk)
        }
        return Buffer.concat(chunks)
      } else {
        // 完整读取
        return await fs.readFile(resolvedPath)
      }
    } catch (error) {
      throw new FileOperationError(
        `Failed to read file: ${this.getErrorMessage(error)}`,
        'READ_ERROR',
        path,
        protocol,
        error
      )
    }
  }

  /**
   * 读取文本文件（自动检测编码）
   */
  async readText(path: string, protocol: FileProtocol, options: ReadFileOptions = {}): Promise<TextDetectionResult> {
    this.validateProtocol(protocol)
    
    try {
      const buffer = await this.read(path, protocol, options)
      return this.detectTextEncoding(buffer, options.encoding)
    } catch (error) {
      throw new FileOperationError(
        `Failed to read text file: ${this.getErrorMessage(error)}`,
        'READ_TEXT_ERROR',
        path,
        protocol,
        error
      )
    }
  }

  /**
   * 检测文本编码
   */
  private detectTextEncoding(buffer: Buffer, preferredEncoding?: FileEncoding): TextDetectionResult {
    // 检测 BOM
    const bom = this.detectBOM(buffer)
    if (bom.encoding) {
      return {
        encoding: bom.encoding,
        confidence: 1.0,
        content: buffer.toString(bom.encoding as BufferEncoding),
        bom: true
      }
    }

    // 如果指定了编码，直接使用
    if (preferredEncoding && preferredEncoding !== FileEncoding.AUTO) {
      return {
        encoding: preferredEncoding,
        confidence: 1.0,
        content: buffer.toString(preferredEncoding as BufferEncoding),
        bom: false
      }
    }

    // 尝试不同编码
    const encodings = [FileEncoding.UTF8, FileEncoding.UTF16LE, FileEncoding.LATIN1]
    
    for (const encoding of encodings) {
      try {
        const content = buffer.toString(encoding as BufferEncoding)
        // 简单的有效性检查
        if (this.isValidText(content)) {
          return {
            encoding,
            confidence: 0.8,
            content,
            bom: false
          }
        }
      } catch (error) {
        continue
      }
    }

    // 默认使用 UTF-8
    return {
      encoding: FileEncoding.UTF8,
      confidence: 0.5,
      content: buffer.toString('utf8'),
      bom: false
    }
  }

  /**
   * 检测 BOM
   */
  private detectBOM(buffer: Buffer): { encoding?: FileEncoding; length: number } {
    if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
      return { encoding: FileEncoding.UTF8, length: 3 }
    }
    if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
      return { encoding: FileEncoding.UTF16LE, length: 2 }
    }
    if (buffer.length >= 2 && buffer[0] === 0xFE && buffer[1] === 0xFF) {
      return { encoding: FileEncoding.UTF16BE, length: 2 }
    }
    return { length: 0 }
  }

  /**
   * 检查文本有效性
   */
  private isValidText(text: string): boolean {
    // 检查是否包含过多的控制字符
    const controlChars = text.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g)
    return !controlChars || controlChars.length < text.length * 0.1
  }

  /**
   * 写入文件
   */
  async write(path: string, data: Buffer | string, protocol: FileProtocol, options: WriteFileOptions = {}): Promise<FileOperationResult> {
    this.validateProtocol(protocol)
    
    try {
      const resolvedPath = this.resolvePath(path)
      
      // 确保目录存在
      await fs.mkdir(dirname(resolvedPath), { recursive: true })
      
      const writeOptions: any = {}
      if (options.encoding) {
        writeOptions.encoding = options.encoding
      }
      if (options.mode) {
        writeOptions.mode = options.mode
      }
      if (options.flag) {
        writeOptions.flag = options.flag
      }

      if (options.append) {
        await fs.appendFile(resolvedPath, data, writeOptions)
      } else {
        await fs.writeFile(resolvedPath, data, writeOptions)
      }

      return {
        success: true,
        path: resolvedPath,
        message: 'File written successfully'
      }
    } catch (error) {
      throw new FileOperationError(
        `Failed to write file: ${this.getErrorMessage(error)}`,
        'WRITE_ERROR',
        path,
        protocol,
        error
      )
    }
  }

  /**
   * 获取文件统计信息
   */
  async stat(path: string, protocol: FileProtocol, options: FileOptions = {}): Promise<FileStats> {
    this.validateProtocol(protocol)
    
    try {
      const resolvedPath = this.resolvePath(path)
      const stats = await stat(resolvedPath)
      
      return {
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        isSymbolicLink: stats.isSymbolicLink(),
        size: stats.size,
        mode: stats.mode,
        uid: stats.uid,
        gid: stats.gid,
        atime: stats.atime,
        mtime: stats.mtime,
        ctime: stats.ctime,
        birthtime: stats.birthtime
      }
    } catch (error) {
      throw new FileOperationError(
        `Failed to get file stats: ${this.getErrorMessage(error)}`,
        'STAT_ERROR',
        path,
        protocol,
        error
      )
    }
  }

  /**
   * 删除文件或目录
   */
  async delete(path: string, protocol: FileProtocol, options: FileOptions = {}): Promise<FileOperationResult> {
    this.validateProtocol(protocol)
    
    try {
      const resolvedPath = this.resolvePath(path)
      const stats = await this.stat(path, protocol, options)
      
      if (stats.isDirectory) {
        await fs.rmdir(resolvedPath, { recursive: true })
      } else {
        await unlink(resolvedPath)
      }

      return {
        success: true,
        path: resolvedPath,
        message: `${stats.isDirectory ? 'Directory' : 'File'} deleted successfully`
      }
    } catch (error) {
      throw new FileOperationError(
        `Failed to delete: ${this.getErrorMessage(error)}`,
        'DELETE_ERROR',
        path,
        protocol,
        error
      )
    }
  }

  /**
   * 列出目录文件
   */
  async listFiles(path: string, protocol: FileProtocol, options: ListFilesOptions = {}): Promise<DirectoryEntry[]> {
    this.validateProtocol(protocol)
    
    try {
      const resolvedPath = this.resolvePath(path)
      const entries: DirectoryEntry[] = []
      
      await this.listFilesRecursive(resolvedPath, entries, options, 0)
      
      // 应用过滤器
      let filteredEntries = entries
      if (options.filter) {
        const pattern = new RegExp(options.filter.replace(/\*/g, '.*'))
        filteredEntries = entries.filter(entry => pattern.test(entry.name))
      }
      
      if (!options.includeHidden) {
        filteredEntries = filteredEntries.filter(entry => !entry.name.startsWith('.'))
      }
      
      // 排序
      if (options.sortBy) {
        filteredEntries.sort((a, b) => {
          let comparison = 0
          switch (options.sortBy) {
            case 'name':
              comparison = a.name.localeCompare(b.name)
              break
            case 'size':
              comparison = (a.size || 0) - (b.size || 0)
              break
            case 'mtime':
              comparison = (a.mtime?.getTime() || 0) - (b.mtime?.getTime() || 0)
              break
            case 'type':
              comparison = a.isDirectory === b.isDirectory ? 0 : (a.isDirectory ? -1 : 1)
              break
          }
          return options.sortOrder === 'desc' ? -comparison : comparison
        })
      }
      
      // 分页
      const start = options.offset || 0
      const end = options.limit ? start + options.limit : undefined
      
      return filteredEntries.slice(start, end)
    } catch (error) {
      throw new FileOperationError(
        `Failed to list files: ${this.getErrorMessage(error)}`,
        'LIST_ERROR',
        path,
        protocol,
        error
      )
    }
  }

  /**
   * 递归列出文件
   */
  private async listFilesRecursive(
    dirPath: string, 
    entries: DirectoryEntry[], 
    options: ListFilesOptions, 
    depth: number
  ): Promise<void> {
    const items = await readdir(dirPath, { withFileTypes: true })
    
    for (const item of items) {
      const fullPath = join(dirPath, item.name)
      const stats = await stat(fullPath).catch(() => null)
      
      const entry: DirectoryEntry = {
        name: item.name,
        path: fullPath,
        isFile: item.isFile(),
        isDirectory: item.isDirectory(),
        isSymbolicLink: item.isSymbolicLink(),
        size: stats?.size,
        mtime: stats?.mtime,
        extension: item.isFile() ? extname(item.name) : undefined
      }
      
      entries.push(entry)
      
      if (options.recursive && item.isDirectory()) {
        await this.listFilesRecursive(fullPath, entries, options, depth + 1)
      }
    }
  }

  /**
   * 重命名文件或目录
   */
  async rename(oldPath: string, newPath: string, protocol: FileProtocol, options: FileOptions = {}): Promise<FileOperationResult> {
    this.validateProtocol(protocol)
    
    try {
      const resolvedOldPath = this.resolvePath(oldPath)
      const resolvedNewPath = this.resolvePath(newPath)
      
      // 确保目标目录存在
      await fs.mkdir(dirname(resolvedNewPath), { recursive: true })
      
      await fsRename(resolvedOldPath, resolvedNewPath)
      
      return {
        success: true,
        path: resolvedNewPath,
        message: 'File renamed successfully'
      }
    } catch (error) {
      throw new FileOperationError(
        `Failed to rename: ${this.getErrorMessage(error)}`,
        'RENAME_ERROR',
        oldPath,
        protocol,
        error
      )
    }
  }

  /**
   * 创建新文件
   */
  async newFile(path: string, protocol: FileProtocol, options: WriteFileOptions = {}): Promise<FileOperationResult> {
    return this.write(path, '', protocol, { ...options, flag: 'wx' })
  }

  /**
   * 创建新目录
   */
  async newDir(path: string, protocol: FileProtocol, options: FileOptions = {}): Promise<FileOperationResult> {
    this.validateProtocol(protocol)

    try {
      const resolvedPath = this.resolvePath(path)
      await mkdir(resolvedPath, { recursive: true })

      return {
        success: true,
        path: resolvedPath,
        message: 'Directory created successfully'
      }
    } catch (error) {
      throw new FileOperationError(
        `Failed to create directory: ${this.getErrorMessage(error)}`,
        'MKDIR_ERROR',
        path,
        protocol,
        error
      )
    }
  }

  /**
   * 移动文件或目录
   */
  async moveFiles(sources: string[], destination: string, protocol: FileProtocol, options: MoveFileOptions = {}): Promise<BatchOperationResult> {
    this.validateProtocol(protocol)

    const operationId = this.generateOperationId()
    const results: FileOperationResult[] = []
    let successCount = 0
    let failureCount = 0

    this.emit('operationStart', { operationId, type: 'move', sources, destination })

    for (let i = 0; i < sources.length; i++) {
      const source = sources[i]
      try {
        const sourceName = basename(source)
        const targetPath = join(destination, sourceName)

        // 检查目标是否存在
        if (!options.overwrite) {
          try {
            await this.stat(targetPath, protocol)
            throw new Error('Target file already exists')
          } catch (error) {
            if ((error as any)?.code !== 'ENOENT') throw error
          }
        }

        // 创建目标目录
        if (options.createDirs) {
          await this.newDir(dirname(targetPath), protocol)
        }

        // 执行移动
        const result = await this.rename(source, targetPath, protocol, options)
        results.push(result)
        successCount++

        this.emit('operationProgress', {
          operationId,
          current: i + 1,
          total: sources.length,
          currentFile: source
        })
      } catch (error) {
        const result: FileOperationResult = {
          success: false,
          path: source,
          error: this.getErrorMessage(error)
        }
        results.push(result)
        failureCount++
      }
    }

    const batchResult: BatchOperationResult = {
      success: failureCount === 0,
      results,
      successCount,
      failureCount
    }

    this.emit('operationComplete', { operationId, result: batchResult })
    return batchResult
  }

  /**
   * 复制文件或目录
   */
  async copyFiles(sources: string[], destination: string, protocol: FileProtocol, options: CopyFileOptions = {}): Promise<BatchOperationResult> {
    this.validateProtocol(protocol)

    const operationId = this.generateOperationId()
    const results: FileOperationResult[] = []
    let successCount = 0
    let failureCount = 0

    this.emit('operationStart', { operationId, type: 'copy', sources, destination })

    for (let i = 0; i < sources.length; i++) {
      const source = sources[i]
      try {
        const sourceName = basename(source)
        const targetPath = join(destination, sourceName)

        const result = await this.copyFileOrDirectory(source, targetPath, protocol, options)
        results.push(result)
        successCount++

        this.emit('operationProgress', {
          operationId,
          current: i + 1,
          total: sources.length,
          currentFile: source
        })
      } catch (error) {
        const result: FileOperationResult = {
          success: false,
          path: source,
          error: this.getErrorMessage(error)
        }
        results.push(result)
        failureCount++
      }
    }

    const batchResult: BatchOperationResult = {
      success: failureCount === 0,
      results,
      successCount,
      failureCount
    }

    this.emit('operationComplete', { operationId, result: batchResult })
    return batchResult
  }

  /**
   * 复制单个文件或目录
   */
  private async copyFileOrDirectory(source: string, target: string, protocol: FileProtocol, options: CopyFileOptions): Promise<FileOperationResult> {
    const sourceStats = await this.stat(source, protocol)

    if (sourceStats.isDirectory) {
      // 复制目录
      await this.newDir(target, protocol)

      const entries = await this.listFiles(source, protocol, { recursive: false })
      for (const entry of entries) {
        const entrySource = entry.path
        const entryTarget = join(target, entry.name)
        await this.copyFileOrDirectory(entrySource, entryTarget, protocol, options)
      }
    } else {
      // 复制文件
      if (!options.overwrite) {
        try {
          await this.stat(target, protocol)
          throw new Error('Target file already exists')
        } catch (error) {
          if ((error as any)?.code !== 'ENOENT') throw error
        }
      }

      // 确保目标目录存在
      await fs.mkdir(dirname(target), { recursive: true })

      // 复制文件内容
      await fs.copyFile(source, target)

      // 保留时间戳
      if (options.preserveTimestamps) {
        await fs.utimes(target, sourceStats.atime, sourceStats.mtime)
      }

      // 保留权限
      if (options.preserveMode) {
        await fs.chmod(target, sourceStats.mode)
      }
    }

    return {
      success: true,
      path: target,
      message: 'File copied successfully'
    }
  }

  /**
   * 压缩文件或目录
   */
  async zipFiles(sources: string[], zipPath: string, protocol: FileProtocol, options: ZipOptions = {}): Promise<FileOperationResult> {
    this.validateProtocol(protocol)

    try {
      const operationId = this.generateOperationId()
      const resolvedZipPath = this.resolvePath(zipPath)

      // 确保目标目录存在
      await fs.mkdir(dirname(resolvedZipPath), { recursive: true })

      this.emit('operationStart', { operationId, type: 'zip', sources, destination: zipPath })

      return new Promise((resolve, reject) => {
        const output = createWriteStream(resolvedZipPath)
        const archive = archiver('zip', {
          zlib: { level: this.getCompressionLevel(options.compression) }
        })

        output.on('close', () => {
          const result: FileOperationResult = {
            success: true,
            path: resolvedZipPath,
            message: `Archive created successfully (${archive.pointer()} bytes)`
          }
          this.emit('operationComplete', { operationId, result })
          resolve(result)
        })

        archive.on('error', (error: Error) => {
          const fileError = new FileOperationError(
            `Failed to create archive: ${error.message}`,
            'ZIP_ERROR',
            zipPath,
            protocol,
            error
          )
          reject(fileError)
        })

        archive.on('progress', (progress: any) => {
          this.emit('operationProgress', {
            operationId,
            current: progress.entries.processed,
            total: progress.entries.total
          })
        })

        archive.pipe(output)

        // 添加文件到压缩包
        this.addFilesToArchive(archive, sources, options).then(() => {
          archive.finalize()
        }).catch(reject)
      })
    } catch (error) {
      throw new FileOperationError(
        `Failed to create zip: ${this.getErrorMessage(error)}`,
        'ZIP_ERROR',
        zipPath,
        protocol,
        error
      )
    }
  }

  /**
   * 添加文件到压缩包
   */
  private async addFilesToArchive(archive: archiver.Archiver, sources: string[], options: ZipOptions): Promise<void> {
    for (const source of sources) {
      const stats = await this.stat(source, FileProtocol.LOCAL)
      const name = basename(source)

      if (stats.isDirectory) {
        archive.directory(source, name)
      } else {
        archive.file(source, { name })
      }
    }
  }

  /**
   * 获取压缩级别
   */
  private getCompressionLevel(compression?: string): number {
    switch (compression) {
      case 'none': return 0
      case 'fast': return 1
      case 'best': return 9
      default: return 6
    }
  }

  /**
   * 解压文件
   */
  async extractZip(zipPath: string, destination: string, protocol: FileProtocol, options: ExtractOptions = {}): Promise<FileOperationResult> {
    this.validateProtocol(protocol)

    try {
      const operationId = this.generateOperationId()
      const resolvedZipPath = this.resolvePath(zipPath)
      const resolvedDestination = this.resolvePath(destination)

      // 确保目标目录存在
      await fs.mkdir(resolvedDestination, { recursive: true })

      this.emit('operationStart', { operationId, type: 'extract', source: zipPath, destination })

      return new Promise((resolve, reject) => {
        const stream = createReadStream(resolvedZipPath)
          .pipe(unzipper.Extract({ path: resolvedDestination }))

        stream.on('close', () => {
          const result: FileOperationResult = {
            success: true,
            path: resolvedDestination,
            message: 'Archive extracted successfully'
          }
          this.emit('operationComplete', { operationId, result })
          resolve(result)
        })

        stream.on('error', (error) => {
          const fileError = new FileOperationError(
            `Failed to extract archive: ${error.message}`,
            'EXTRACT_ERROR',
            zipPath,
            protocol,
            error
          )
          reject(fileError)
        })
      })
    } catch (error) {
      throw new FileOperationError(
        `Failed to extract zip: ${this.getErrorMessage(error)}`,
        'EXTRACT_ERROR',
        zipPath,
        protocol,
        error
      )
    }
  }

  /**
   * 计算文件哈希
   */
  async getFileHash(path: string, protocol: FileProtocol, options: HashOptions): Promise<string> {
    this.validateProtocol(protocol)

    try {
      const resolvedPath = this.resolvePath(path)
      const hash = createHash(options.algorithm)
      const stream = createReadStream(resolvedPath)

      return new Promise((resolve, reject) => {
        stream.on('data', (data) => hash.update(data))
        stream.on('end', () => resolve(hash.digest('hex')))
        stream.on('error', reject)
      })
    } catch (error) {
      throw new FileOperationError(
        `Failed to calculate hash: ${this.getErrorMessage(error)}`,
        'HASH_ERROR',
        path,
        protocol,
        error
      )
    }
  }

  /**
   * 比较两个文件
   */
  async compareFiles(path1: string, path2: string, protocol: FileProtocol, options: FileOptions = {}): Promise<FileCompareResult> {
    this.validateProtocol(protocol)

    try {
      const [stats1, stats2] = await Promise.all([
        this.stat(path1, protocol, options),
        this.stat(path2, protocol, options)
      ])

      const sizeDiff = stats1.size - stats2.size
      const timeDiff = stats1.mtime.getTime() - stats2.mtime.getTime()

      if (sizeDiff !== 0) {
        return {
          identical: false,
          sizeDiff,
          contentDiff: true,
          timeDiff
        }
      }

      // 如果大小相同，比较内容哈希
      const [hash1, hash2] = await Promise.all([
        this.getFileHash(path1, protocol, { algorithm: 'sha256' }),
        this.getFileHash(path2, protocol, { algorithm: 'sha256' })
      ])

      return {
        identical: hash1 === hash2,
        sizeDiff,
        contentDiff: hash1 !== hash2,
        timeDiff
      }
    } catch (error) {
      throw new FileOperationError(
        `Failed to compare files: ${this.getErrorMessage(error)}`,
        'COMPARE_ERROR',
        path1,
        protocol,
        error
      )
    }
  }
}
