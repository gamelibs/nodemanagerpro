import type { Project, ProjectLog } from '../types';

// PM2 进程信息接口
export interface PM2Process {
  pid: number;
  name: string;
  pm_id: number;
  status: 'online' | 'stopped' | 'error' | 'stopping' | 'launching';
  cpu: number;
  memory: number;
  uptime: number;
  restarts: number;
  pm2_env: {
    status: string;
    pm_cwd: string;
    exec_mode: string;
    pm_exec_path: string;
    [key: string]: any;
  };
}

// PM2 日志信息接口
export interface PM2LogData {
  message: string;
  timestamp: Date;
  process: string;
  type: 'out' | 'err';
}

/**
 * PM2 服务类 - 统一管理项目的启动、停止、日志等
 */
export class PM2Service {
  private static isInitialized = false;

  /**
   * 初始化 PM2 服务
   */
  static async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // 检查 PM2 是否已安装
      const isInstalled = await this.checkPM2Installation();
      if (!isInstalled) {
        console.warn('⚠️ PM2 未安装，将使用模拟模式');
        return false;
      }

      // 连接到 PM2 守护进程
      await this.connectPM2();
      this.isInitialized = true;
      console.log('✅ PM2 服务初始化成功');
      return true;
    } catch (error) {
      console.error('❌ PM2 服务初始化失败:', error);
      return false;
    }
  }

  /**
   * 检查 PM2 是否已安装
   */
  private static async checkPM2Installation(): Promise<boolean> {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.invoke('pm2:check-installation');
        return result.success;
      }
      return false;
    } catch (error) {
      console.error('检查 PM2 安装状态失败:', error);
      return false;
    }
  }

  /**
   * 连接到 PM2 守护进程
   */
  private static async connectPM2(): Promise<void> {
    if (window.electronAPI) {
      await window.electronAPI.invoke('pm2:connect');
    }
  }

  /**
   * 启动项目
   */
  static async startProject(project: Project): Promise<{
    success: boolean;
    processId?: number;
    error?: string;
  }> {
    try {
      if (!window.electronAPI) {
        return { success: false, error: '不在 Electron 环境中' };
      }

      const config = this.generatePM2Config(project);
      const result = await window.electronAPI.invoke('pm2:start', config);
      
      if (result.success) {
        console.log(`🚀 项目 ${project.name} 启动成功，PM2 ID: ${result.processId}`);
        return {
          success: true,
          processId: result.processId
        };
      } else {
        return {
          success: false,
          error: result.error || '启动失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '启动项目时发生错误'
      };
    }
  }

  /**
   * 停止项目
   */
  static async stopProject(projectId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!window.electronAPI) {
        return { success: false, error: '不在 Electron 环境中' };
      }

      const result = await window.electronAPI.invoke('pm2:stop', projectId);
      
      if (result.success) {
        console.log(`⏹️ 项目 ${projectId} 停止成功`);
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || '停止失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '停止项目时发生错误'
      };
    }
  }

  /**
   * 重启项目
   */
  static async restartProject(projectId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!window.electronAPI) {
        return { success: false, error: '不在 Electron 环境中' };
      }

      const result = await window.electronAPI.invoke('pm2:restart', projectId);
      
      if (result.success) {
        console.log(`🔄 项目 ${projectId} 重启成功`);
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || '重启失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '重启项目时发生错误'
      };
    }
  }

  /**
   * 删除项目（从 PM2 管理中移除）
   */
  static async deleteProject(projectId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!window.electronAPI) {
        return { success: false, error: '不在 Electron 环境中' };
      }

      const result = await window.electronAPI.invoke('pm2:delete', projectId);
      
      if (result.success) {
        console.log(`🗑️ 项目 ${projectId} 从 PM2 中移除成功`);
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || '删除失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除项目时发生错误'
      };
    }
  }

  /**
   * 获取项目状态
   */
  static async getProjectStatus(projectId: string): Promise<{
    success: boolean;
    status?: PM2Process;
    error?: string;
  }> {
    try {
      if (!window.electronAPI) {
        return { success: false, error: '不在 Electron 环境中' };
      }

      const result = await window.electronAPI.invoke('pm2:describe', projectId);
      
      if (result.success && result.status) {
        return {
          success: true,
          status: result.status
        };
      } else {
        return {
          success: false,
          error: result.error || '获取状态失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取项目状态时发生错误'
      };
    }
  }

  /**
   * 获取所有 PM2 管理的进程
   */
  static async listAllProcesses(): Promise<{
    success: boolean;
    processes?: PM2Process[];
    error?: string;
  }> {
    try {
      if (!window.electronAPI) {
        return { success: false, error: '不在 Electron 环境中' };
      }

      const result = await window.electronAPI.invoke('pm2:list');
      
      if (result.success) {
        return {
          success: true,
          processes: result.processes || []
        };
      } else {
        return {
          success: false,
          error: result.error || '获取进程列表失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取进程列表时发生错误'
      };
    }
  }

  /**
   * 获取项目日志
   */
  static async getProjectLogs(
    projectId: string,
    lines: number = 100
  ): Promise<{
    success: boolean;
    logs?: ProjectLog[];
    error?: string;
  }> {
    try {
      if (!window.electronAPI) {
        return { success: false, error: '不在 Electron 环境中' };
      }

      const result = await window.electronAPI.invoke('pm2:logs', projectId, lines);
      
      if (result.success) {
        return {
          success: true,
          logs: result.logs || []
        };
      } else {
        return {
          success: false,
          error: result.error || '获取日志失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取日志时发生错误'
      };
    }
  }

  /**
   * 开始实时日志流
   */
  static async startLogStream(projectId: string, callback: (log: ProjectLog) => void): Promise<void> {
    if (!window.electronAPI) return;

    // 设置日志监听器
    window.electronAPI.on('pm2:log-data', (data: PM2LogData) => {
      if (data.process === projectId) {
        const log: ProjectLog = {
          id: Date.now().toString(),
          projectId,
          timestamp: data.timestamp,
          level: data.type === 'err' ? 'error' : 'info',
          message: data.message,
          source: data.type === 'err' ? 'stderr' : 'stdout'
        };
        callback(log);
      }
    });

    // 开始日志流
    await window.electronAPI.invoke('pm2:start-log-stream', projectId);
  }

  /**
   * 停止实时日志流
   */
  static async stopLogStream(projectId: string): Promise<void> {
    if (!window.electronAPI) return;
    await window.electronAPI.invoke('pm2:stop-log-stream', projectId);
  }

  /**
   * 生成 PM2 配置
   */
  private static generatePM2Config(project: Project) {
    const startScript = project.scripts.find(s => s.name === 'start') || project.scripts[0];
    
    return {
      name: project.id,
      script: startScript?.command || 'npm start',
      cwd: project.path,
      env: {
        NODE_ENV: 'development',
        PORT: project.port?.toString() || '8000'
      },
      // PM2 配置选项
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: `./logs/${project.id}-error.log`,
      out_file: `./logs/${project.id}-out.log`,
      log_file: `./logs/${project.id}-combined.log`,
      time: true,
      merge_logs: true
    };
  }

  /**
   * 安装 PM2（如果未安装）
   */
  static async installPM2(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!window.electronAPI) {
        return { success: false, error: '不在 Electron 环境中' };
      }

      const result = await window.electronAPI.invoke('pm2:install');
      
      if (result.success) {
        console.log('✅ PM2 安装成功');
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || 'PM2 安装失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '安装 PM2 时发生错误'
      };
    }
  }

  /**
   * 获取 PM2 版本信息
   */
  static async getVersion(): Promise<{
    success: boolean;
    version?: string;
    error?: string;
  }> {
    try {
      if (!window.electronAPI) {
        return { success: false, error: '不在 Electron 环境中' };
      }

      const result = await window.electronAPI.invoke('pm2:version');
      
      if (result.success) {
        return {
          success: true,
          version: result.version
        };
      } else {
        return {
          success: false,
          error: result.error || '获取版本失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取版本时发生错误'
      };
    }
  }
}
