import { useState, useEffect } from 'react';
import ProjectSettingsModal from './ProjectSettingsModal';
import type { Project } from '../types';
import { useToastContext } from '../store/ToastContext';
import { t } from '../services/i18n';

// 导入项目模块
import {
  ProjectHeader,
  ProjectList,
  ProjectDetails,
  useProjectData,
  useProjectOperations
} from './projects';

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
  // 界面状态管理 - 仅管理与界面协调相关的状态
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Toast提示系统 - 使用全局的 ToastContext
  const { showToast } = useToastContext();

  // 项目数据管理
  const {
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
    checkDependencies,
    fetchPM2Logs,
    clearData
  } = useProjectData();

  // 项目操作管理
  const {
    isInstallingDependencies,
    startProject,
    stopProject,
    restartProject,
    installDependencies
  } = useProjectOperations();

  // 项目状态同步 - 已移除手动同步调用，使用自动同步机制

  // 当选择的项目改变时，获取项目数据
  useEffect(() => {
    if (selectedProject) {
      fetchProjectData(selectedProject);
    } else {
      clearData();
    }
  }, [selectedProject, fetchProjectData, clearData]);

  // 监听项目列表变化，如果当前选中的项目被删除，则清除选择状态
  useEffect(() => {
    if (selectedProject && projects) {
      const projectStillExists = projects.some(p => p.id === selectedProject.id);
      if (!projectStillExists) {
        console.log(`🗑️ 检测到选中的项目 "${selectedProject.name}" 已被删除，清除选择状态`);
        setSelectedProject(null);
      }
    }
  }, [projects, selectedProject]);

  // 项目操作处理函数
  const handleStartProject = async () => {
    if (selectedProject) {
      const success = await startProject(selectedProject);
      if (success) {
        showToast(`项目 ${selectedProject.name} 启动成功`, 'success');
        // 刷新PM2状态和日志
        refreshPM2Status(selectedProject);
        // 延迟一下再获取日志，确保进程完全启动
        setTimeout(() => {
          fetchPM2Logs(selectedProject);
        }, 2000);
        // 状态同步已在useProjects hook中自动处理，无需重复调用
      }
    }
  };

  const handleStopProject = async () => {
    if (selectedProject) {
      const success = await stopProject(selectedProject);
      if (success) {
        showToast(`项目 ${selectedProject.name} 已停止`, 'success');
        // 刷新PM2状态
        refreshPM2Status(selectedProject);
        // 状态同步已在useProjects hook中自动处理，无需重复调用
      }
    }
  };

  const handleRestartProject = async () => {
    if (selectedProject) {
      const success = await restartProject(selectedProject);
      if (success) {
        showToast(`项目 ${selectedProject.name} 重启成功`, 'success');
        // 刷新PM2状态
        refreshPM2Status(selectedProject);
        // 状态同步已在useProjects hook中自动处理，无需重复调用
      }
    }
  };

  const handleInstallDependencies = async () => {
    if (selectedProject && packageInfo) {
      const success = await installDependencies(selectedProject);
      if (success) {
        showToast('依赖包安装成功', 'success');
        // 重新检查依赖状态
        checkDependencies(selectedProject, packageInfo);
      }
    }
  };

  const handleInstallSingleDependency = async (packageName: string) => {
    if (!selectedProject) {
      showToast('请先选择一个项目', 'error');
      return;
    }

    try {
      showToast(`正在安装 ${packageName}...`, 'info');
      
      // 使用专门的安装特定包的IPC频道
      const result = await window.electronAPI?.invoke('project:installSpecificPackages', 
        selectedProject.path, 
        [packageName]
      );

      if (result?.success) {
        showToast(`${packageName} 安装成功`, 'success');
        // 重新检查依赖状态
        if (packageInfo) {
          checkDependencies(selectedProject, packageInfo);
        }
      } else {
        showToast(`${packageName} 安装失败: ${result?.error || '未知错误'}`, 'error');
      }
    } catch (error) {
      console.error(`安装 ${packageName} 失败:`, error);
      showToast(`安装 ${packageName} 失败`, 'error');
    }
  };

  // 外部操作处理函数
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
        showToast(`打开编辑器失败: ${result?.error || '未知错误'}`, 'error');
      }
    } catch (error) {
      console.error('打开编辑器失败:', error);
      showToast('打开编辑器失败', 'error');
    }
  };

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
        showToast(`打开文件夹失败: ${result?.error || '未知错误'}`, 'error');
      }
    } catch (error) {
      console.error('打开文件夹失败:', error);
      showToast('打开文件夹失败', 'error');
    }
  };

  const handleOpenInBrowser = async () => {
    if (!selectedProject) {
      showToast('请先选择一个项目', 'error');
      return;
    }

    // 检查项目是否正在运行
    const isRunning = pm2Status?.status === 'online';
    
    if (!isRunning) {
      // 如果项目未运行，给出提示但仍然尝试打开
      showToast('项目似乎未运行，尝试打开浏览器...', 'info');
    }

    try {
      // 获取项目端口，优先使用检测到的端口
      let port = projectPort || pm2Status?.port || selectedProject.port;
      
      // 如果没有端口信息，不要猜测，而是提示用户
      if (!port) {
        showToast('未检测到项目端口，请先设置端口或启动项目后重试', 'error');
        return;
      }
      
      const url = `http://localhost:${port}`;
      
      const result = await window.electronAPI?.invoke('shell:openExternal', url);
      if (result?.success) {
        showToast(`已在浏览器中打开: ${url}`, 'success');
      } else {
        showToast(`打开浏览器失败: ${result?.error || '未知错误'}`, 'error');
      }
    } catch (error) {
      console.error('打开浏览器失败:', error);
      showToast('打开浏览器失败', 'error');
    }
  };

  // 项目选择处理（界面协调）
  const handleSelectProject = async (project: Project) => {
    console.log(`🎯 选择项目: ${project.name} (ID: ${project.id})`);
    console.log('📊 当前项目状态:', project.status);
    
    setSelectedProject(project);
    showToast(`已选择项目: ${project.name}`, 'info');
    
    // 项目选择时不需要手动同步状态，自动同步机制会处理
    // 只需要获取项目的详细数据
  };

  // 项目设置模态框处理（界面协调）
  const handleSettingsModalClose = () => {
    setShowSettingsModal(false);
  };

  // 端口编辑处理
  const handlePortEdit = async (newPort: number) => {
    if (!selectedProject) {
      showToast('请先选择一个项目', 'error');
      return;
    }

    try {
      // 使用PortService更新项目端口
      const { PortService } = await import('../services/PortService');
      const result = await PortService.updateProjectPort(selectedProject, newPort);
      
      if (result.success) {
        showToast(`端口已更新为 ${newPort}`, 'success');
        // 重新获取项目数据以反映更新
        if (selectedProject) {
          fetchProjectData(selectedProject);
        }
      } else {
        showToast(`端口更新失败: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('端口编辑失败:', error);
      showToast('端口编辑失败', 'error');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 顶部栏 (Header) */}
      <div className="h-16 theme-bg-secondary theme-border-b border-b flex items-center px-6">
        <ProjectHeader />
      </div>
      
      {/* 主体内容区域 */}
      <div className="flex-1 flex">
        {/* 左侧项目列表 */}
        <div className="w-1/4 border-r theme-border theme-bg-secondary flex flex-col">
          {/* 项目列表头部 */}
          <div className="p-3 border-b theme-border flex items-center justify-between">
            <h2 className="text-base font-semibold theme-text-primary">{t('projects.listHeader')}</h2>
            <span className="text-sm theme-text-secondary">{t('projects.list.totalCount', { count: projects.length.toString() })}</span>
          </div>

          {/* 项目列表内容 */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                <p>错误: {error}</p>
              </div>
            ) : (
              <ProjectList
                projects={projects}
                selectedProject={selectedProject}
                onSelectProject={handleSelectProject}
                isLoading={isLoading}
                error={error}
              />
            )}
          </div>
        </div>
        
        {/* 右边主显示模块区 (Main Content) */}
        <div className="flex-1 main-content theme-bg-primary">
          <div className="p-4 h-full overflow-y-auto">
            {selectedProject ? (
              <div className="flex flex-col gap-4">
                {/* 使用简化的项目详情组件 - 只包含基本信息和运行状态 */}
                <ProjectDetails
                  project={selectedProject}
                  packageInfo={packageInfo}
                  isLoadingPackage={isLoadingPackage}
                  pm2Status={pm2Status}
                  isLoadingPM2={isLoadingPM2}
                  projectPort={projectPort}
                  dependencyStatus={dependencyStatus}
                  isCheckingDependencies={isCheckingDependencies}
                  isInstallingDependencies={isInstallingDependencies}
                  pm2Logs={pm2Logs}
                  isLoadingLogs={isLoadingLogs}
                  onOpenInEditor={handleOpenInEditor}
                  onOpenInFolder={handleOpenInFolder}
                  onOpenInBrowser={handleOpenInBrowser}
                  onPortEdit={handlePortEdit}
                  onInstallDependencies={handleInstallDependencies}
                  onInstallSingleDependency={handleInstallSingleDependency}
                  onStartProject={handleStartProject}
                  onStopProject={handleStopProject}
                  onRestartProject={handleRestartProject}
                  onRefreshLogs={() => {
                    if (selectedProject) {
                      fetchPM2Logs(selectedProject);
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="theme-text-secondary text-lg mb-2">{t('projects.selectProject')}</p>
                  <p className="theme-text-muted">{t('projects.selectProjectDesc')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 项目设置模态框 - 由ProjectsPage管理，因为需要selectedProject */}
      {selectedProject && (
        <ProjectSettingsModal
          isOpen={showSettingsModal}
          onClose={handleSettingsModalClose}
          project={selectedProject}
          onUpdate={() => {}} // 由子组件处理
        />
      )}
    </div>
  );
}
