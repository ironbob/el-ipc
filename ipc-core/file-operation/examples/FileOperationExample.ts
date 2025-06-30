import { ProxyFileOperation } from '../ProxyFileOperation'
import { FileProtocol, FileEncoding } from '../types'

/**
 * 文件操作使用示例
 */
export class FileOperationExample {
  private fileOp: ProxyFileOperation

  constructor() {
    this.fileOp = new ProxyFileOperation()
    this.setupEventListeners()
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    this.fileOp.onProgress((progress) => {
      console.log('Progress:', progress)
    })

    this.fileOp.onOperationStart((data) => {
      console.log('Operation started:', data)
    })

    this.fileOp.onOperationComplete((data) => {
      console.log('Operation completed:', data)
    })
  }

  /**
   * 基本文件操作示例
   */
  async basicFileOperations(): Promise<void> {
    console.log('=== Basic File Operations ===')

    try {
      // 创建目录
      await this.fileOp.newDir('/tmp/test-dir', FileProtocol.LOCAL)
      console.log('Directory created')

      // 创建文件
      const testFile = '/tmp/test-dir/test.txt'
      await this.fileOp.write(testFile, 'Hello, World!', FileProtocol.LOCAL, {
        encoding: FileEncoding.UTF8
      })
      console.log('File created')

      // 读取文件
      const content = await this.fileOp.readText(testFile, FileProtocol.LOCAL)
      console.log('File content:', content)

      // 获取文件信息
      const stats = await this.fileOp.stat(testFile, FileProtocol.LOCAL)
      console.log('File stats:', stats)

      // 重命名文件
      const newPath = '/tmp/test-dir/renamed.txt'
      await this.fileOp.rename(testFile, newPath, FileProtocol.LOCAL)
      console.log('File renamed')

      // 列出目录内容
      const files = await this.fileOp.listFiles('/tmp/test-dir', FileProtocol.LOCAL)
      console.log('Directory contents:', files)

      // 删除文件
      await this.fileOp.delete(newPath, FileProtocol.LOCAL)
      console.log('File deleted')

    } catch (error) {
      console.error('Basic operations error:', error)
    }
  }

  /**
   * 文本编码检测示例
   */
  async textEncodingExample(): Promise<void> {
    console.log('\n=== Text Encoding Example ===')

    try {
      const testFile = '/tmp/encoding-test.txt'

      // 写入不同编码的文本
      const texts = [
        { content: 'Hello, World!', encoding: FileEncoding.UTF8 },
        { content: 'Hello, 世界!', encoding: FileEncoding.UTF8 },
        { content: 'Привет, мир!', encoding: FileEncoding.UTF8 }
      ]

      for (const { content, encoding } of texts) {
        await this.fileOp.write(testFile, content, FileProtocol.LOCAL, { encoding })
        
        // 自动检测编码并读取
        const result = await this.fileOp.readText(testFile, FileProtocol.LOCAL)
        console.log(`Content: ${content}`)
        console.log(`Detected encoding: ${result.encoding}`)
        console.log(`Confidence: ${result.confidence}`)
        console.log(`Decoded content: ${result.content}`)
        console.log('---')
      }

      await this.fileOp.delete(testFile, FileProtocol.LOCAL)

    } catch (error) {
      console.error('Text encoding error:', error)
    }
  }

  /**
   * 文件复制和移动示例
   */
  async copyMoveExample(): Promise<void> {
    console.log('\n=== Copy and Move Example ===')

    try {
      // 创建源目录和文件
      await this.fileOp.newDir('/tmp/source', FileProtocol.LOCAL)
      await this.fileOp.newDir('/tmp/destination', FileProtocol.LOCAL)

      const sourceFiles = [
        '/tmp/source/file1.txt',
        '/tmp/source/file2.txt',
        '/tmp/source/file3.txt'
      ]

      // 创建测试文件
      for (let i = 0; i < sourceFiles.length; i++) {
        await this.fileOp.write(
          sourceFiles[i], 
          `Content of file ${i + 1}`, 
          FileProtocol.LOCAL
        )
      }

      // 复制文件
      console.log('Copying files...')
      const copyResult = await this.fileOp.copyFiles(
        sourceFiles, 
        '/tmp/destination', 
        FileProtocol.LOCAL,
        { preserveTimestamps: true }
      )
      console.log('Copy result:', copyResult)

      // 移动文件到新位置
      await this.fileOp.newDir('/tmp/moved', FileProtocol.LOCAL)
      console.log('Moving files...')
      const moveResult = await this.fileOp.moveFiles(
        sourceFiles, 
        '/tmp/moved', 
        FileProtocol.LOCAL,
        { overwrite: true }
      )
      console.log('Move result:', moveResult)

      // 清理
      await this.fileOp.delete('/tmp/source', FileProtocol.LOCAL)
      await this.fileOp.delete('/tmp/destination', FileProtocol.LOCAL)
      await this.fileOp.delete('/tmp/moved', FileProtocol.LOCAL)

    } catch (error) {
      console.error('Copy/Move error:', error)
    }
  }

  /**
   * 压缩和解压示例
   */
  async compressionExample(): Promise<void> {
    console.log('\n=== Compression Example ===')

    try {
      // 创建测试文件
      await this.fileOp.newDir('/tmp/compress-test', FileProtocol.LOCAL)
      
      const testFiles = [
        '/tmp/compress-test/doc1.txt',
        '/tmp/compress-test/doc2.txt',
        '/tmp/compress-test/doc3.txt'
      ]

      for (let i = 0; i < testFiles.length; i++) {
        await this.fileOp.write(
          testFiles[i], 
          `Document ${i + 1} content\nLine 2\nLine 3`, 
          FileProtocol.LOCAL
        )
      }

      // 创建子目录
      await this.fileOp.newDir('/tmp/compress-test/subdir', FileProtocol.LOCAL)
      await this.fileOp.write(
        '/tmp/compress-test/subdir/nested.txt', 
        'Nested file content', 
        FileProtocol.LOCAL
      )

      // 压缩文件
      const zipPath = '/tmp/test-archive.zip'
      console.log('Creating zip archive...')
      const zipResult = await this.fileOp.zipFiles(
        ['/tmp/compress-test'], 
        zipPath, 
        FileProtocol.LOCAL,
        { compression: 'best' }
      )
      console.log('Zip result:', zipResult)

      // 删除原始文件
      await this.fileOp.delete('/tmp/compress-test', FileProtocol.LOCAL)

      // 解压文件
      console.log('Extracting zip archive...')
      const extractResult = await this.fileOp.extractZip(
        zipPath, 
        '/tmp/extracted', 
        FileProtocol.LOCAL,
        { overwrite: true }
      )
      console.log('Extract result:', extractResult)

      // 验证解压结果
      const extractedFiles = await this.fileOp.listFiles(
        '/tmp/extracted', 
        FileProtocol.LOCAL, 
        { recursive: true }
      )
      console.log('Extracted files:', extractedFiles.map(f => f.path))

      // 清理
      await this.fileOp.delete(zipPath, FileProtocol.LOCAL)
      await this.fileOp.delete('/tmp/extracted', FileProtocol.LOCAL)

    } catch (error) {
      console.error('Compression error:', error)
    }
  }

  /**
   * 文件比较和哈希示例
   */
  async comparisonExample(): Promise<void> {
    console.log('\n=== File Comparison Example ===')

    try {
      const file1 = '/tmp/file1.txt'
      const file2 = '/tmp/file2.txt'
      const file3 = '/tmp/file3.txt'

      // 创建测试文件
      const content = 'This is test content for comparison'
      await this.fileOp.write(file1, content, FileProtocol.LOCAL)
      await this.fileOp.write(file2, content, FileProtocol.LOCAL) // 相同内容
      await this.fileOp.write(file3, content + ' modified', FileProtocol.LOCAL) // 不同内容

      // 计算文件哈希
      const hash1 = await this.fileOp.getFileHash(file1, FileProtocol.LOCAL, { algorithm: 'sha256' })
      const hash2 = await this.fileOp.getFileHash(file2, FileProtocol.LOCAL, { algorithm: 'sha256' })
      const hash3 = await this.fileOp.getFileHash(file3, FileProtocol.LOCAL, { algorithm: 'sha256' })

      console.log('File hashes:')
      console.log('File1:', hash1)
      console.log('File2:', hash2)
      console.log('File3:', hash3)

      // 比较文件
      const comparison1vs2 = await this.fileOp.compareFiles(file1, file2, FileProtocol.LOCAL)
      const comparison1vs3 = await this.fileOp.compareFiles(file1, file3, FileProtocol.LOCAL)

      console.log('Comparison file1 vs file2:', comparison1vs2)
      console.log('Comparison file1 vs file3:', comparison1vs3)

      // 清理
      await this.fileOp.delete(file1, FileProtocol.LOCAL)
      await this.fileOp.delete(file2, FileProtocol.LOCAL)
      await this.fileOp.delete(file3, FileProtocol.LOCAL)

    } catch (error) {
      console.error('Comparison error:', error)
    }
  }

  /**
   * 高级搜索示例
   */
  async advancedSearchExample(): Promise<void> {
    console.log('\n=== Advanced Search Example ===')

    try {
      // 创建测试目录结构
      await this.fileOp.newDir('/tmp/search-test', FileProtocol.LOCAL)
      await this.fileOp.newDir('/tmp/search-test/docs', FileProtocol.LOCAL)
      await this.fileOp.newDir('/tmp/search-test/images', FileProtocol.LOCAL)
      await this.fileOp.newDir('/tmp/search-test/scripts', FileProtocol.LOCAL)

      // 创建不同类型的文件
      const files = [
        { path: '/tmp/search-test/readme.txt', content: 'Project readme file' },
        { path: '/tmp/search-test/docs/manual.pdf', content: 'PDF content' },
        { path: '/tmp/search-test/docs/guide.txt', content: 'User guide' },
        { path: '/tmp/search-test/images/photo.jpg', content: 'JPEG data' },
        { path: '/tmp/search-test/scripts/build.sh', content: '#!/bin/bash\necho "Building..."' },
        { path: '/tmp/search-test/.hidden', content: 'Hidden file' }
      ]

      for (const file of files) {
        await this.fileOp.write(file.path, file.content, FileProtocol.LOCAL)
      }

      // 基本列表
      console.log('All files:')
      const allFiles = await this.fileOp.listFiles('/tmp/search-test', FileProtocol.LOCAL, {
        recursive: true
      })
      allFiles.forEach(f => console.log(`  ${f.path} (${f.isDirectory ? 'DIR' : 'FILE'})`))

      // 过滤文本文件
      console.log('\nText files only:')
      const textFiles = await this.fileOp.listFiles('/tmp/search-test', FileProtocol.LOCAL, {
        recursive: true,
        filter: '.*\\.txt$'
      })
      textFiles.forEach(f => console.log(`  ${f.path}`))

      // 包含隐藏文件
      console.log('\nIncluding hidden files:')
      const withHidden = await this.fileOp.listFiles('/tmp/search-test', FileProtocol.LOCAL, {
        recursive: true,
        includeHidden: true
      })
      withHidden.forEach(f => console.log(`  ${f.path}`))

      // 按大小排序
      console.log('\nSorted by size:')
      const sortedBySize = await this.fileOp.listFiles('/tmp/search-test', FileProtocol.LOCAL, {
        recursive: true,
        sortBy: 'size',
        sortOrder: 'desc'
      })
      sortedBySize.forEach(f => console.log(`  ${f.path} (${f.size} bytes)`))

      // 清理
      await this.fileOp.delete('/tmp/search-test', FileProtocol.LOCAL)

    } catch (error) {
      console.error('Advanced search error:', error)
    }
  }

  /**
   * 运行所有示例
   */
  async runAllExamples(): Promise<void> {
    console.log('🚀 Starting File Operation Examples')
    
    try {
      await this.basicFileOperations()
      await this.textEncodingExample()
      await this.copyMoveExample()
      await this.compressionExample()
      await this.comparisonExample()
      await this.advancedSearchExample()
      
      console.log('\n✅ All examples completed successfully!')
      
    } catch (error) {
      console.error('❌ Example execution failed:', error)
    }
  }
}

// 导出示例实例
export const fileOperationExample = new FileOperationExample()
