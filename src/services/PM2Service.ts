import type { Project, ProjectLog } from '../types';

// PM2 进程信息接口
export interface PM2Process {
  pid: number;
  name: string;
  pm_id: number;
  status?: 'online' | 'stopped' | 'error' | 'errored' | 'stopping' | 'launching';
  cpu?: number;
  memory?: number;
  uptime?: number;
  pm2_env: {
    status: string;
    pm_cwd: string;
    exec_mode: string;
    pm_exec_path: string;
    [key: string]: any;
  };
  monit?: {
    memory: number;
    cpu: number;
  };
  [key: string]: any; // 允许其他未知字段
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
   * 生成稳定的项目ID - 基于项目名称和路径
   * 改进版本：保持更多信息以确保唯一性
   */
  static generateStableProjectId(projectName: string, projectPath: string): string {
    // 组合名称和路径，使用分隔符确保不会混淆
    const combined = `${projectName}|${projectPath}`;
    
    // 使用哈希来确保唯一性，而不是简单去除字符
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    
    // 确保哈希为正数
    const positiveHash = Math.abs(hash);
    
    // 转换为Base36字符串（包含数字和字母）
    const hashString = positiveHash.toString(36);
    
    // 结合项目名的前几个字符（清理后）+ 哈希
    const cleanName = projectName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6);
    const stableId = `${cleanName}${hashString}`.substring(0, 16);
    
    // 确保至少有8个字符，不足的用哈希补充
    if (stableId.length < 8) {
      return (stableId + hashString + '00000000').substring(0, 16);
    }
    
    return stableId;
  }

  /**
   * 生成 PM2 进程名称 - 使用稳定ID
   */
  private static generateProcessName(project: Project): string {
    // 使用稳定ID作为PM2进程名称
    return this.generateStableProjectId(project.name, project.path);
  }

  /**
   * 检查PM2中是否存在指定项目的进程，并返回状态同步信息
   */
  static async checkAndSyncPM2Status(projectName: string, projectPath: string): Promise<{
    exists: boolean;
    status?: 'running' | 'stopped' | 'error';
    processInfo?: PM2Process;
    message: string;
  }> {
    try {
      const stableId = this.generateStableProjectId(projectName, projectPath);
      console.log(`🔍 检查PM2进程: ${stableId} (${projectName})`);
      
      if (!window.electronAPI) {
        return {
          exists: false,
          status: 'error',
          message: '不在 Electron 环境中，无法检查PM2状态'
        };
      }

      const result = await window.electronAPI.invoke('pm2:describe', stableId);
      
      if (result.success && result.status) {
        // PM2中存在该进程
        const pm2Status = result.status.status;
        let projectStatus: 'running' | 'stopped' | 'error' = 'stopped';
        
        if (pm2Status === 'online') {
          projectStatus = 'running';
        } else if (pm2Status === 'error' || pm2Status === 'errored') {
          projectStatus = 'error';
        }
        
        console.log(`✅ 找到PM2进程: ${stableId}, 状态: ${projectStatus}`);
        return {
          exists: true,
          status: projectStatus,
          processInfo: result.status,
          message: `发现已存在的PM2进程 (${projectStatus}), 已同步状态`
        };
      } else {
        // PM2中不存在该进程
        console.log(`❌ 未找到PM2进程: ${stableId}`);
        return {
          exists: false,
          status: 'stopped',
          message: '未发现运行中的PM2进程，项目状态设为已停止'
        };
      }
    } catch (error) {
      console.error('检查PM2状态失败:', error);
      return {
        exists: false,
        status: 'error',
        message: `检查PM2状态失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

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
    processName?: string;
    pid?: number;
    error?: string;
  }> {
    try {
      if (!window.electronAPI) {
        return { success: false, error: '不在 Electron 环境中' };
      }

      const processName = this.generateProcessName(project);
      console.log(`🚀 准备启动项目 ${project.name}，PM2进程名: ${processName}`);

      // 1. 启动前检查是否存在同名进程
      console.log(`🔍 检查是否存在已运行的进程: ${processName}`);
      const existingStatus = await this.getProjectStatus(project);
      
      if (existingStatus.success && existingStatus.status) {
        const currentStatus = existingStatus.status.pm2_env?.status;
        console.log(`⚠️ 发现已存在的进程，状态: ${currentStatus}`);
        
        // 如果进程已在运行，先停止它
        if (currentStatus === 'online' || currentStatus === 'launching') {
          console.log(`🛑 停止已运行的进程: ${processName}`);
          const stopResult = await this.stopProject(project);
          if (!stopResult.success) {
            console.warn(`⚠️ 停止进程失败，尝试强制删除: ${stopResult.error}`);
            // 如果普通停止失败，尝试删除进程
            await window.electronAPI.invoke('pm2:delete', processName);
          }
          // 等待一秒确保进程完全停止
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else if (currentStatus === 'stopped' || currentStatus === 'error' || currentStatus === 'errored') {
          // 如果进程处于停止或错误状态，删除它
          console.log(`🗑️ 删除处于 ${currentStatus} 状态的进程: ${processName}`);
          await window.electronAPI.invoke('pm2:delete', processName);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // 2. 检查端口占用情况
      if (project.port) {
        console.log(`🔍 检查端口 ${project.port} 是否被占用`);
        const portCheckResult = await window.electronAPI.invoke('check-port', project.port);
        if (portCheckResult.occupied) {
          console.log(`⚠️ 端口 ${project.port} 被占用，尝试清理`);
          const killResult = await window.electronAPI.invoke('kill-port', project.port);
          if (killResult.success) {
            console.log(`✅ 端口 ${project.port} 清理成功`);
            // 等待端口完全释放
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            console.warn(`⚠️ 端口清理失败: ${killResult.error}`);
          }
        }
      }

      // 3. 生成配置并启动
      const config = this.generatePM2Config(project);
      console.log(`📋 生成PM2配置:`, config);
      
      const result = await window.electronAPI.invoke('pm2:start', config);
      
      if (result.success) {
        console.log(`🚀 项目 ${project.name} 启动成功，PM2 ID: ${result.processId}`);
        return {
          success: true,
          processId: result.processId,
          processName: config.name, // 返回PM2进程名称
          pid: result.pid // 返回系统进程ID
        };
      } else {
        console.error(`❌ 项目启动失败: ${result.error}`);
        return {
          success: false,
          error: result.error || '启动失败'
        };
      }
    } catch (error) {
      console.error(`💥 启动项目时发生异常:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '启动项目时发生错误'
      };
    }
  }

  /**
   * 停止项目
   */
  static async stopProject(project: Project): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!window.electronAPI) {
        return { success: false, error: '不在 Electron 环境中' };
      }

      // 优先使用保存的PM2进程名称，否则使用正确的进程名称生成逻辑
      const processIdentifier = project.pm2?.processName || this.generateProcessName(project);
      const result = await window.electronAPI.invoke('pm2:stop', processIdentifier);
      
      if (result.success) {
        console.log(`⏹️ 项目 ${project.name} 停止成功`);
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
  static async getProjectStatus(project: Project): Promise<{
    success: boolean;
    status?: PM2Process;
    error?: string;
  }> {
    try {
      if (!window.electronAPI) {
        return { success: false, error: '不在 Electron 环境中' };
      }

      // 使用正确的进程名称
      const processName = this.generateProcessName(project);
      const result = await window.electronAPI.invoke('pm2:describe', processName);
      
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
   * 获取项目性能数据 (CPU和内存使用率)
   */
  static async getProjectPerformance(project: Project): Promise<{
    success: boolean;
    performance?: {
      cpu: number;
      memory: number;
      uptime: number;
    };
    error?: string;
  }> {
    try {
      const statusResult = await this.getProjectStatus(project);
      
      if (statusResult.success && statusResult.status) {
        const status = statusResult.status;
        return {
          success: true,
          performance: {
            cpu: Math.round((status.cpu || 0) * 10) / 10, // 保留一位小数
            memory: Math.round((status.memory || 0) / 1024 / 1024 * 10) / 10, // 转换为MB并保留一位小数
            uptime: status.uptime || 0
          }
        };
      } else {
        return {
          success: false,
          error: statusResult.error || '获取性能数据失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取性能数据时发生错误'
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
      console.log('🔍 PM2Service.listAllProcesses: 开始获取进程列表');
      
      if (!window.electronAPI) {
        console.error('❌ PM2Service.listAllProcesses: 不在 Electron 环境中');
        return { success: false, error: '不在 Electron 环境中' };
      }

      console.log('🔗 PM2Service.listAllProcesses: 调用 pm2:list IPC');
      const result = await window.electronAPI.invoke('pm2:list');
      console.log('📋 PM2Service.listAllProcesses: IPC 返回结果:', result);
      
      if (result.success) {
        console.log('✅ PM2Service.listAllProcesses: 成功获取', result.processes?.length || 0, '个进程');
        return {
          success: true,
          processes: result.processes || []
        };
      } else {
        console.error('❌ PM2Service.listAllProcesses: 失败:', result.error);
        return {
          success: false,
          error: result.error || '获取进程列表失败'
        };
      }
    } catch (error) {
      console.error('💥 PM2Service.listAllProcesses: 异常:', error);
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
   * 获取项目最近日志（用于快速显示）
   */
  static async getRecentLogs(
    projectId: string,
    lines: number = 20
  ): Promise<{
    success: boolean;
    logs?: string[];
    error?: string;
  }> {
    try {
      if (!window.electronAPI) {
        return { success: false, error: '不在 Electron 环境中' };
      }

      const result = await window.electronAPI.invoke('pm2:logs', projectId, lines);
      
      if (result.success && result.logs) {
        // 将日志转换为简单的字符串数组，便于显示
        const logMessages = result.logs.map((log: any) => 
          `${log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''} ${log.message}`
        ).filter((msg: string) => msg.trim());
        
        return {
          success: true,
          logs: logMessages
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
    // 检查并处理空的或未定义的scripts数组
    const scripts = project.scripts || [];
    let startScript = scripts.find(s => s.name === 'start') || scripts[0];
    
    // 如果没有找到任何脚本，创建默认脚本
    if (!startScript) {
      console.log(`⚠️ 项目 ${project.name} 没有可用的启动脚本，使用默认配置`);
      
      // 根据项目类型和包管理器生成默认启动命令
      const packageManager = project.packageManager || 'npm';
      let defaultCommand = `${packageManager} start`;
      
      // 根据项目类型调整默认命令 - 使用正确的枚举值
      if (project.type === 'pure-api' || project.type === 'node') {
        // 对于API后端项目，默认使用node命令启动
        defaultCommand = 'node server.js'; // 默认使用server.js
      } else if (project.type === 'react') {
        defaultCommand = `${packageManager} run dev`;
      } else if (project.type === 'vue') {
        defaultCommand = `${packageManager} run dev`;
      } else if (project.type === 'full-stack') {
        defaultCommand = `${packageManager} run dev`;
      } else if (project.type === 'static-app') {
        defaultCommand = `${packageManager} run dev`;
      }
      
      startScript = {
        name: 'start',
        command: defaultCommand,
        description: '启动项目'
      };
    }

    // 环境变量配置
    const envVars: Record<string, string> = {
      NODE_ENV: 'development'
    };

    // 如果项目有端口配置，添加PORT环境变量
    if (project.port) {
      envVars.PORT = project.port.toString();
      console.log(`🌐 为项目 ${project.name} 设置端口: ${project.port}`);
    } else {
      console.log(`⚠️ 项目 ${project.name} 未配置端口，PM2将使用项目默认端口配置`);
    }
    
    return {
      name: this.generateProcessName(project), // 使用稳定ID作为进程名称
      script: startScript.command,
      cwd: project.path,
      env: envVars,
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
