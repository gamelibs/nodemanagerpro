// 渲染进程中的文件系统服务（通过IPC与主进程通信）
import type { Project, FileSystemResult } from '../types';

// 声明Electron API类型
declare global {
  interface Window {
    electronAPI?: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
  }
}

export class RendererFileSystemService {
  /**
   * 检查是否在Electron环境中
   */
  private static isElectron(): boolean {
    const result = typeof window !== 'undefined' && window.electronAPI !== undefined;
    console.log('🔍 检查Electron环境:', result);
    if (!result) {
      console.warn('⚠️ window.electronAPI 不可用');
      console.log('window对象:', typeof window);
      console.log('window.electronAPI:', window.electronAPI);
    }
    return result;
  }

  /**
   * 公开的方法检查是否在Electron环境中
   */
  static isInElectron(): boolean {
    return this.isElectron();
  }

  /**
   * 加载项目列表
   */
  static async loadProjects(): Promise<FileSystemResult> {
    console.log('🔄 RendererFileSystemService.loadProjects() 开始');
    
    if (!this.isElectron()) {
      console.warn('⚠️ 不在Electron环境中，返回空数组');
      return { success: true, data: [] };
    }

    try {
      console.log('📡 发送 fs:loadProjects IPC调用');
      const result = await window.electronAPI!.invoke('fs:loadProjects');
      console.log('📡 收到 fs:loadProjects 响应:', result);
      return result;
    } catch (error) {
      console.error('❌ fs:loadProjects IPC调用失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '加载项目失败'
      };
    }
  }

  /**
   * 保存项目列表
   */
  static async saveProjects(projects: Project[]): Promise<FileSystemResult> {
    if (!this.isElectron()) {
      console.warn('⚠️ 不在Electron环境中，跳过保存');
      return { success: false, error: '不在Electron环境中' };
    }

    try {
      const result = await window.electronAPI!.invoke('fs:saveProjects', projects);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '保存项目失败'
      };
    }
  }

  /**
   * 添加项目
   */
  static async addProject(project: Project): Promise<FileSystemResult> {
    if (!this.isElectron()) {
      console.warn('⚠️ 不在Electron环境中，跳过添加');
      return { success: false, error: '不在Electron环境中' };
    }

    try {
      const result = await window.electronAPI!.invoke('fs:addProject', project);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '添加项目失败'
      };
    }
  }

  /**
   * 移除项目
   */
  static async removeProject(projectId: string): Promise<FileSystemResult> {
    if (!this.isElectron()) {
      console.warn('⚠️ 不在Electron环境中，跳过移除');
      return { success: false, error: '不在Electron环境中' };
    }

    try {
      const result = await window.electronAPI!.invoke('fs:removeProject', projectId);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '移除项目失败'
      };
    }
  }

  /**
   * 更新项目状态
   */
  static async updateProjectStatus(projectId: string, status: Project['status']): Promise<FileSystemResult> {
    if (!this.isElectron()) {
      console.warn('⚠️ 不在Electron环境中，跳过更新');
      return { success: false, error: '不在Electron环境中' };
    }

    try {
      const result = await window.electronAPI!.invoke('fs:updateProjectStatus', projectId, status);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新项目状态失败'
      };
    }
  }

  /**
   * 获取数据目录信息
   */
  static async getDataInfo(): Promise<FileSystemResult> {
    if (!this.isElectron()) {
      return { 
        success: true, 
        data: { 
          dataDir: 'N/A (浏览器环境)', 
          projectsFile: 'N/A', 
          exists: false 
        } 
      };
    }

    try {
      const result = await window.electronAPI!.invoke('fs:getDataInfo');
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取数据信息失败'
      };
    }
  }
}
