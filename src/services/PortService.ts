import type { Project } from '../types';

// 端口状态接口
export interface PortStatus {
  port: number;
  isAvailable: boolean;
  occupiedBy?: string; // 占用进程信息
  error?: string;
}

/**
 * 端口检测服务类
 */
export class PortService {
  /**
   * 检查端口是否可用
   */
  static async checkPortAvailability(port: number): Promise<PortStatus> {
    try {
      if (!window.electronAPI) {
        return { 
          port, 
          isAvailable: false, 
          error: '不在 Electron 环境中' 
        };
      }

      const result = await window.electronAPI.invoke('port:check', port);
      
      return {
        port,
        isAvailable: result.available,
        occupiedBy: result.occupiedBy,
        error: result.error
      };
    } catch (error) {
      return {
        port,
        isAvailable: false,
        error: error instanceof Error ? error.message : '检查端口时发生错误'
      };
    }
  }

  /**
   * 批量检查多个端口
   */
  static async checkMultiplePorts(ports: number[]): Promise<PortStatus[]> {
    const promises = ports.map(port => this.checkPortAvailability(port));
    return Promise.all(promises);
  }

  /**
   * 为项目检查端口
   */
  static async checkProjectPort(project: Project): Promise<PortStatus | null> {
    if (!project.port) {
      console.warn('项目未设置端口，无法检查端口状态');
      return null;
    }
    return this.checkPortAvailability(project.port);
  }

  /**
   * 更新项目端口
   */
  static async updateProjectPort(project: Project, newPort: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!window.electronAPI) {
        return { success: false, error: '不在 Electron 环境中' };
      }

      // 先检查新端口是否可用
      const portStatus = await this.checkPortAvailability(newPort);
      if (!portStatus.isAvailable) {
        return { 
          success: false, 
          error: `端口 ${newPort} 已被占用${portStatus.occupiedBy ? ': ' + portStatus.occupiedBy : ''}` 
        };
      }

      // 更新项目配置
      const result = await window.electronAPI.invoke('project:update-port', {
        projectId: project.id,
        newPort: newPort
      });

      if (result.success) {
        console.log(`✅ 项目 ${project.name} 端口已更新为 ${newPort}`);
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || '更新端口失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新项目端口时发生错误'
      };
    }
  }

  /**
   * 生成项目访问URL
   */
  static getProjectURL(project: Project): string | null {
    const port = project.port;
    if (!port) return null;
    
    return `http://localhost:${port}`;
  }

  /**
   * 查找下一个可用端口（可选功能）
   */
  static async findNextAvailablePort(startPort: number, maxAttempts: number = 10): Promise<number | null> {
    for (let i = 0; i < maxAttempts; i++) {
      const port = startPort + i;
      const status = await this.checkPortAvailability(port);
      if (status.isAvailable) {
        return port;
      }
    }
    return null;
  }
}
