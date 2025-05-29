import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Node App Manager 应用日志服务
 * 
 * 功能特点：
 * - 持久化应用日志到文件
 * - 按日期滚动日志文件
 * - 支持不同日志级别
 * - 自动清理旧日志文件
 */
export class LoggerService {
  private static logDir: string;
  private static initialized = false;

  /**
   * 初始化日志服务
   */
  static initialize(): void {
    if (this.initialized) return;

    // 日志目录路径
    this.logDir = path.join(app.getPath('userData'), 'logs');
    
    // 确保日志目录存在
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    // 清理超过 30 天的旧日志
    this.cleanOldLogs();
    
    this.initialized = true;
    console.log('📝 LoggerService 已初始化，日志目录:', this.logDir);
  }

  /**
   * 记录信息日志
   */
  static info(message: string, data?: any): void {
    this.writeLog('INFO', message, data);
  }

  /**
   * 记录警告日志
   */
  static warn(message: string, data?: any): void {
    this.writeLog('WARN', message, data);
  }

  /**
   * 记录错误日志
   */
  static error(message: string, error?: Error | any): void {
    this.writeLog('ERROR', message, error);
  }

  /**
   * 记录调试日志（仅开发模式）
   */
  static debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      this.writeLog('DEBUG', message, data);
    }
  }

  /**
   * 写入日志到文件
   */
  private static writeLog(level: string, message: string, data?: any): void {
    if (!this.initialized) {
      this.initialize();
    }

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data: data ? (data instanceof Error ? {
        name: data.name,
        message: data.message,
        stack: data.stack
      } : data) : undefined
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    
    // 按日期生成日志文件名
    const dateStr = new Date().toISOString().split('T')[0];
    const logFile = path.join(this.logDir, `app-${dateStr}.log`);

    // 异步写入日志文件
    fs.appendFile(logFile, logLine, (err) => {
      if (err) {
        console.error('写入日志文件失败:', err);
      }
    });

    // 同时输出到控制台（开发模式）
    if (process.env.NODE_ENV === 'development') {
      const consoleMessage = `[${timestamp}] ${level}: ${message}`;
      switch (level) {
        case 'ERROR':
          console.error(consoleMessage, data);
          break;
        case 'WARN':
          console.warn(consoleMessage, data);
          break;
        case 'DEBUG':
          console.debug(consoleMessage, data);
          break;
        default:
          console.log(consoleMessage, data);
      }
    }
  }

  /**
   * 清理超过指定天数的旧日志文件
   */
  private static cleanOldLogs(maxAgeDays: number = 30): void {
    try {
      const files = fs.readdirSync(this.logDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

      files.forEach(file => {
        if (file.startsWith('app-') && file.endsWith('.log')) {
          const filePath = path.join(this.logDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime < cutoffDate) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ 已清理旧日志文件: ${file}`);
          }
        }
      });
    } catch (error) {
      console.error('清理旧日志文件失败:', error);
    }
  }

  /**
   * 获取日志目录路径
   */
  static getLogDirectory(): string {
    return this.logDir;
  }

  /**
   * 获取最近的日志文件列表
   */
  static getRecentLogFiles(days: number = 7): string[] {
    if (!this.initialized) {
      this.initialize();
    }

    try {
      const files = fs.readdirSync(this.logDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      return files
        .filter(file => file.startsWith('app-') && file.endsWith('.log'))
        .map(file => {
          const filePath = path.join(this.logDir, file);
          const stats = fs.statSync(filePath);
          return { file, path: filePath, mtime: stats.mtime };
        })
        .filter(item => item.mtime >= cutoffDate)
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
        .map(item => item.path);
    } catch (error) {
      console.error('获取日志文件列表失败:', error);
      return [];
    }
  }

  /**
   * 读取指定日志文件内容
   */
  static readLogFile(filePath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        const lines = data.trim().split('\n').filter(line => line.length > 0);
        resolve(lines);
      });
    });
  }
}

// 应用启动时自动初始化
LoggerService.initialize();
