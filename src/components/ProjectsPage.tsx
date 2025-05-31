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
  const { createProject, importProject, removeProject, synchronizeProjectStatuses } = useProjects();
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
    if (!selectedProject) {
      setPackageInfo(null);
      return;
    }

    setIsLoadingPackage(true);
    try {
      const packagePath = `${selectedProject.path}/package.json`;
      
      // 使用 Electron API 读取文件
      const result = await window.electronAPI?.invoke('fs:readFile', packagePath);
      
      if (result?.success && result.content) {
        const packageData = JSON.parse(result.content);
        setPackageInfo(packageData);
        console.log('📦 成功读取 package.json:', packageData.name, packageData.version);
        
        // 读取成功后检查依赖安装状态
        setTimeout(() => {
          checkDependencyInstallation();
        }, 100);
      } else {
        console.log('❌ 无法读取 package.json:', result?.error);
        setPackageInfo(null);
      }
    } catch (error) {
      console.error('读取 package.json 失败:', error);
      setPackageInfo(null);
    } finally {
      setIsLoadingPackage(false);
    }
  };

  // 检查依赖包安装状态
  const checkDependencyInstallation = async () => {
    if (!selectedProject || !packageInfo) {
      setDependencyStatus({});
      return;
    }

    setIsCheckingDependencies(true);
    try {
      const allDependencies = {
        ...packageInfo.dependencies,
        ...packageInfo.devDependencies
      };

      if (Object.keys(allDependencies).length === 0) {
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

  // 当选中项目时获取PM2状态和日志
  useEffect(() => {
    if (selectedProject) {
      fetchPM2Status();
      fetchPM2Logs();
      fetchPackageInfo();
      checkDependencyInstallation();
    } else {
      setPm2Status(null);
      setPm2Logs([]);
      setPackageInfo(null);
    }
  }, [selectedProject]);

  // 当 packageInfo 更新时检查依赖安装状态
  useEffect(() => {
    if (packageInfo) {
      checkDependencyInstallation();
    } else {
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
                      <span className="theme-text-muted">项目描述:</span>
                      <span className="theme-text-primary">
                        {isLoadingPackage ? '读取中...' : (packageInfo?.description || '暂无描述')}
                      </span>
                    </div>
                    
                    {/* 项目详细信息 - 移动到这里 */}
                    <div className="mt-3 pt-2 border-t theme-border">
                      <div className="font-medium theme-text-primary mb-1 text-xs">项目详情:</div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="theme-text-muted text-xs">项目路径:</span>
                          <span className="theme-text-primary text-xs max-w-40 truncate" title={selectedProject.path}>
                            {selectedProject.path}
                          </span>
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
                  
                  {/* 快速操作按钮 */}
                  <div className="mt-4 pt-3 border-t theme-border">
                    <div className="grid grid-cols-3 gap-2">
                      <button className="px-3 py-2 btn-info rounded text-xs" onClick={handleOpenInFolder}>📂 文件夹</button>
                      <button className="px-3 py-2 btn-info rounded text-xs" onClick={handleOpenInEditor}>✏️ 编辑器</button>
                      <button className="px-3 py-2 btn-info rounded text-xs" onClick={handleOpenInBrowser}>🌐 浏览器</button>
                    </div>
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
                              className="flex-1 px-3 py-2 btn-success rounded-lg text-sm"
                              disabled={isLoadingPM2}
                            >
                              {isLoadingPM2 ? '启动中...' : '启动'}
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
