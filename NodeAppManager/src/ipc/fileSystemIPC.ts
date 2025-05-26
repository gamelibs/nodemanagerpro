// Electron主进程的IPC处理器
import { ipcMain } from 'electron';
import { FileSystemService } from '../services/FileSystemService';
import type { Project } from '../types';

let isSetup = false;

export function setupFileSystemIPC() {
  if (isSetup) {
    console.log('🔗 文件系统IPC处理器已存在，跳过重复设置');
    return;
  }

  // 清除可能存在的旧处理器（安全调用）
  try {
    ipcMain.removeHandler('fs:loadProjects');
    ipcMain.removeHandler('fs:saveProjects');
    ipcMain.removeHandler('fs:addProject');
    ipcMain.removeHandler('fs:removeProject');
    ipcMain.removeHandler('fs:updateProjectStatus');
    ipcMain.removeHandler('fs:getDataInfo');
  } catch (error) {
    // 忽略移除不存在处理器的错误
  }

  // 加载项目列表
  ipcMain.handle('fs:loadProjects', async () => {
    console.log('📡 收到 fs:loadProjects IPC调用');
    try {
      const projects = await FileSystemService.loadProjects();
      console.log('📡 fs:loadProjects 成功返回:', projects.length, '个项目');
      return { success: true, data: projects };
    } catch (error) {
      console.error('📡 fs:loadProjects 失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '加载项目失败' 
      };
    }
  });

  // 保存项目列表
  ipcMain.handle('fs:saveProjects', async (_, projects: Project[]) => {
    try {
      await FileSystemService.saveProjects(projects);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '保存项目失败' 
      };
    }
  });

  // 添加项目
  ipcMain.handle('fs:addProject', async (_, project: Project) => {
    try {
      await FileSystemService.addProject(project);
      return { success: true, data: project };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '添加项目失败' 
      };
    }
  });

  // 移除项目
  ipcMain.handle('fs:removeProject', async (_, projectId: string) => {
    try {
      await FileSystemService.removeProject(projectId);
      return { success: true, data: projectId };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '移除项目失败' 
      };
    }
  });

  // 更新项目状态
  ipcMain.handle('fs:updateProjectStatus', async (_, projectId: string, status: Project['status']) => {
    try {
      await FileSystemService.updateProjectStatus(projectId, status);
      return { success: true, data: { projectId, status } };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '更新项目状态失败' 
      };
    }
  });

  // 获取数据目录信息（调试用）
  ipcMain.handle('fs:getDataInfo', async () => {
    console.log('📡 收到 fs:getDataInfo IPC调用');
    try {
      const info = FileSystemService.getDataInfo();
      console.log('📡 fs:getDataInfo 成功返回:', info);
      return { success: true, data: info };
    } catch (error) {
      console.error('📡 fs:getDataInfo 失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '获取数据信息失败' 
      };
    }
  });

  isSetup = true;
  console.log('🔗 文件系统IPC处理器已设置');
}
