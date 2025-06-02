import { useState, useCallback } from 'react';
import { PM2Service } from '../../services/PM2Service';
import { useToastContext } from '../../store/ToastContext';
import type { Project } from '../../types';

export interface UseProjectOperationsReturn {
  isInstallingDependencies: boolean;
  isEditingPort: boolean;
  tempPort: string;
  startProject: (project: Project) => Promise<boolean>;
  stopProject: (project: Project) => Promise<boolean>;
  restartProject: (project: Project) => Promise<boolean>;
  installDependencies: (project: Project, packageManager: string) => Promise<boolean>;
  saveProjectPort: (project: Project, newPort: number) => Promise<boolean>;
  setIsEditingPort: (editing: boolean) => void;
  setTempPort: (port: string) => void;
}

// 生成PM2进程名称的辅助函数 - 使用稳定ID
const generateProcessName = (project: Project) => {
  return PM2Service.generateStableProjectId(project.name, project.path);
};

export const useProjectOperations = (): UseProjectOperationsReturn => {
  const [isInstallingDependencies, setIsInstallingDependencies] = useState(false);
  const [isEditingPort, setIsEditingPort] = useState(false);
  const [tempPort, setTempPort] = useState<string>('');
  
  // 使用全局Toast系统
  const { showToast } = useToastContext();

  // 启动项目
  const startProject = useCallback(async (project: Project): Promise<boolean> => {
    try {
      const processName = generateProcessName(project);
      console.log('🚀 启动项目:', project.name, '进程名:', processName);
      
      const result = await PM2Service.startProject(project);
      
      if (result.success) {
        console.log('✅ 项目启动成功');
        showToast(`项目 ${project.name} 启动成功`, 'success');
        return true;
      } else {
        console.error('❌ 项目启动失败:', result.error);
        showToast(`项目启动失败: ${result.error}`, 'error');
        return false;
      }
    } catch (error) {
      console.error('启动项目时发生错误:', error);
      showToast('启动项目时发生错误', 'error');
      return false;
    }
  }, [showToast]);

  // 停止项目
  const stopProject = useCallback(async (project: Project): Promise<boolean> => {
    try {
      const processName = generateProcessName(project);
      console.log('🛑 停止项目:', project.name, '进程名:', processName);
      
      const result = await PM2Service.stopProject(project);
      
      if (result.success) {
        console.log('✅ 项目停止成功');
        showToast(`项目 ${project.name} 已停止`, 'success');
        return true;
      } else {
        console.error('❌ 项目停止失败:', result.error);
        showToast(`项目停止失败: ${result.error}`, 'error');
        return false;
      }
    } catch (error) {
      console.error('停止项目时发生错误:', error);
      showToast('停止项目时发生错误', 'error');
      return false;
    }
  }, [showToast]);

  // 重启项目
  const restartProject = useCallback(async (project: Project): Promise<boolean> => {
    try {
      const processName = generateProcessName(project);
      console.log('🔄 重启项目:', project.name, '进程名:', processName);
      
      const result = await PM2Service.restartProject(processName);
      
      if (result.success) {
        console.log('✅ 项目重启成功');
        showToast(`项目 ${project.name} 重启成功`, 'success');
        return true;
      } else {
        console.error('❌ 项目重启失败:', result.error);
        showToast(`项目重启失败: ${result.error}`, 'error');
        return false;
      }
    } catch (error) {
      console.error('重启项目时发生错误:', error);
      showToast('重启项目时发生错误', 'error');
      return false;
    }
  }, [showToast]);

  // 安装依赖包
  const installDependencies = useCallback(async (project: Project, packageManager: string = 'npm'): Promise<boolean> => {
    setIsInstallingDependencies(true);
    try {
      console.log('📦 开始安装依赖包:', project.name);
      showToast('正在安装依赖包...', 'info');

      // 使用 Electron API 执行安装命令
      const command = `${packageManager} install`;
      const result = await window.electronAPI?.invoke('exec:command', {
        command,
        cwd: project.path
      });

      if (result?.success) {
        console.log('✅ 依赖包安装成功');
        showToast('依赖包安装成功', 'success');
        return true;
      } else {
        console.error('❌ 依赖包安装失败:', result?.error);
        showToast(`依赖包安装失败: ${result?.error}`, 'error');
        return false;
      }
    } catch (error) {
      console.error('安装依赖包时发生错误:', error);
      showToast('安装依赖包时发生错误', 'error');
      return false;
    } finally {
      setIsInstallingDependencies(false);
    }
  }, [showToast]);

  // 保存项目端口配置
  const saveProjectPort = useCallback(async (project: Project, newPort: number): Promise<boolean> => {
    try {
      console.log('💾 保存项目端口:', project.name, '新端口:', newPort);

      // 首先尝试更新 .env 文件
      const envPath = `${project.path}/.env`;
      let envContent = '';
      
      // 读取现有的 .env 文件
      try {
        const result = await window.electronAPI?.invoke('fs:readFile', envPath);
        if (result?.success) {
          envContent = result.content;
        }
      } catch (e) {
        console.log('📄 .env 文件不存在，将创建新文件');
      }

      // 更新或添加 PORT 配置
      if (envContent.includes('PORT=')) {
        envContent = envContent.replace(/PORT\s*=\s*\d+/, `PORT=${newPort}`);
      } else {
        envContent += `${envContent ? '\n' : ''}PORT=${newPort}\n`;
      }

      // 写入 .env 文件
      const writeResult = await window.electronAPI?.invoke('fs:writeFile', envPath, envContent);
      
      if (writeResult?.success) {
        console.log('✅ 端口配置保存成功');
        showToast(`端口已更新为 ${newPort}`, 'success');
        return true;
      } else {
        console.error('❌ 端口配置保存失败:', writeResult?.error);
        showToast('端口配置保存失败', 'error');
        return false;
      }
    } catch (error) {
      console.error('保存端口配置时发生错误:', error);
      showToast('保存端口配置时发生错误', 'error');
      return false;
    }
  }, [showToast]);

  return {
    isInstallingDependencies,
    isEditingPort,
    tempPort,
    startProject,
    stopProject,
    restartProject,
    installDependencies,
    saveProjectPort,
    setIsEditingPort,
    setTempPort
  };
};
