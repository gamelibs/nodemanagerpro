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
                />

                <ProjectActions
                  project={selectedProject}
                  onOpenSettings={handleOpenSettings}
                />

                <DependencyStatus
                  project={selectedProject}
                />

                <ProjectLogs
                  project={selectedProject}
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

      {/* 模态框 */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={handleCreateModalClose}
        onConfirm={() => {}} // 由ProjectHeader处理
      />

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
