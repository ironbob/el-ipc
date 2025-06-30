/**
 * 文件操作 IPC 通信框架类型定义
 */

// 协议类型
export enum FileProtocol {
  LOCAL = 'local',      // 本地文件系统
  HTTP = 'http',        // HTTP 协议
  HTTPS = 'https',      // HTTPS 协议
  SMB = 'smb',          // SMB 网络共享
  FTP = 'ftp',          // FTP 协议
  SFTP = 'sftp',        // SFTP 协议
  S3 = 's3',            // AWS S3
  WEBDAV = 'webdav'     // WebDAV 协议
}

// 文件编码类型
export enum FileEncoding {
  UTF8 = 'utf8',
  UTF16LE = 'utf16le',
  UTF16BE = 'utf16be',
  ASCII = 'ascii',
  LATIN1 = 'latin1',
  BASE64 = 'base64',
  HEX = 'hex',
  BINARY = 'binary',
  AUTO = 'auto'         // 自动检测编码
}

// 基础选项接口
export interface BaseFileOptions {
  timeout?: number      // 操作超时时间（毫秒）
  retries?: number      // 重试次数
  signal?: AbortSignal  // 取消信号
}

// 本地文件系统选项
export interface LocalFileOptions extends BaseFileOptions {
  mode?: number         // 文件权限模式
  flag?: string         // 文件打开标志
}

// HTTP/HTTPS 选项
export interface HttpFileOptions extends BaseFileOptions {
  headers?: Record<string, string>  // HTTP 头
  auth?: {
    username: string
    password: string
  }
  proxy?: string        // 代理设置
}

// SMB 选项
export interface SmbFileOptions extends BaseFileOptions {
  domain?: string       // 域名
  username: string      // 用户名
  password: string      // 密码
  workstation?: string  // 工作站名称
}

// FTP/SFTP 选项
export interface FtpFileOptions extends BaseFileOptions {
  host: string          // 主机地址
  port?: number         // 端口号
  username: string      // 用户名
  password?: string     // 密码
  privateKey?: string   // 私钥（SFTP）
  passphrase?: string   // 私钥密码
}

// S3 选项
export interface S3FileOptions extends BaseFileOptions {
  accessKeyId: string   // 访问密钥ID
  secretAccessKey: string // 秘密访问密钥
  region: string        // 区域
  bucket: string        // 存储桶名称
}

// WebDAV 选项
export interface WebDavFileOptions extends BaseFileOptions {
  username: string      // 用户名
  password: string      // 密码
  headers?: Record<string, string>  // 额外头信息
}

// 协议选项联合类型
export type FileOptions = 
  | LocalFileOptions
  | HttpFileOptions
  | SmbFileOptions
  | FtpFileOptions
  | S3FileOptions
  | WebDavFileOptions

// 文件统计信息
export interface FileStats {
  isFile: boolean       // 是否为文件
  isDirectory: boolean  // 是否为目录
  isSymbolicLink: boolean // 是否为符号链接
  size: number          // 文件大小（字节）
  mode: number          // 文件权限模式
  uid: number           // 用户ID
  gid: number           // 组ID
  atime: Date           // 访问时间
  mtime: Date           // 修改时间
  ctime: Date           // 创建时间
  birthtime: Date       // 出生时间
}

// 目录项信息
export interface DirectoryEntry {
  name: string          // 文件/目录名
  path: string          // 完整路径
  isFile: boolean       // 是否为文件
  isDirectory: boolean  // 是否为目录
  isSymbolicLink: boolean // 是否为符号链接
  size?: number         // 文件大小
  mtime?: Date          // 修改时间
  extension?: string    // 文件扩展名
}

// 文件读取选项
export interface ReadFileOptions extends BaseFileOptions {
  encoding?: FileEncoding // 文件编码
  start?: number        // 读取起始位置
  end?: number          // 读取结束位置
}

// 文件写入选项
export interface WriteFileOptions extends BaseFileOptions {
  encoding?: FileEncoding // 文件编码
  mode?: number         // 文件权限
  flag?: string         // 写入标志
  append?: boolean      // 是否追加写入
}

// 目录列表选项
export interface ListFilesOptions extends BaseFileOptions {
  recursive?: boolean   // 是否递归列出子目录
  includeHidden?: boolean // 是否包含隐藏文件
  filter?: string       // 文件名过滤器（glob 模式）
  sortBy?: 'name' | 'size' | 'mtime' | 'type' // 排序方式
  sortOrder?: 'asc' | 'desc' // 排序顺序
  limit?: number        // 结果数量限制
  offset?: number       // 偏移量
}

// 文件移动/复制选项
export interface MoveFileOptions extends BaseFileOptions {
  overwrite?: boolean   // 是否覆盖目标文件
  preserveTimestamps?: boolean // 是否保留时间戳
  createDirs?: boolean  // 是否创建目标目录
}

export interface CopyFileOptions extends MoveFileOptions {
  preserveMode?: boolean // 是否保留文件权限
  dereference?: boolean // 是否解引用符号链接
}

// 压缩选项
export interface ZipOptions extends BaseFileOptions {
  compression?: 'none' | 'fast' | 'best' // 压缩级别
  password?: string     // 压缩密码
  includeHidden?: boolean // 是否包含隐藏文件
  excludePatterns?: string[] // 排除模式
}

// 解压选项
export interface ExtractOptions extends BaseFileOptions {
  password?: string     // 解压密码
  overwrite?: boolean   // 是否覆盖现有文件
  preserveTimestamps?: boolean // 是否保留时间戳
  filter?: string[]     // 只解压指定文件
}

// 文件操作结果
export interface FileOperationResult {
  success: boolean      // 操作是否成功
  path?: string         // 操作的文件路径
  message?: string      // 结果消息
  error?: string        // 错误信息
  data?: any           // 返回数据
}

// 批量操作结果
export interface BatchOperationResult {
  success: boolean      // 整体是否成功
  results: FileOperationResult[] // 各个文件的操作结果
  successCount: number  // 成功数量
  failureCount: number  // 失败数量
}

// 进度回调函数类型
export type ProgressCallback = (progress: {
  current: number       // 当前进度
  total: number         // 总数
  percentage: number    // 百分比
  currentFile?: string  // 当前处理的文件
}) => void

// 文件操作事件类型
export enum FileOperationEventType {
  START = 'start',
  PROGRESS = 'progress',
  COMPLETE = 'complete',
  ERROR = 'error',
  CANCEL = 'cancel'
}

// 文件操作事件
export interface FileOperationEvent {
  type: FileOperationEventType
  operationId: string   // 操作ID
  data?: any           // 事件数据
  timestamp: Date      // 时间戳
}

// 文件监听选项
export interface WatchOptions extends BaseFileOptions {
  recursive?: boolean   // 是否递归监听
  events?: ('add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir')[] // 监听的事件类型
  ignored?: string[]    // 忽略的文件模式
  persistent?: boolean  // 是否持久监听
}

// 文件监听事件
export interface FileWatchEvent {
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir'
  path: string          // 文件路径
  stats?: FileStats     // 文件统计信息
  timestamp: Date       // 事件时间
}

// 错误类型
export class FileOperationError extends Error {
  constructor(
    message: string,
    public code: string,
    public path?: string,
    public protocol?: FileProtocol,
    public details?: any
  ) {
    super(message)
    this.name = 'FileOperationError'
  }
}

// 文本检测结果
export interface TextDetectionResult {
  encoding: FileEncoding // 检测到的编码
  confidence: number     // 置信度 (0-1)
  content: string        // 解码后的内容
  bom?: boolean         // 是否有 BOM
}

// 文件哈希选项
export interface HashOptions extends BaseFileOptions {
  algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512' // 哈希算法
}

// 文件比较结果
export interface FileCompareResult {
  identical: boolean    // 是否完全相同
  sizeDiff?: number     // 大小差异
  contentDiff?: boolean // 内容是否不同
  timeDiff?: number     // 时间差异（毫秒）
}

// 磁盘使用情况
export interface DiskUsage {
  total: number         // 总空间（字节）
  used: number          // 已使用空间（字节）
  available: number     // 可用空间（字节）
  percentage: number    // 使用百分比
}

// 文件权限
export interface FilePermissions {
  owner: {
    read: boolean
    write: boolean
    execute: boolean
  }
  group: {
    read: boolean
    write: boolean
    execute: boolean
  }
  others: {
    read: boolean
    write: boolean
    execute: boolean
  }
  mode: number          // 数字权限模式
}
