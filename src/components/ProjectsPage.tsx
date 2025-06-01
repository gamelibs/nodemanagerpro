import { useState } from 'react';
import ProjectSettingsModal from './ProjectSettingsModal';
import type { Project } from '../types';

// 导入项目模块
import {
  ProjectHeader,
  ProjectList,
  ProjectDetails,
  ProjectActions,
  DependencyStatus,
  ProjectLogs,
  ToastContainer,
  useToast
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
          <div className="p-6 h-full overflow-y-auto">
            {selectedProject ? (
              <div className="flex flex-col gap-6">
                {/* 使用真实的项目详情组件 */}
                <ProjectDetails
                  project={selectedProject}
                  packageInfo={null}
                  isLoadingPackage={false}
                  pm2Status={null}
                  isLoadingPM2={false}
                  projectPort={selectedProject.port || null}
                />

                {/* 使用真实的项目操作组件 */}
                <ProjectActions
                  project={selectedProject}
                  pm2Status={null}
                  isLoadingPM2={false}
                  dependencyStatus={{}}
                  isCheckingDependencies={false}
                  isInstallingDependencies={false}
                  packageInfo={null}
                  projectPort={selectedProject.port || null}
                  isEditingPort={false}
                  tempPort=""
                  onStartProject={() => {}}
                  onStopProject={() => {}}
                  onRestartProject={() => {}}
                  onDeleteProject={() => {}}
                  onInstallDependencies={() => {}}
                  onEditPort={() => {}}
                  onSavePort={() => {}}
                  onCancelEditPort={() => {}}
                  onPortChange={() => {}}
                />

                {/* 使用真实的依赖状态组件 */}
                <DependencyStatus
                  project={selectedProject}
                  packageInfo={null}
                  dependencyStatus={{}}
                  isCheckingDependencies={false}
                  isInstallingDependencies={false}
                  onInstallDependencies={() => {}}
                />

                {/* 使用真实的项目日志组件 */}
                <ProjectLogs
                  project={selectedProject}
                  pm2Logs={[]}
                  isLoadingLogs={false}
                  onRefreshLogs={() => {}}
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
