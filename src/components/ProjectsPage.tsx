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
    fetchProjectData,
    refreshPM2Status,
    checkDependencies,
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

  // 项目操作处理函数
  const handleStartProject = async () => {
    if (selectedProject) {
      const success = await startProject(selectedProject);
      if (success) {
        showToast(`项目 ${selectedProject.name} 启动成功`, 'success');
        // 刷新PM2状态
        refreshPM2Status(selectedProject);
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
  const handleOpenInEditor = () => {
    if (selectedProject) {
      window.electronAPI?.invoke('open:editor', selectedProject.path);
      showToast('正在打开编辑器...', 'info');
    }
  };

  const handleOpenInFolder = () => {
    if (selectedProject) {
      window.electronAPI?.invoke('open:folder', selectedProject.path);
      showToast('正在打开文件夹...', 'info');
    }
  };

  const handleOpenInBrowser = () => {
    if (selectedProject) {
      const port = projectPort || selectedProject.port || 3000;
      const url = `http://localhost:${port}`;
      window.electronAPI?.invoke('open:browser', url);
      showToast(`正在打开浏览器: ${url}`, 'info');
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
