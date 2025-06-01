import { useState } from 'react';
import CreateProjectModal from './CreateProjectModal';
import ProjectSettingsModal from './ProjectSettingsModal';
import type { Project } from '../types';

// 导入项目模块
import {
  ProjectHeader,
  ProjectList,
  ProjectDetails,
  ProjectActions,
  DependencyStatus,
  ProjectLogs
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
  // 只保留界面状态管理
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // 项目选择处理（界面协调）
  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
  };

  // 模态框处理（界面协调）
  const handleCreateModalClose = () => {
    setShowCreateModal(false);
  };

  const handleSettingsModalClose = () => {
    setShowSettingsModal(false);
  };

  const handleOpenSettings = () => {
    setShowSettingsModal(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 顶部栏 (Header) */}
      <div className="h-16 theme-bg-secondary theme-border-b border-b flex items-center px-6">
        <ProjectHeader />
      </div>
      
      {/* 主体内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左边栏 (Sidebar) - 项目列表区域 */}
        <div className="w-80 theme-bg-secondary theme-border-r border-r">
          <div className="p-4 h-full overflow-y-auto">
            <ProjectList
              projects={projects}
              selectedProject={selectedProject}
              onSelectProject={handleSelectProject}
              isLoading={isLoading}
              error={error}
              pm2Status={projectData.pm2Status}
            />
          </div>
        </div>
        
        {/* 右边主显示模块区 (Main Content) */}
        <div className="flex-1 main-content theme-bg-primary">
          <div className="p-6 h-full overflow-y-auto">
            {selectedProject ? (
              <div className="flex flex-col gap-6">
                <ProjectDetails
                  project={selectedProject}
                  ports={projectData.ports}
                  pm2Status={projectData.pm2Status}
                  dependencies={projectData.dependencies}
                  onEditPort={handleEditPort}
                  onSavePort={handleSavePort}
                  onCancelEditPort={handleCancelEditPort}
                  isEditingPort={projectOps.isEditingPort}
                  tempPort={projectOps.tempPort}
                  onTempPortChange={projectOps.setTempPort}
                />

                <ProjectActions
                  project={selectedProject}
                  pm2Status={projectData.pm2Status}
                  onTogglePM2={projectData.toggleProjectStatus}
                  onOpenSettings={() => setShowSettingsModal(true)}
                  onDeleteProject={handleDeleteProject}
                />

                <DependencyStatus
                  dependencies={projectData.dependencies}
                  onInstallDependencies={projectData.installDependencies}
                  isInstallingDeps={projectData.isInstallingDeps}
                />

                <ProjectLogs
                  logs={projectData.logs}
                  isLoadingLogs={projectData.isLoadingLogs}
                  onRefreshLogs={projectData.fetchPM2Logs}
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

      {/* Toast 提示 */}
      {projectOps.toastMessage && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-4 py-2 rounded-lg shadow-lg ${
            projectOps.toastType === 'success' ? 'bg-green-600 text-white' :
            projectOps.toastType === 'error' ? 'bg-red-600 text-white' :
            'bg-blue-600 text-white'
          }`}>
            {projectOps.toastMessage}
          </div>
        </div>
      )}

      {/* 模态框 */}
      {showCreateModal && (
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onConfirm={handleCreateConfirm}
        />
      )}

      {showSettingsModal && selectedProject && (
        <ProjectSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          project={selectedProject}
          onUpdate={handleProjectUpdate}
        />
      )}
    </div>
  );
}
