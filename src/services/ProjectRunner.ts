import { useLogs } from '../hooks/useLogs';
import { useApp } from '../store/AppContext';
import type { Project } from '../types';

export class ProjectRunner {
  private logs: ReturnType<typeof useLogs>;
  private dispatch: ReturnType<typeof useApp>['dispatch'];

  constructor(logs: ReturnType<typeof useLogs>, dispatch: ReturnType<typeof useApp>['dispatch']) {
    this.logs = logs;
    this.dispatch = dispatch;
  }

  async startProject(project: Project): Promise<boolean> {
    try {
      // 更新项目状态为运行中
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
        message: `🚀 启动项目: ${project.name}`,
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

      // 模拟启动过程
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (project.port) {
        this.logs.addLog({
          projectId: project.id,
          level: 'success',
          message: `🌐 服务地址: http://localhost:${project.port}`,
          source: 'system'
        });
      }

      this.logs.addLog({
        projectId: project.id,
        level: 'success',
        message: `✅ 项目启动成功`,
        source: 'system'
      });

      return true;
    } catch (error) {
      this.logs.addLog({
        projectId: project.id,
        level: 'error',
        message: `❌ 项目启动失败: ${error}`,
        source: 'system'
      });

      this.dispatch({
        type: 'UPDATE_PROJECT_STATUS',
        payload: { id: project.id, status: 'error' }
      });

      return false;
    }
  }

  async stopProject(project: Project): Promise<void> {
    try {
      this.logs.addLog({
        projectId: project.id,
        level: 'info',
        message: `🛑 正在停止项目...`,
        source: 'system'
      });

      // 模拟停止过程
      await new Promise(resolve => setTimeout(resolve, 500));

      this.logs.addLog({
        projectId: project.id,
        level: 'success',
        message: `✅ 项目已停止`,
        source: 'system'
      });

      // 结束日志会话
      this.logs.endLogSession(project.id);

      // 更新项目状态
      this.dispatch({
        type: 'UPDATE_PROJECT_STATUS',
        payload: { id: project.id, status: 'stopped' }
      });
    } catch (error) {
      this.logs.addLog({
        projectId: project.id,
        level: 'error',
        message: `❌ 停止项目失败: ${error}`,
        source: 'system'
      });
    }
  }
}

// Hook for using ProjectRunner
export function useProjectRunner() {
  const logs = useLogs();
  const { dispatch } = useApp();
  
  const runner = new ProjectRunner(logs, dispatch);
  
  return {
    startProject: runner.startProject.bind(runner),
    stopProject: runner.stopProject.bind(runner),
    ...logs
  };
}
