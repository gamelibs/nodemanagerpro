import { LoggerService } from '../services/LoggerService';

const { ipcMain } = require('electron');

/**
 * 设置日志相关的IPC处理器
 */
export function setupLoggerIPC(): void {
  // 获取日志目录
  ipcMain.handle('logger:getLogDirectory', async () => {
    try {
      return {
        success: true,
        data: LoggerService.getLogDirectory()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取日志目录失败'
      };
    }
  });

  // 获取最近的日志文件
  ipcMain.handle('logger:getRecentLogFiles', async (_event: any, days: number = 7) => {
    try {
      const files = LoggerService.getRecentLogFiles(days);
      return {
        success: true,
        data: files
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取日志文件列表失败'
      };
    }
  });

  // 读取日志文件内容
  ipcMain.handle('logger:readLogFile', async (_event: any, filePath: string) => {
    try {
      const lines = await LoggerService.readLogFile(filePath);
      return {
        success: true,
        data: lines
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '读取日志文件失败'
      };
    }
  });

  // 记录来自渲染进程的日志
  ipcMain.handle('logger:log', async (_event: any, level: string, message: string, data?: any) => {
    try {
      switch (level) {
        case 'info':
          LoggerService.info(`[Renderer] ${message}`, data);
          break;
        case 'warn':
          LoggerService.warn(`[Renderer] ${message}`, data);
          break;
        case 'error':
          LoggerService.error(`[Renderer] ${message}`, data);
          break;
        case 'debug':
          LoggerService.debug(`[Renderer] ${message}`, data);
          break;
        default:
          LoggerService.info(`[Renderer] ${message}`, data);
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '记录日志失败'
      };
    }
  });

  console.log('📝 Logger IPC 处理器设置完成');
}
