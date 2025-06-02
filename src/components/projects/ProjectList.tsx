import React from 'react';
import { useApp } from '../../store/AppContext';
import { useProjects } from '../../hooks/useProjects';
import type { Project } from '../../types';

interface ProjectListProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  isLoading: boolean;
  error: string | null;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  isLoading,
  error
}) => {
  const { i18n } = useApp();
  const { t } = i18n;
  const { removeProject } = useProjects();

  // 删除项目处理
  const handleDeleteProject = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation(); // 阻止触发项目选择
    
    // 直接调用 removeProject，确认逻辑在 useProjects hook 中处理
    await removeProject(project.id);
  };

  // 获取项目状态指示器
  const getStatusIndicator = (project: Project) => {
    // 处理 undefined 或 null 状态的占位逻辑
    if (!project.status) {
      return <span className="w-3 h-3 rounded-full bg-gray-300 animate-pulse" title="状态检测中"></span>;
    }
    
    // 根据项目状态显示不同颜色的圆点
    if (project.status === 'running') {
      return <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" title="运行中"></span>;
    } else if (project.status === 'error') {
      return <span className="w-3 h-3 rounded-full bg-red-500" title="错误"></span>;
    } else if (project.status === 'stopped') {
      return <span className="w-3 h-3 rounded-full bg-gray-400" title="已停止"></span>;
    } else {
      // 未知状态时显示灰色圆点
      return <span className="w-3 h-3 rounded-full bg-gray-300" title="状态未知"></span>;
    }
  };

  // 格式化时间显示
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="theme-text-muted">{t('projects.list.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="theme-text-error mb-2">{t('projects.list.loadError')}</p>
          <p className="theme-text-muted text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="text-4xl mb-4">📁</div>
        <p className="theme-text-muted text-sm">{t('projects.list.empty')}</p>
        <p className="theme-text-muted text-xs mt-1">{t('projects.list.emptyDesc')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => (
        <div
          key={project.id}
          onClick={() => onSelectProject(project)}
          className={`group px-4 py-3 cursor-pointer transition-all duration-200 rounded-lg border project-card ${
            selectedProject?.id === project.id
              ? 'theme-bg-accent border-blue-500' 
              : 'theme-bg-secondary theme-border hover:border-gray-400'
          }`}
        >
          <div className="flex items-center justify-between">
            {/* 项目名称和状态 */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* 项目名称 */}
              <div className="font-medium theme-text-primary truncate">
                {project.name}
              </div>
              
              {/* 状态指示器 - 更明显的样式 */}
              <div className="status-indicator flex items-center justify-center">
                {getStatusIndicator(project)}
              </div>
            </div>
            
            {/* 删除按钮 */}
            <button
              onClick={(e) => handleDeleteProject(e, project)}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded theme-text-error hover:theme-bg-error"
              title={t('projects.deleteProject')}
            >
              🗑️
            </button>
          </div>
          
          {/* 项目信息 */}
          <div className="mt-2 flex items-center gap-4 text-xs theme-text-muted">
            {/* 项目类型 */}
            {project.type && (
              <span className="flex items-center gap-1">
                <span>📂</span>
                <span>{project.type}</span>
              </span>
            )}
            
            {/* 端口信息 */}
            <span className="flex items-center gap-1">
              <span>🌐</span>
              <span>{project.port ? `:${project.port}` : '检测中'}</span>
            </span>
            
            {/* 最后开启时间 */}
            {project.lastOpened && (
              <span className="flex items-center gap-1 ml-auto">
                <span>🕒</span>
                <span>{formatTime(project.lastOpened.toString())}</span>
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
