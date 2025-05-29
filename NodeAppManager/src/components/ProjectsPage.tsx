import { useState } from 'react';
import Header from './Header';
import ProjectCard from './ProjectCard';
import CreateProjectModal from './CreateProjectModal';
import ProjectSettingsModal from './ProjectSettingsModal';
import { useApp } from '../store/AppContext';
import { useProjects } from '../hooks/useProjects';
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
  const { i18n } = useApp();
  const { t } = i18n;
  const { createProject } = useProjects();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  const handleCreateConfirm = async (projectConfig: Parameters<typeof createProject>[0]) => {
    await createProject(projectConfig);
    setShowCreateModal(false);
  };

  const handleOpenSettings = (project: Project) => {
    setSelectedProject(project);
    setShowSettingsModal(true);
  };

  const handleCloseSettings = () => {
    setShowSettingsModal(false);
    // 延迟清空selectedProject，等待模态框关闭动画完成
    setTimeout(() => {
      setSelectedProject(null);
    }, 300); // 300ms 通常足够模态框关闭动画完成
  };

  return (
    <div className="p-8 h-full overflow-auto">
      {/* 页面标题和操作按钮 */}
      <Header />
      
      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 light-theme:bg-red-100/80 border border-red-700 light-theme:border-red-300 rounded-lg">
          <p className="text-red-400 light-theme:text-red-700 text-sm">{t('common.error')}: {error}</p>
        </div>
      )}
      
      {/* 项目列表内容 */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-text-secondary theme-text-secondary">{t('projects.loading')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-600 light-theme:from-gray-200 light-theme:to-gray-300 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">📁</span>
                </div>
                <h3 className="text-lg font-semibold theme-text-primary mb-2">{t('projects.empty')}</h3>
                <p className="text-text-secondary theme-text-secondary mb-6">{t('projects.emptyDesc')}</p>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleCreateProject}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <span className="text-lg">✨</span>
                  <span>{t('projects.createNew')}</span>
                </button>
              </div>
            </div>
          ) : (
            projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onOpenSettings={handleOpenSettings}
              />
            ))
          )}
        </div>
      )}
      
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
            // Handle project update logic here if needed
            console.log('Project updated:', updatedProject);
          }}
        />
      )}
    </div>
  );
}
