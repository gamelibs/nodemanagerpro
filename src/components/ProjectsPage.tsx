import { useState, useEffect } from 'react';
import ProjectSettingsModal from './ProjectSettingsModal';
import type { Project } from '../types';

// 导入项目模块
import {
  ProjectHeader,
  ProjectList,
  ProjectDetails,
  ToastContainer,
  useToast,
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

  // Toast提示系统
  const { toasts, showToast, hideToast } = useToast();

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
      }
    }
  };

  const handleInstallDependencies = async () => {
    if (selectedProject && packageInfo) {
      const success = await installDependencies(selectedProject, 'npm');
      if (success) {
        showToast('依赖包安装成功', 'success');
        // 重新检查依赖状态
        checkDependencies(selectedProject, packageInfo);
      }
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
    const isRunning = pm2Status?.status === 'online' || selectedProject.status === 'running';
    
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
  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    showToast(`已选择项目: ${project.name}`, 'info');
  };

  // 项目设置模态框处理（界面协调）
  const handleSettingsModalClose = () => {
    setShowSettingsModal(false);
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
          <div className="p-3 border-b theme-border">
            <h2 className="text-base font-semibold theme-text-primary">项目</h2>
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
                  onPortEdit={(port: number) => {
                    // Handle port editing if needed
                    console.log('Port edit requested:', port);
                  }}
                  onInstallDependencies={handleInstallDependencies}
                  onStartProject={handleStartProject}
                  onStopProject={handleStopProject}
                  onRestartProject={handleRestartProject}
                  onRefreshLogs={() => {
                    if (selectedProject) {
                      fetchPM2Logs(selectedProject);
                    }
                  }}
                  showToast={showToast}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="theme-text-secondary text-lg mb-2">请选择一个项目</p>
                  <p className="theme-text-muted">从左侧列表中选择项目查看详情</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast提示系统 */}
      <ToastContainer
        toasts={toasts}
        onHideToast={hideToast}
      />

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
