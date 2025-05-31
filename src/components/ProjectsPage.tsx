import { useState, useEffect } from 'react';
import CreateProjectModal from './CreateProjectModal';
import ProjectSettingsModal from './ProjectSettingsModal';
import { useProjects } from '../hooks/useProjects';
import { useApp } from '../store/AppContext';
import { PM2Service, type PM2Process } from '../services/PM2Service';
import type { Project } from '../types';

interface ProjectsPageProps {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
}

export default function ProjectsPage({ 
  projects, 
  isLoading, 
  error
}: ProjectsPageProps) {
  const { createProject, importProject, removeProject, updateProject, synchronizeProjectStatuses } = useProjects();
  const { navigation, i18n } = useApp();
  const { setActiveTab } = navigation;
  const { t } = i18n;
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [pm2Status, setPm2Status] = useState<PM2Process | null>(null); // PM2进程状态
  const [isLoadingPM2, setIsLoadingPM2] = useState(false);
  const [pm2Logs, setPm2Logs] = useState<string[]>([]); // PM2日志
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [packageInfo, setPackageInfo] = useState<any>(null); // package.json 信息
  const [isLoadingPackage, setIsLoadingPackage] = useState(false);
  const [dependencyStatus, setDependencyStatus] = useState<{[key: string]: boolean}>({}); // 依赖包安装状态
  const [isCheckingDependencies, setIsCheckingDependencies] = useState(false);
  const [projectPort, setProjectPort] = useState<number | null>(null); // 项目端口
  const [isEditingPort, setIsEditingPort] = useState(false); // 是否正在编辑端口
  const [tempPort, setTempPort] = useState<string>(''); // 临时端口输入值
  const [isInstallingDependencies, setIsInstallingDependencies] = useState(false); // 是否正在安装依赖
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  
  // 生成PM2进程名称的辅助函数
  const generateProcessName = (project: Project) => {
    return `${project.name}-${project.id}`;
  };

  // 同步项目状态和测试PM2服务
  useEffect(() => {
    if (projects.length > 0) {
      synchronizeProjectStatuses();
    }
    // 测试PM2服务
    testPM2Service();
  }, [projects.length, synchronizeProjectStatuses]);

  // 批量同步所有项目的状态
  const syncAllProjectsStatus = async () => {
    try {
      console.log('🔄 开始同步所有项目状态...');
      const result = await PM2Service.listAllProcesses();
      if (result.success && result.processes) {
        console.log('📋 获取到PM2进程列表:', result.processes.length, '个进程');
        await synchronizeProjectStatuses();
      }
    } catch (error) {
      console.error('❌ 同步项目状态失败:', error);
    }
  };

  // 在组件加载和项目列表变化时同步状态
  useEffect(() => {
    if (projects.length > 0) {
      syncAllProjectsStatus();
    }
  }, [projects.length]);

  // 获取选中项目的PM2状态（仅在切换到概览标签时触发）
  const fetchPM2Status = async () => {
    if (!selectedProject) {
      setPm2Status(null);
      return;
    }

    setIsLoadingPM2(true);
    try {
      console.log('🔍 正在获取项目PM2状态:', selectedProject.name);
      const result = await PM2Service.listAllProcesses();
      if (result.success && result.processes) {
        console.log('📋 PM2进程列表:', result.processes);
        
        // 生成期望的进程名称
        const expectedProcessName = generateProcessName(selectedProject);
        console.log('🎯 期望的进程名称:', expectedProcessName);
        
        // 更严格的匹配逻辑：优先匹配进程名称，然后匹配路径
        const projectProcess = result.processes.find(
          (proc: PM2Process) => {
            // 先检查进程名称是否完全匹配
            if (proc.name === expectedProcessName) {
              return true;
            }
            // 再检查路径是否匹配
            if (proc.pm2_env && proc.pm2_env.pm_cwd === selectedProject.path) {
              return true;
            }
            // 最后检查名称是否部分匹配（兼容旧版本）
            if (proc.name && (
              proc.name === selectedProject.name || 
              proc.name.includes(selectedProject.name) ||
              selectedProject.name.includes(proc.name)
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
      } else {
        console.log('❌ 获取PM2进程列表失败:', result.error);
        setPm2Status(null);
      }
    } catch (error) {
      console.error('获取PM2状态失败:', error);
      setPm2Status(null);
    } finally {
      setIsLoadingPM2(false);
    }
  };

  // 获取PM2日志
  const fetchPM2Logs = async () => {
    if (!selectedProject) {
      setPm2Logs([]);
      return;
    }

    setIsLoadingLogs(true);
    try {
      const processName = generateProcessName(selectedProject);
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
  };

  // 读取项目的 package.json 文件
  const fetchPackageInfo = async () => {
    console.log('📡 fetchPackageInfo 开始:', { selectedProject: selectedProject?.name });
    
    if (!selectedProject) {
      console.log('📡 fetchPackageInfo: 无选中项目，设置 packageInfo 为 null');
      setPackageInfo(null);
      return;
    }

    setIsLoadingPackage(true);
    try {
      const packagePath = `${selectedProject.path}/package.json`;
      console.log('📡 尝试读取:', packagePath);
      
      // 使用 Electron API 读取文件
      const result = await window.electronAPI?.invoke('fs:readFile', packagePath);
      
      if (result?.success && result.content) {
        const packageData = JSON.parse(result.content);
        console.log('📦 成功读取并设置 package.json:', packageData.name, packageData.version);
        setPackageInfo(packageData);
      } else {
        console.log('❌ 无法读取 package.json:', result?.error);
        setPackageInfo(null);
      }
    } catch (error) {
      console.error('📡 fetchPackageInfo 读取失败:', error);
      setPackageInfo(null);
    } finally {
      setIsLoadingPackage(false);
    }
  };

  // 检查依赖包安装状态
  const checkDependencyInstallation = async () => {
    console.log('🔍 开始检查依赖安装状态', { selectedProject: selectedProject?.name, packageInfo: !!packageInfo });
    
    if (!selectedProject || !packageInfo) {
      console.log('🔍 跳过检查: 缺少项目或 packageInfo');
      setDependencyStatus({});
      return;
    }

    setIsCheckingDependencies(true);
    try {
      const allDependencies = {
        ...packageInfo.dependencies,
        ...packageInfo.devDependencies
      };

      console.log('🔍 要检查的依赖包:', Object.keys(allDependencies));

      if (Object.keys(allDependencies).length === 0) {
        console.log('🔍 无依赖包需要检查');
        setDependencyStatus({});
        return;
      }

      const nodeModulesPath = `${selectedProject.path}/node_modules`;
      const status: {[key: string]: boolean} = {};

      // 检查每个依赖包是否安装
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
  };

  // 检查是否有关键依赖包未安装
  const hasUninstalledDependencies = () => {
    if (!packageInfo || !packageInfo.dependencies) {
      console.log('🔍 hasUninstalledDependencies: 无 packageInfo 或 dependencies');
      return false;
    }
    
    // 如果还在检查依赖状态，返回 false（不禁用）
    if (isCheckingDependencies) {
      console.log('🔍 hasUninstalledDependencies: 正在检查依赖状态');
      return false;
    }
    
    // 如果依赖状态还没检查完，返回 false
    if (Object.keys(dependencyStatus).length === 0) {
      console.log('🔍 hasUninstalledDependencies: 依赖状态为空');
      return false;
    }
    
    // 检查生产依赖是否有未安装的包
    const productionDeps = Object.keys(packageInfo.dependencies);
    const hasUninstalled = productionDeps.some(dep => dependencyStatus[dep] === false);
    console.log('🔍 hasUninstalledDependencies: 检查结果', {
      productionDeps,
      dependencyStatus,
      hasUninstalled
    });
    return hasUninstalled;
  };

  // 从项目配置文件读取端口
  const readProjectPort = async () => {
    if (!selectedProject) return null;

    try {
      // 尝试从 package.json 的 scripts 中读取端口
      if (packageInfo && packageInfo.scripts) {
        const devScript = packageInfo.scripts.dev || packageInfo.scripts.start;
        if (devScript) {
          const portMatch = devScript.match(/--port[=\s]+(\d+)/);
          if (portMatch) {
            return parseInt(portMatch[1]);
          }
        }
      }

      // 尝试从 vite.config.js/ts 读取端口
      const viteConfigPath = `${selectedProject.path}/vite.config.ts`;
      const viteConfigJsPath = `${selectedProject.path}/vite.config.js`;
      
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
          return parseInt(portMatch[1]);
        }
      }

      // 尝试从 .env 文件读取端口
      const envPath = `${selectedProject.path}/.env`;
      try {
        const result = await window.electronAPI?.invoke('fs:readFile', envPath);
        if (result?.success) {
          const portMatch = result.content.match(/PORT\s*=\s*(\d+)/);
          if (portMatch) {
            return parseInt(portMatch[1]);
          }
        }
      } catch (e) {
        // .env 文件不存在或读取失败
      }

      // 返回项目记录中的端口或默认端口
      return selectedProject.port || 3000;
    } catch (error) {
      console.error('读取项目端口失败:', error);
      return selectedProject.port || 3000;
    }
  };

  // 保存端口到项目配置文件
  const saveProjectPort = async (newPort: number) => {
    if (!selectedProject) return false;

    try {
      let saved = false;

      // 1. 尝试更新 vite.config.ts/js
      const viteConfigPath = `${selectedProject.path}/vite.config.ts`;
      const viteConfigJsPath = `${selectedProject.path}/vite.config.js`;
      
      let configPath = null;
      let configContent = null;
      
      try {
        const result = await window.electronAPI?.invoke('fs:readFile', viteConfigPath);
        if (result?.success) {
          configPath = viteConfigPath;
          configContent = result.content;
        }
      } catch (e) {
        try {
          const result = await window.electronAPI?.invoke('fs:readFile', viteConfigJsPath);
          if (result?.success) {
            configPath = viteConfigJsPath;
            configContent = result.content;
          }
        } catch (e2) {
          // 继续尝试其他文件
        }
      }

      if (configPath && configContent) {
        // 更新 vite 配置文件中的端口
        let updatedContent = configContent;
        
        if (configContent.includes('port:')) {
          // 替换现有的端口配置
          updatedContent = configContent.replace(/port:\s*\d+/, `port: ${newPort}`);
        } else if (configContent.includes('server:')) {
          // 在 server 配置中添加端口
          updatedContent = configContent.replace(
            /server:\s*{/,
            `server: {\n    port: ${newPort},`
          );
        } else {
          // 添加完整的 server 配置
          updatedContent = configContent.replace(
            /export default defineConfig\({/,
            `export default defineConfig({\n  server: {\n    port: ${newPort}\n  },`
          );
        }

        const writeResult = await window.electronAPI?.invoke('fs:writeFile', configPath, updatedContent);
        if (writeResult?.success) {
          saved = true;
          console.log('✅ 已更新 vite 配置文件端口');
        }
      }

      // 2. 尝试更新 .env 文件
      const envPath = `${selectedProject.path}/.env`;
      try {
        const result = await window.electronAPI?.invoke('fs:readFile', envPath);
        if (result?.success) {
          let envContent = result.content;
          if (envContent.includes('PORT=')) {
            envContent = envContent.replace(/PORT\s*=\s*\d+/, `PORT=${newPort}`);
          } else {
            envContent += `\nPORT=${newPort}\n`;
          }
          
          const writeResult = await window.electronAPI?.invoke('fs:writeFile', envPath, envContent);
          if (writeResult?.success) {
            saved = true;
            console.log('✅ 已更新 .env 文件端口');
          }
        } else {
          // 创建新的 .env 文件
          const envContent = `PORT=${newPort}\n`;
          const writeResult = await window.electronAPI?.invoke('fs:writeFile', envPath, envContent);
          if (writeResult?.success) {
            saved = true;
            console.log('✅ 已创建 .env 文件并设置端口');
          }
        }
      } catch (e) {
        // .env 文件操作失败，继续尝试其他方式
      }

      // 3. 更新应用中的项目记录
      if (saved) {
        try {
          await updateProject(selectedProject.id, { port: newPort });
          console.log('✅ 已更新项目记录中的端口');
        } catch (e) {
          console.error('更新项目记录失败:', e);
        }
      }

      return saved;
    } catch (error) {
      console.error('保存项目端口失败:', error);
      return false;
    }
  };

  // 处理端口编辑
  const handlePortEdit = async () => {
    setIsEditingPort(true);
    const currentPort = await readProjectPort();
    setTempPort(currentPort?.toString() || '3000');
  };

  const handlePortSave = async () => {
    const newPort = parseInt(tempPort);
    if (isNaN(newPort) || newPort < 1 || newPort > 65535) {
      showToast('端口号无效，请输入 1-65535 之间的数字', 'error');
      return;
    }

    const success = await saveProjectPort(newPort);
    if (success) {
      setProjectPort(newPort);
      setIsEditingPort(false);
      showToast('端口设置已保存到项目配置文件', 'success');
    } else {
      showToast('保存端口设置失败', 'error');
    }
  };

  const handlePortCancel = () => {
    setIsEditingPort(false);
    setTempPort('');
  };

  // 安装项目依赖
  const handleInstallDependencies = async () => {
    if (!selectedProject) {
      showToast('请先选择一个项目', 'error');
      return;
    }

    if (!packageInfo) {
      showToast('未找到 package.json 文件', 'error');
      return;
    }

    setIsInstallingDependencies(true);
    showToast('正在安装依赖包...', 'info');

    try {
      console.log(`🔧 开始安装依赖: ${selectedProject.path}`);
      
      // 使用现有的 IPC 调用
      const result = await window.electronAPI?.invoke('project:installDependencies', selectedProject.path);

      if (result?.success) {
        showToast('依赖安装成功！', 'success');
        console.log('✅ 依赖安装成功:', result.data);
        // 给文件系统一些时间完成操作，然后重新检查依赖状态
        setTimeout(async () => {
          console.log('🔄 重新检查依赖安装状态...');
          await checkDependencyInstallation();
        }, 2000); // 增加到2秒延迟
      } else {
        console.error('❌ 依赖安装失败:', result?.error);
        showToast(`依赖安装失败: ${result?.error || '未知错误'}`, 'error');
      }
    } catch (error) {
      console.error('安装依赖失败:', error);
      showToast('安装依赖失败，请检查网络连接', 'error');
    } finally {
      setIsInstallingDependencies(false);
    }
  };

  // 当选中项目时获取PM2状态和日志
  useEffect(() => {
    console.log('🔄 selectedProject useEffect 触发:', { selectedProject: selectedProject?.name });
    
    if (selectedProject) {
      fetchPM2Status();
      fetchPM2Logs();
      fetchPackageInfo();
      
      // 读取项目端口并同步到项目记录
      const loadProjectPort = async () => {
        const port = await readProjectPort();
        setProjectPort(port);
        
        // 如果读取到的端口与项目记录中的端口不同，则更新项目记录
        if (port && port !== selectedProject.port) {
          try {
            await updateProject(selectedProject.id, { port });
            console.log(`✅ 已同步项目端口到记录: ${port}`);
          } catch (error) {
            console.error('同步项目端口失败:', error);
          }
        }
      };
      loadProjectPort();
    } else {
      console.log('🔄 清除所有项目状态 - selectedProject 为空');
      setPm2Status(null);
      setPm2Logs([]);
      setPackageInfo(null);
      setProjectPort(null);
      setDependencyStatus({}); // 清除依赖状态
      setIsCheckingDependencies(false); // 重置检查状态
    }
  }, [selectedProject]);

  // 当 packageInfo 更新时检查依赖安装状态
  useEffect(() => {
    console.log('🔍 packageInfo useEffect 触发:', { packageInfo: !!packageInfo, packageInfoData: packageInfo?.name });
    if (packageInfo) {
      checkDependencyInstallation();
    } else {
      console.log('🔍 清除依赖状态 - packageInfo 为空');
      setDependencyStatus({});
    }
  }, [packageInfo]);

  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  const handleImportProject = async () => {
    await importProject();
  };

  const handleCreateConfirm = async (projectConfig: Parameters<typeof createProject>[0]) => {
    await createProject(projectConfig);
    setShowCreateModal(false);
  };

  const handleSelectProject = (project: Project) => {
    console.log('👆 选择项目:', project.name, project.id);
    setSelectedProject(project);
  };

  // 删除项目
  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    
    try {
      await removeProject(selectedProject.id);
      // 删除成功后清空选中状态
      setSelectedProject(null);
      // Toast 消息由 useProjects hook 中的 removeProject 函数负责显示
    } catch (error) {
      console.error('删除项目失败:', error);
      // 只在出现意外错误时显示本地 Toast
      showToast(t('toast.deleteProjectError'), 'error');
    }
  };

  // 启动项目
  const handleStartProject = async () => {
    if (!selectedProject) return;
    
    try {
      setIsLoadingPM2(true);
      console.log('🚀 开始启动项目:', selectedProject.name);
      
      const result = await PM2Service.startProject(selectedProject);
      console.log('启动结果:', result);
      
      if (result.success) {
        console.log('✅ 项目启动成功，刷新PM2状态...');
        // 启动成功后立即刷新状态和日志
        await fetchPM2Status();
        await fetchPM2Logs();
      } else {
        console.error('❌ 项目启动失败:', result.error);
      }
    } catch (error) {
      console.error('启动项目失败:', error);
    } finally {
      setIsLoadingPM2(false);
    }
  };

  // 停止项目
  const handleStopProject = async () => {
    if (!selectedProject) return;
    
    try {
      setIsLoadingPM2(true);
      
      // 使用正确的进程名称
      const processName = generateProcessName(selectedProject);
      console.log('⏹️ 开始停止项目:', selectedProject.name, '进程名:', processName);
      
      const result = await PM2Service.stopProject(selectedProject);
      console.log('停止结果:', result);
      
      if (result.success) {
        console.log('✅ 项目停止成功，刷新PM2状态...');
        // 停止成功后立即刷新状态和日志
        await fetchPM2Status();
        await fetchPM2Logs();
      } else {
        console.error('❌ 项目停止失败:', result.error);
      }
    } catch (error) {
      console.error('停止项目失败:', error);
    } finally {
      setIsLoadingPM2(false);
    }
  };

  // 重启项目
  const handleRestartProject = async () => {
    if (!selectedProject) return;
    
    try {
      setIsLoadingPM2(true);
      
      // 使用正确的进程名称
      const processName = generateProcessName(selectedProject);
      console.log('🔄 开始重启项目:', selectedProject.name, '进程名:', processName);
      
      const result = await PM2Service.restartProject(processName);
      console.log('重启结果:', result);
      
      if (result.success) {
        console.log('✅ 项目重启成功，刷新PM2状态...');
        // 重启成功后立即刷新状态和日志
        await fetchPM2Status();
        await fetchPM2Logs();
      } else {
        console.error('❌ 项目重启失败:', result.error);
      }
    } catch (error) {
      console.error('重启项目失败:', error);
    } finally {
      setIsLoadingPM2(false);
    }
  };

  const handleCloseSettings = () => {
    setShowSettingsModal(false);
    setTimeout(() => {
      setSelectedProject(null);
    }, 300);
  };

  // 测试PM2服务连接
  const testPM2Service = async () => {
    console.log('🧪 测试PM2服务连接...');
    try {
      const result = await PM2Service.listAllProcesses();
      console.log('🧪 PM2服务测试结果:', result);
    } catch (error) {
      console.error('🧪 PM2服务测试失败:', error);
    }
  };

  // 显示toast消息
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 快速操作：在文件夹中打开
  const handleOpenInFolder = async () => {
    if (!selectedProject) {
      showToast('请先选择一个项目', 'error');
      return;
    }

    try {
      const result = await window.electronAPI?.invoke('shell:openPath', selectedProject.path);
      if (result?.success) {
        showToast('已在文件夹中打开项目', 'success');
      } else {
        showToast(`${t('toast.openFolderError')}: ${result?.error || t('toast.unknownError')}`, 'error');
      }
    } catch (error) {
      console.error('打开文件夹失败:', error);
      showToast('打开文件夹失败', 'error');
    }
  };

  // 快速操作：在编辑器中打开
  const handleOpenInEditor = async () => {
    if (!selectedProject) {
      showToast('请先选择一个项目', 'error');
      return;
    }

    try {
      const result = await window.electronAPI?.invoke('shell:openInEditor', selectedProject.path);
      if (result?.success) {
        showToast('已在编辑器中打开项目', 'success');
      } else {
        showToast(`${t('toast.openEditorError')}: ${result?.error || t('toast.unknownError')}`, 'error');
      }
    } catch (error) {
      console.error('打开编辑器失败:', error);
      showToast('打开编辑器失败', 'error');
    }
  };

  // 快速操作：在浏览器中打开
  const handleOpenInBrowser = async () => {
    if (!selectedProject) {
      showToast('请先选择一个项目', 'error');
      return;
    }

    // 检查项目是否正在运行 - 优先检查PM2状态，然后检查项目状态
    const isRunning = pm2Status?.status === 'online' || selectedProject.status === 'running';
    
    if (!isRunning) {
      // 如果状态显示未运行，尝试刷新PM2状态
      await fetchPM2Status();
      
      // 给状态更新一点时间，然后再检查
      setTimeout(async () => {
        const updatedIsRunning = pm2Status?.status === 'online' || selectedProject.status === 'running';
        
        if (!updatedIsRunning) {
          // 即使状态检查失败，也尝试打开浏览器（可能是状态同步问题）
          showToast('状态检查失败，尝试强制打开浏览器...', 'info');
          await tryOpenBrowser();
        }
      }, 100);
      
      // 立即尝试打开浏览器
      await tryOpenBrowser();
    } else {
      await tryOpenBrowser();
    }
  };

  // 尝试在浏览器中打开项目的辅助函数
  const tryOpenBrowser = async () => {
    try {
      // 获取项目端口，优先使用PM2状态中的端口，然后使用项目端口
      let port = pm2Status?.port || selectedProject?.port;
      
      // 如果没有端口信息，根据项目类型猜测常见端口
      if (!port) {
        const commonPorts = [3000, 5173, 8080, 4000, 3001, 5000];
        port = commonPorts[0]; // 默认使用3000
      }
      
      const url = `http://localhost:${port}`;
      
      const result = await window.electronAPI?.invoke('shell:openExternal', url);
      if (result?.success) {
        showToast(`已在浏览器中打开: ${url}`, 'success');
      } else {
        showToast(`${t('toast.openBrowserError')}: ${result?.error || t('toast.unknownError')}`, 'error');
      }
    } catch (error) {
      console.error('打开浏览器失败:', error);
      showToast('打开浏览器失败', 'error');
    }
  };

  // 渲染项目详情内容
  const renderProjectDetails = () => {
    if (!selectedProject) {
      return (
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold theme-text-primary mb-2">{t('projects.selectProject')}</h3>
            <p className="theme-text-muted">{t('projects.selectProjectDesc')}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        {/* 项目详情内容 */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="theme-bg-secondary p-4 rounded-lg">
                  <h4 className="font-semibold theme-text-primary mb-2">基本信息</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="theme-text-muted">项目描述:</span>
                        <button
                          onClick={handleOpenInEditor}
                          className="text-blue-600 hover:text-blue-800 text-xs opacity-70 hover:opacity-100 flex items-center gap-1"
                          title="在编辑器中打开项目"
                        >
                          ✏️ 编辑器
                        </button>
                      </div>
                      <span className="theme-text-primary">
                        {isLoadingPackage ? '读取中...' : (packageInfo?.description || '暂无描述')}
                      </span>
                    </div>
                    
                    {/* 项目详细信息 - 移动到这里 */}
                    <div className="mt-3 pt-2 border-t theme-border">
                      <div className="font-medium theme-text-primary mb-1 text-xs">项目详情:</div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="theme-text-muted text-xs">项目路径:</span>
                          <div className="flex items-center gap-1">
                            <span className="theme-text-primary text-xs max-w-32 truncate" title={selectedProject.path}>
                              {selectedProject.path}
                            </span>
                            <button
                              onClick={handleOpenInFolder}
                              className="text-blue-600 hover:text-blue-800 text-xs opacity-70 hover:opacity-100"
                              title="在文件夹中打开"
                            >
                              📂
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="theme-text-muted text-xs">项目类型:</span>
                          <span className="theme-text-primary text-xs">{selectedProject.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="theme-text-muted text-xs">包管理器:</span>
                          <span className="theme-text-primary text-xs">{selectedProject.packageManager}</span>
                        </div>
                        {isLoadingPackage ? (
                          <div className="flex items-center justify-center py-2">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                            <span className="ml-2 text-xs theme-text-muted">读取包信息...</span>
                          </div>
                        ) : packageInfo ? (
                          <>
                            {packageInfo.version && (
                              <div className="flex justify-between">
                                <span className="theme-text-muted text-xs">项目版本:</span>
                                <span className="theme-text-primary text-xs">{packageInfo.version}</span>
                              </div>
                            )}
                            {packageInfo.main && (
                              <div className="flex justify-between">
                                <span className="theme-text-muted text-xs">入口文件:</span>
                                <span className="theme-text-primary text-xs">{packageInfo.main}</span>
                              </div>
                            )}
                            
                            {/* 端口编辑功能 */}
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="theme-text-muted text-xs">项目地址:</span>
                                <a
                                  href={`http://localhost:${projectPort || selectedProject?.port || 3000}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleOpenInBrowser();
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                  title="在浏览器中打开"
                                >
                                  http://localhost:{projectPort || selectedProject?.port || 3000}
                                </a>
                                <button
                                  onClick={handleOpenInBrowser}
                                  className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="在浏览器中打开"
                                >
                                </button>
                              </div>
                              {isEditingPort ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={tempPort}
                                    onChange={(e) => setTempPort(e.target.value)}
                                    className="w-16 px-1 py-0.5 text-xs border rounded theme-bg-primary theme-text-primary theme-border focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    min="1"
                                    max="65535"
                                    autoFocus
                                  />
                                  <button
                                    onClick={handlePortSave}
                                    className="text-green-600 hover:text-green-800 text-xs"
                                    title="保存端口"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={handlePortCancel}
                                    className="text-red-600 hover:text-red-800 text-xs"
                                    title="取消"
                                  >
                                    ✗
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span className="theme-text-muted text-xs">端口:</span>
                                  <span className="theme-text-primary text-xs">
                                    {projectPort || selectedProject?.port || 3000}
                                  </span>
                                  <button
                                    onClick={handlePortEdit}
                                    className="text-blue-600 hover:text-blue-800 text-xs opacity-70 hover:opacity-100"
                                    title="编辑端口（将修改项目配置文件）"
                                  >
                                    ✏️
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="text-xs theme-text-muted italic">
                            未找到 package.json 文件
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 依赖包信息 */}
                    {packageInfo && (packageInfo.dependencies || packageInfo.devDependencies) && (
                          <div className="mt-3 pt-2 border-t theme-border">
                            <div className="font-medium theme-text-primary mb-1 text-xs">依赖包信息:</div>
                            
                            {/* 依赖缺失警告和安装按钮 */}
                            {hasUninstalledDependencies() && (
                              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded px-2 py-1 mb-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    <span className="text-orange-600">⚠</span>
                                    <span className="text-xs text-orange-700 dark:text-orange-300">
                                      检测到未安装的依赖包，项目可能无法正常启动
                                    </span>
                                  </div>
                                  <button
                                    onClick={handleInstallDependencies}
                                    disabled={isInstallingDependencies}
                                    className={`px-2 py-1 text-xs rounded transition-colors ${
                                      isInstallingDependencies
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-800/20 dark:text-blue-300 dark:hover:bg-blue-800/40'
                                    }`}
                                    title={`使用 ${selectedProject?.packageManager || 'npm'} 安装依赖`}
                                  >
                                    {isInstallingDependencies ? (
                                      <div className="flex items-center gap-1">
                                        <div className="animate-spin rounded-full h-2 w-2 border-b border-current"></div>
                                        安装中...
                                      </div>
                                    ) : (
                                      '📦 安装依赖'
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            <div className="space-y-1">
                              {packageInfo.dependencies && (
                                <div className="flex justify-between items-center">
                                  <span className="theme-text-muted text-xs">生产依赖:</span>
                                  <div className="flex items-center gap-2">
                                    <span className="theme-text-primary text-xs">
                                      {Object.keys(packageInfo.dependencies).length} 个
                                    </span>
                                    {isCheckingDependencies ? (
                                      <div className="animate-spin rounded-full h-2 w-2 border-b border-blue-500"></div>
                                    ) : Object.keys(dependencyStatus).length > 0 && (
                                      <span className="text-xs">
                                        {Object.values(dependencyStatus).filter(Boolean).length === Object.keys(packageInfo.dependencies).length ? (
                                          <span className="text-green-600">✓</span>
                                        ) : (
                                          <span className="text-orange-600">⚠</span>
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                              {packageInfo.devDependencies && (
                                <div className="flex justify-between">
                                  <span className="theme-text-muted text-xs">开发依赖:</span>
                                  <span className="theme-text-primary text-xs">
                                    {Object.keys(packageInfo.devDependencies).length} 个
                                  </span>
                                </div>
                              )}
                              {packageInfo.dependencies && (
                                <div className="mt-2">
                                  <div className="text-xs theme-text-muted mb-1">主要依赖:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {Object.entries(packageInfo.dependencies).slice(0, 6).map(([pkg, version]) => {
                                      const isInstalled = dependencyStatus[pkg];
                                      const statusIcon = isCheckingDependencies ? '?' : (isInstalled ? '✓' : '✗');
                                      const statusColor = isCheckingDependencies ? 'text-gray-500' : (isInstalled ? 'text-green-600' : 'text-red-600');
                                      
                                      return (
                                        <span 
                                          key={pkg} 
                                          className={`px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800/20 text-blue-800 dark:text-blue-300 text-xs rounded flex items-center gap-1 ${
                                            !isInstalled && !isCheckingDependencies ? 'opacity-60' : ''
                                          }`}
                                          title={`${pkg}@${(version as string).replace('^', '').replace('~', '')} - ${isCheckingDependencies ? '检查中...' : (isInstalled ? '已安装' : '未安装')}`}
                                        >
                                          {pkg}@{(version as string).replace('^', '').replace('~', '')}
                                          <span className={`text-xs ${statusColor}`}>{statusIcon}</span>
                                        </span>
                                      );
                                    })}
                                    {Object.keys(packageInfo.dependencies).length > 6 && (
                                      <span className="text-xs theme-text-muted">
                                        +{Object.keys(packageInfo.dependencies).length - 6}...
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                  </div>
                  
                </div>
                
                <div className="theme-bg-secondary p-4 rounded-lg">
                  <h4 className="font-semibold theme-text-primary mb-3">运行状态</h4>
                  {isLoadingPM2 ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-sm theme-text-muted">获取状态中...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="theme-text-muted">当前状态:</span>
                          {pm2Status ? (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              (pm2Status.status === 'online' || pm2Status.pm2_env?.status === 'online')
                                ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300'
                                : (pm2Status.status === 'stopped' || pm2Status.pm2_env?.status === 'stopped')
                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300'
                            }`}>
                              {(pm2Status.status === 'online' || pm2Status.pm2_env?.status === 'online') ? `🟢 ${t('project.status.running')}` : 
                               (pm2Status.status === 'stopped' || pm2Status.pm2_env?.status === 'stopped') ? `⚪ ${t('project.status.stopped')}` : 
                               (pm2Status.status === 'error' || pm2Status.status === 'errored' || pm2Status.pm2_env?.status === 'error' || pm2Status.pm2_env?.status === 'errored') ? `🔴 ${t('project.status.error')}` :
                               (pm2Status.status === 'launching' || pm2Status.pm2_env?.status === 'launching') ? `🟡 ${t('project.status.starting')}` :
                               (pm2Status.status === 'stopping' || pm2Status.pm2_env?.status === 'stopping') ? `🟠 ${t('project.status.stopping')}` : `🔴 ${t('project.status.error')}`}
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300">
                              ⚫ {t('project.status.notRunning')}
                            </span>
                          )}
                        </div>
                        
                        {pm2Status && (
                          <>
                            <div className="flex justify-between">
                              <span className="theme-text-muted">进程ID:</span>
                              <span className="theme-text-primary">{pm2Status.pid || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="theme-text-muted">CPU占用:</span>
                              <span className="theme-text-primary">{
                                typeof pm2Status.cpu === 'number' ? pm2Status.cpu.toFixed(1) : 
                                typeof pm2Status.monit?.cpu === 'number' ? pm2Status.monit.cpu.toFixed(1) : '0'
                              }%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="theme-text-muted">内存占用:</span>
                              <span className="theme-text-primary">{
                                typeof pm2Status.memory === 'number' && pm2Status.memory > 0
                                  ? (pm2Status.memory / 1024 / 1024).toFixed(1) 
                                  : typeof pm2Status.monit?.memory === 'number' && pm2Status.monit.memory > 0
                                  ? (pm2Status.monit.memory / 1024 / 1024).toFixed(1)
                                  : '0'
                              } MB</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="theme-text-muted">运行时间:</span>
                              <span className="theme-text-primary">{
                                typeof pm2Status.uptime === 'number' && pm2Status.uptime > 0
                                  ? Math.floor(pm2Status.uptime / 1000 / 60)
                                  : '0'
                              } 分钟</span>
                            </div>
                          </>
                        )}
                        
                        <div className="flex justify-between">
                          <span className="theme-text-muted">最后打开:</span>
                          <span className="theme-text-primary">
                            {new Date(selectedProject.lastOpened).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      {/* 项目控制按钮 */}
                      <div className="space-y-2 pt-2 border-t theme-border">
                        {/* 主要控制按钮 */}
                        <div className="flex space-x-2">
                          {(pm2Status?.status === 'online' || pm2Status?.pm2_env?.status === 'online') ? (
                            <>
                              <button 
                                onClick={handleStopProject}
                                className="flex-1 px-3 py-2 btn-remove rounded-lg text-sm"
                                disabled={isLoadingPM2}
                              >
                                {isLoadingPM2 ? '停止中...' : '停止'}
                              </button>
                              <button 
                                onClick={handleRestartProject}
                                className="flex-1 px-3 py-2 btn-warning rounded-lg text-sm"
                                disabled={isLoadingPM2}
                              >
                                {isLoadingPM2 ? '重启中...' : '重启'}
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={handleStartProject}
                              className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                                hasUninstalledDependencies() 
                                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                  : 'btn-success'
                              }`}
                              disabled={isLoadingPM2 || hasUninstalledDependencies()}
                              title={hasUninstalledDependencies() ? '存在未安装的必要依赖包，无法启动项目' : ''}
                            >
                              {isLoadingPM2 ? '启动中...' : (hasUninstalledDependencies() ? '依赖缺失' : '启动')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* PM2启动日志 */}
              {selectedProject && (
                <div className="theme-bg-secondary p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold theme-text-primary">最近日志</h4>
                    <button 
                      onClick={fetchPM2Logs}
                      className="text-xs px-2 py-1 btn-info rounded"
                      disabled={isLoadingLogs}
                    >
                      {isLoadingLogs ? '刷新中...' : '刷新'}
                    </button>
                  </div>
                  
                  {isLoadingLogs ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-xs theme-text-muted">加载日志中...</span>
                    </div>
                  ) : pm2Logs.length > 0 ? (
                    <div className="bg-black text-green-400 p-3 rounded text-xs font-mono max-h-64 overflow-y-auto">
                      {pm2Logs.map((log, index) => (
                        <div key={index} className="mb-1 leading-relaxed">
                          {log}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs theme-text-muted text-center">
                      暂无日志数据
                      {pm2Status && (pm2Status.status === 'errored' || pm2Status.pm2_env?.status === 'errored') && (
                        <div className="mt-2 text-red-500">
                          进程状态为 "errored"，请检查项目依赖和配置
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* 顶部标题栏 */}
      <div className="theme-bg-secondary border-b theme-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold theme-text-primary">{t('appTitle')}</h1>
        <div className="flex items-center gap-4">
          <span className="theme-text-muted">{t('projects.totalProjects')}：{projects.length}</span>
          <button
            onClick={handleImportProject}
            className="btn-success px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {t('projects.importProject')}
          </button>
          <button
            onClick={handleCreateProject}
            className="btn-primary px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {t('projects.createProject')}
          </button>
          {selectedProject && (
            <button
              onClick={handleDeleteProject}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              title={t('projects.deleteProject')}
            >
              {t('projects.deleteProject')}
            </button>
          )}
          <button 
            onClick={() => setActiveTab('settings')}
            className="theme-text-muted hover:theme-text-primary text-xl bg-transparent"
            title={t('common.settings')}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex">
        {/* 左侧项目列表 */}
        <div className="w-1/4 border-r theme-border theme-bg-secondary flex flex-col">
          {/* 项目列表头部 */}
          <div className="p-3 border-b theme-border">
            <h2 className="text-base font-semibold theme-text-primary">{t('projects.title')}</h2>
          </div>

          {/* 项目列表内容 */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                <p>{t('status.error')}: {error}</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="p-4 text-center">
                <div className="text-4xl mb-4">📁</div>
                <p className="theme-text-muted text-sm">{t('projects.noProjects')}</p>
                <p className="theme-text-muted text-xs mt-1">{t('projects.noProjectsDesc')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleSelectProject(project)}
                    className={`project-item px-4 py-3 cursor-pointer transition-all border-l-4 ${
                      selectedProject?.id === project.id
                        ? 'selected theme-bg-primary border-blue-500'
                        : 'theme-text-muted hover:theme-bg-hover border-transparent hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-medium theme-text-primary truncate">{project.name}</div>
                          {/* 运行状态指示器 */}
                          <div 
                            className={`status-dot w-2 h-2 rounded-full ${
                              project.status === 'running' ? 'running bg-green-500 animate-pulse' :
                              project.status === 'stopped' ? 'bg-gray-400' :
                              project.status === 'error' ? 'error bg-red-500' : 'bg-gray-400'
                            }`}
                            title={`状态: ${
                              project.status === 'running' ? '运行中' :
                              project.status === 'stopped' ? '已停止' :
                              project.status === 'error' ? '错误' : '未知'
                            }`}
                          ></div>
                        </div>
                        
                        {/* 项目信息行 */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="theme-text-muted flex items-center gap-1">
                              <span>📂</span>
                              {project.type}
                            </span>
                            {project.port && (
                              <span className="theme-text-accent flex items-center gap-1">
                                <span>🌐</span>
                                :{project.port}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
                            <span className="theme-text-muted flex items-center gap-1">
                              <span>📦</span>
                              {project.packageManager || 'npm'}
                            </span>
                            <span className={`project-info-badge px-2 py-0.5 rounded text-xs font-medium ${
                              project.status === 'running' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300'
                                : project.status === 'stopped' 
                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300'
                            }`}>
                              {project.status === 'running' ? '运行中' :
                               project.status === 'stopped' ? '已停止' :
                               project.status === 'error' ? '错误' : '未知'}
                            </span>
                          </div>
                          
                          {/* 最后开启时间 */}
                          {project.lastOpened && (
                            <div className="text-xs theme-text-muted flex items-center gap-1 mt-1">
                              <span>🕒</span>
                              <span>上次: {new Date(project.lastOpened).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {selectedProject?.id === project.id && (
                        <span className="theme-text-primary font-bold ml-2">→</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 右侧项目详情 */}
        <div className="flex-1 theme-bg-primary flex flex-col">
        {!selectedProject ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold theme-text-primary mb-2">{t('projects.selectProject')}</h3>
              <p className="theme-text-muted">{t('projects.selectProjectDesc')}</p>
            </div>
          </div>
        ) : (
          renderProjectDetails()
        )}
        </div>
      </div>

      {/* 创建项目模态框 */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleCreateConfirm}
      />

      {/* 项目设置模态框 */}
      {selectedProject && (
        <ProjectSettingsModal
          isOpen={showSettingsModal}
          onClose={handleCloseSettings}
          project={selectedProject}
          onUpdate={(updatedProject) => {
            console.log('Project updated:', updatedProject);
          }}
        />
      )}

      {/* Toast 消息 */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            toastType === 'success' ? 'bg-green-500 text-white' :
            toastType === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
