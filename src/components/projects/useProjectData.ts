import { useState, useCallback } from 'react';
import { PM2Service, type PM2Process } from '../../services/PM2Service';
import type { Project } from '../../types';

export interface UseProjectDataReturn {
  pm2Status: PM2Process | null;
  isLoadingPM2: boolean;
  packageInfo: any;
  isLoadingPackage: boolean;
  dependencyStatus: {[key: string]: boolean};
  isCheckingDependencies: boolean;
  projectPort: number | null;
  pm2Logs: string[];
  isLoadingLogs: boolean;
  fetchProjectData: (project: Project) => Promise<void>;
  refreshPM2Status: (project: Project) => Promise<PM2Process | null>;
  refreshPackageInfo: (project: Project) => Promise<any>;
  refreshProjectPort: (project: Project) => Promise<number | null>;
  checkDependencies: (project: Project, packageData: any) => Promise<void>;
  fetchPM2Logs: (project: Project) => Promise<void>;
  clearData: () => void;
}

// 生成PM2进程名称的辅助函数
const generateProcessName = (project: Project) => {
  return `${project.name}-${project.id}`;
};

export const useProjectData = (): UseProjectDataReturn => {
  const [pm2Status, setPm2Status] = useState<PM2Process | null>(null);
  const [isLoadingPM2, setIsLoadingPM2] = useState(false);
  const [packageInfo, setPackageInfo] = useState<any>(null);
  const [isLoadingPackage, setIsLoadingPackage] = useState(false);
  const [dependencyStatus, setDependencyStatus] = useState<{[key: string]: boolean}>({});
  const [isCheckingDependencies, setIsCheckingDependencies] = useState(false);
  const [projectPort, setProjectPort] = useState<number | null>(null);
  const [pm2Logs, setPm2Logs] = useState<string[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // 清空所有数据
  const clearData = useCallback(() => {
    setPm2Status(null);
    setPackageInfo(null);
    setDependencyStatus({});
    setProjectPort(null);
    setPm2Logs([]);
  }, []);

  // 获取PM2状态
  const refreshPM2Status = useCallback(async (project: Project): Promise<PM2Process | null> => {
    setIsLoadingPM2(true);
    try {
      console.log('🔍 正在获取项目PM2状态:', project.name);
      const result = await PM2Service.listAllProcesses();
      if (result.success && result.processes) {
        console.log('📋 PM2进程列表:', result.processes);
        
        const expectedProcessName = generateProcessName(project);
        console.log('🎯 期望的进程名称:', expectedProcessName);
        
        const projectProcess = result.processes.find(
          (proc: PM2Process) => {
            if (proc.name === expectedProcessName) {
              return true;
            }
            if (proc.pm2_env && proc.pm2_env.pm_cwd === project.path) {
              return true;
            }
            if (proc.name && (
              proc.name === project.name || 
              proc.name.includes(project.name) ||
              project.name.includes(proc.name)
            )) {
              return true;
            }
            return false;
          }
        );
        
        if (projectProcess) {
          console.log('✅ 找到匹配的PM2进程:', projectProcess);
        } else {
          console.log('❌ 未找到匹配的PM2进程');
        }
        
        setPm2Status(projectProcess || null);
        return projectProcess || null;
      } else {
        console.log('❌ 获取PM2进程列表失败:', result.error);
        setPm2Status(null);
        return null;
      }
    } catch (error) {
      console.error('获取PM2状态失败:', error);
      setPm2Status(null);
      return null;
    } finally {
      setIsLoadingPM2(false);
    }
  }, []);

  // 获取package.json信息
  const refreshPackageInfo = useCallback(async (project: Project): Promise<any> => {
    setIsLoadingPackage(true);
    try {
      const packagePath = `${project.path}/package.json`;
      console.log('📡 尝试读取:', packagePath);
      
      const result = await window.electronAPI?.invoke('fs:readFile', packagePath);
      
      if (result?.success && result.content) {
        const packageData = JSON.parse(result.content);
        console.log('📦 成功读取并设置 package.json:', packageData.name, packageData.version);
        setPackageInfo(packageData);
        return packageData;
      } else {
        console.log('❌ 无法读取 package.json:', result?.error);
        setPackageInfo(null);
        return null;
      }
    } catch (error) {
      console.error('📡 读取package.json失败:', error);
      setPackageInfo(null);
      return null;
    } finally {
      setIsLoadingPackage(false);
    }
  }, []);

  // 读取项目端口配置
  const refreshProjectPort = useCallback(async (project: Project): Promise<number | null> => {
    try {
      // 尝试从 .env 文件读取端口
      const envPath = `${project.path}/.env`;
      try {
        const result = await window.electronAPI?.invoke('fs:readFile', envPath);
        if (result?.success) {
          const portMatch = result.content.match(/PORT\s*=\s*(\d+)/);
          if (portMatch) {
            const port = parseInt(portMatch[1]);
            setProjectPort(port);
            return port;
          }
        }
      } catch (e) {
        // .env 文件不存在或读取失败
      }

      // 尝试从 vite.config.js/ts 读取端口
      const viteConfigPath = `${project.path}/vite.config.ts`;
      const viteConfigJsPath = `${project.path}/vite.config.js`;
      
      let configContent = null;
      try {
        const result = await window.electronAPI?.invoke('fs:readFile', viteConfigPath);
        if (result?.success) {
          configContent = result.content;
        }
      } catch (e) {
        try {
          const result = await window.electronAPI?.invoke('fs:readFile', viteConfigJsPath);
          if (result?.success) {
            configContent = result.content;
          }
        } catch (e2) {
          // 继续尝试其他配置文件
        }
      }

      if (configContent) {
        const portMatch = configContent.match(/port:\s*(\d+)/);
        if (portMatch) {
          const port = parseInt(portMatch[1]);
          setProjectPort(port);
          return port;
        }
      }

      // 返回项目记录中的端口或默认端口
      const port = project.port || 3000;
      setProjectPort(port);
      return port;
    } catch (error) {
      console.error('读取项目端口失败:', error);
      const port = project.port || 3000;
      setProjectPort(port);
      return port;
    }
  }, []);

  // 检查依赖安装状态
  const checkDependencies = useCallback(async (project: Project, packageData: any): Promise<void> => {
    if (!packageData) {
      setDependencyStatus({});
      return;
    }

    setIsCheckingDependencies(true);
    try {
      const allDependencies = {
        ...packageData.dependencies,
        ...packageData.devDependencies
      };

      console.log('🔍 要检查的依赖包:', Object.keys(allDependencies));

      if (Object.keys(allDependencies).length === 0) {
        console.log('🔍 无依赖包需要检查');
        setDependencyStatus({});
        return;
      }

      const nodeModulesPath = `${project.path}/node_modules`;
      const status: {[key: string]: boolean} = {};

      for (const [depName] of Object.entries(allDependencies)) {
        try {
          const depPath = `${nodeModulesPath}/${depName}/package.json`;
          const result = await window.electronAPI?.invoke('fs:readFile', depPath);
          status[depName] = result?.success === true;
        } catch (error) {
          status[depName] = false;
        }
      }

      setDependencyStatus(status);
      console.log('📦 依赖包安装状态检查完成:', status);
    } catch (error) {
      console.error('检查依赖包安装状态失败:', error);
      setDependencyStatus({});
    } finally {
      setIsCheckingDependencies(false);
    }
  }, []);

  // 获取PM2日志
  const fetchPM2Logs = useCallback(async (project: Project): Promise<void> => {
    setIsLoadingLogs(true);
    try {
      const processName = generateProcessName(project);
      const result = await PM2Service.getRecentLogs(processName, 15);
      
      if (result.success && result.logs) {
        setPm2Logs(result.logs);
      } else {
        setPm2Logs([]);
      }
    } catch (error) {
      console.error('获取PM2日志失败:', error);
      setPm2Logs([]);
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  // 获取项目的所有数据
  const fetchProjectData = useCallback(async (project: Project): Promise<void> => {
    console.log('🔄 获取项目最新数据...');
    clearData();
    
    // 立即获取PM2状态
    await refreshPM2Status(project);
    
    // 并行获取其他信息
    const [packageData] = await Promise.all([
      refreshPackageInfo(project),
      refreshProjectPort(project),
      fetchPM2Logs(project)
    ]);
    
    // 在package.json加载完成后检查依赖状态
    if (packageData) {
      await checkDependencies(project, packageData);
    }
  }, [refreshPM2Status, refreshPackageInfo, refreshProjectPort, fetchPM2Logs, checkDependencies, clearData]);

  return {
    pm2Status,
    isLoadingPM2,
    packageInfo,
    isLoadingPackage,
    dependencyStatus,
    isCheckingDependencies,
    projectPort,
    pm2Logs,
    isLoadingLogs,
    fetchProjectData,
    refreshPM2Status,
    refreshPackageInfo,
    refreshProjectPort,
    checkDependencies,
    fetchPM2Logs,
    clearData
  };
};
