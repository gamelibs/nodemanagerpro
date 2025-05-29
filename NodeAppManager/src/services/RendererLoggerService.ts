/**
 * 渲染进程日志服务
 * 与主进程的 LoggerService 通过 IPC 通信
 */
export class RendererLoggerService {
  private static isElectron(): boolean {
    return typeof window !== 'undefined' && !!window.electronAPI;
  }

  /**
   * 记录信息日志
   */
  static async info(message: string, data?: any): Promise<void> {
    if (this.isElectron()) {
      try {
        await window.electronAPI!.invoke('logger:log', 'info', message, data);
      } catch (error) {
        console.error('发送日志到主进程失败:', error);
      }
    }
    // 同时在控制台输出
    console.log(`[INFO] ${message}`, data);
  }

  /**
   * 记录警告日志
   */
  static async warn(message: string, data?: any): Promise<void> {
    if (this.isElectron()) {
      try {
        await window.electronAPI!.invoke('logger:log', 'warn', message, data);
      } catch (error) {
        console.error('发送日志到主进程失败:', error);
      }
    }
    console.warn(`[WARN] ${message}`, data);
  }

  /**
   * 记录错误日志
   */
  static async error(message: string, error?: Error | any): Promise<void> {
    if (this.isElectron()) {
      try {
        await window.electronAPI!.invoke('logger:log', 'error', message, error);
      } catch (ipcError) {
        console.error('发送日志到主进程失败:', ipcError);
      }
    }
    console.error(`[ERROR] ${message}`, error);
  }

  /**
   * 记录调试日志
   */
  static async debug(message: string, data?: any): Promise<void> {
    if (this.isElectron()) {
      try {
        await window.electronAPI!.invoke('logger:log', 'debug', message, data);
      } catch (error) {
        console.error('发送日志到主进程失败:', error);
      }
    }
    console.debug(`[DEBUG] ${message}`, data);
  }

  /**
   * 获取日志目录
   */
  static async getLogDirectory(): Promise<string | null> {
    if (!this.isElectron()) {
      return null;
    }

    try {
      const result = await window.electronAPI!.invoke('logger:getLogDirectory');
      return result.success ? result.data : null;
    } catch (error) {
      console.error('获取日志目录失败:', error);
      return null;
    }
  }

  /**
   * 获取最近的日志文件
   */
  static async getRecentLogFiles(days: number = 7): Promise<string[]> {
    if (!this.isElectron()) {
      return [];
    }

    try {
      const result = await window.electronAPI!.invoke('logger:getRecentLogFiles', days);
      return result.success ? result.data : [];
    } catch (error) {
      console.error('获取日志文件列表失败:', error);
      return [];
    }
  }

  /**
   * 读取日志文件内容
   */
  static async readLogFile(filePath: string): Promise<string[]> {
    if (!this.isElectron()) {
      return [];
    }

    try {
      const result = await window.electronAPI!.invoke('logger:readLogFile', filePath);
      return result.success ? result.data : [];
    } catch (error) {
      console.error('读取日志文件失败:', error);
      return [];
    }
  }
}
