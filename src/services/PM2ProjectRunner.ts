import { PM2Service } from './PM2Service';
import { useLogs } from '../hooks/useLogs';
import { useApp } from '../store/AppContext';
import type { Project } from '../types';

/**
 * 基于 PM2 的项目运行器
 */
export class PM2ProjectRunner {
  private logs: ReturnType<typeof useLogs>;
  private dispatch: ReturnType<typeof useApp>['dispatch'];
  private logStreams: Map<string, boolean> = new Map();

  constructor(logs: ReturnType<typeof useLogs>, dispatch: ReturnType<typeof useApp>['dispatch']) {
    this.logs = logs;
    this.dispatch = dispatch;
  }

  /**
   * 启动项目
   */
  async startProject(project: Project): Promise<boolean> {
    try {
      // 更新项目状态为启动中
      this.dispatch({
        type: 'UPDATE_PROJECT_STATUS',
        payload: { id: project.id, status: 'running' }
      });

      // 开始日志会话
      this.logs.startLogSession(project.id, project.name);

      // 添加启动日志
      this.logs.addLog({
        projectId: project.id,
        level: 'info',
        message: `🚀 正在启动项目: ${project.name}`,
        source: 'system'
      });

      // 使用 PM2 启动项目
      const result = await PM2Service.startProject(project);

      if (result.success) {
        // 启动成功，保存PM2进程信息
        this.dispatch({
          type: 'UPDATE_PROJECT',
          payload: {
            ...project,
            pm2: {
              processName: result.processName || `${project.name}-${project.id}`,
              processId: result.processId,
              pid: result.pid
            }
          }
        });

        this.logs.addLog({
          projectId: project.id,
          level: 'success',
          message: `✅ 项目启动成功 (PM2 ID: ${result.processId}, 进程名: ${result.processName})`,
          source: 'system'
        });

        this.logs.addLog({
          projectId: project.id,
          level: 'info',
          message: `📂 工作目录: ${project.path}`,
          source: 'system'
        });

        this.logs.addLog({
          projectId: project.id,
          level: 'info',
          message: `📦 包管理器: ${project.packageManager}`,
          source: 'system'
        });

        if (project.port) {
          this.logs.addLog({
            projectId: project.id,
            level: 'success',
            message: `🌐 服务地址: http://localhost:${project.port}`,
            source: 'system'
          });
        }

        // 启动实时日志流
        await this.startLogStream(project.id);

        return true;
      } else {
        // 启动失败
        this.logs.addLog({
          projectId: project.id,
          level: 'error',
          message: `❌ 项目启动失败: ${result.error}`,
          source: 'system'
        });

        this.dispatch({
          type: 'UPDATE_PROJECT_STATUS',
          payload: { id: project.id, status: 'error' }
        });

        return false;
      }
    } catch (error) {
      this.logs.addLog({
        projectId: project.id,
        level: 'error',
        message: `❌ 项目启动异常: ${error}`,
        source: 'system'
      });

      this.dispatch({
        type: 'UPDATE_PROJECT_STATUS',
        payload: { id: project.id, status: 'error' }
      });

      return false;
    }
  }

  /**
   * 停止项目
   */
  async stopProject(project: Project): Promise<void> {
    try {
      // 停止实时日志流
      await this.stopLogStream(project.id);

      // 使用 PM2 停止项目
      const result = await PM2Service.stopProject(project);

      if (result.success) {
        // 停止成功，清除PM2进程信息
        this.dispatch({
          type: 'UPDATE_PROJECT',
          payload: {
            ...project,
            pm2: undefined
          }
        });

        this.logs.addLog({
          projectId: project.id,
          level: 'success',
          message: `⏹️ 项目已停止`,
          source: 'system'
        });

        this.dispatch({
          type: 'UPDATE_PROJECT_STATUS',
          payload: { id: project.id, status: 'stopped' }
        });

        // 结束日志会话
        this.logs.endLogSession(project.id);
      } else {
        this.logs.addLog({
          projectId: project.id,
          level: 'error',
          message: `❌ 停止项目失败: ${result.error}`,
          source: 'system'
        });
      }
    } catch (error) {
      this.logs.addLog({
        projectId: project.id,
        level: 'error',
        message: `❌ 停止项目异常: ${error}`,
        source: 'system'
      });
    }
  }

  /**
   * 重启项目
   */
  async restartProject(project: Project): Promise<boolean> {
    try {
      this.logs.addLog({
        projectId: project.id,
        level: 'info',
        message: `🔄 正在重启项目: ${project.name}`,
        source: 'system'
      });

      // 使用 PM2 重启项目
      const result = await PM2Service.restartProject(project.id);

      if (result.success) {
        this.logs.addLog({
          projectId: project.id,
          level: 'success',
          message: `✅ 项目重启成功`,
          source: 'system'
        });

        this.dispatch({
          type: 'UPDATE_PROJECT_STATUS',
          payload: { id: project.id, status: 'running' }
        });

        return true;
      } else {
        this.logs.addLog({
          projectId: project.id,
          level: 'error',
          message: `❌ 项目重启失败: ${result.error}`,
          source: 'system'
        });

        this.dispatch({
          type: 'UPDATE_PROJECT_STATUS',
          payload: { id: project.id, status: 'error' }
        });

        return false;
      }
    } catch (error) {
      this.logs.addLog({
        projectId: project.id,
        level: 'error',
        message: `❌ 项目重启异常: ${error}`,
        source: 'system'
      });

      return false;
    }
  }

  /**
   * 获取项目状态
   */
  async getProjectStatus(project: Project): Promise<{
    success: boolean;
    status?: 'online' | 'stopped' | 'error' | 'stopping' | 'launching';
    cpu?: number;
    memory?: number;
    uptime?: number;
    restarts?: number;
  }> {
    try {
      const result = await PM2Service.getProjectStatus(project);
      
      if (result.success && result.status) {
        return {
          success: true,
          status: result.status.pm2_env.status as any,
          cpu: result.status.cpu,
          memory: result.status.memory,
          uptime: result.status.uptime,
          restarts: result.status.restarts
        };
      } else {
        return {
          success: false
        };
      }
    } catch (error) {
      return {
        success: false
      };
    }
  }

  /**
   * 启动实时日志流
   */
  private async startLogStream(projectId: string): Promise<void> {
    if (this.logStreams.get(projectId)) {
      return; // 已经在监听了
    }

    this.logStreams.set(projectId, true);

    try {
      await PM2Service.startLogStream(projectId, (log) => {
        this.logs.addLog(log);
      });
    } catch (error) {
      console.error('启动日志流失败:', error);
      this.logStreams.set(projectId, false);
    }
  }

  /**
   * 停止实时日志流
   */
  private async stopLogStream(projectId: string): Promise<void> {
    if (!this.logStreams.get(projectId)) {
      return; // 没有在监听
    }

    this.logStreams.set(projectId, false);

    try {
      await PM2Service.stopLogStream(projectId);
    } catch (error) {
      console.error('停止日志流失败:', error);
    }
  }

  /**
   * 加载历史日志
   */
  async loadProjectLogs(projectId: string, lines: number = 100): Promise<void> {
    try {
      const result = await PM2Service.getProjectLogs(projectId, lines);
      
      if (result.success && result.logs) {
        // 清空现有日志
        this.logs.clearProjectLogs(projectId);
        
        // 添加历史日志
        result.logs.forEach(log => {
          this.logs.addLog(log);
        });
      }
    } catch (error) {
      console.error('加载项目日志失败:', error);
    }
  }
}

/**
 * Hook for using PM2ProjectRunner
 */
export function usePM2ProjectRunner() {
  const logs = useLogs();
  const { dispatch } = useApp();
  
  const runner = new PM2ProjectRunner(logs, dispatch);
  
  return {
    startProject: runner.startProject.bind(runner),
    stopProject: runner.stopProject.bind(runner),
    restartProject: runner.restartProject.bind(runner),
    getProjectStatus: runner.getProjectStatus.bind(runner),
    loadProjectLogs: runner.loadProjectLogs.bind(runner),
    ...logs
  };
}
