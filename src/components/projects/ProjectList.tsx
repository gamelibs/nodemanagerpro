import React from 'react';
import { useApp } from '../../store/AppContext';
import { useProjects } from '../../hooks/useProjects';
import type { Project } from '../../types';
import type { PM2Process } from '../../services/PM2Service';

interface ProjectListProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  isLoading: boolean;
  error: string | null;
  pm2Status?: PM2Process | null;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  isLoading,
  error,
  pm2Status
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

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">{t('projects.list.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">{t('projects.list.loadError')}</p>
          <p className="text-gray-600 text-sm">{error}</p>
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
    <div className="space-y-3">
      {projects.map((project) => (
        <div
          key={project.id}
          onClick={() => onSelectProject(project)}
          className={`group project-item px-4 py-3 cursor-pointer transition-all border-l-4 ${
            selectedProject?.id === project.id
              ? 'selected theme-bg-primary border-blue-500'
              : 'theme-text-muted hover:theme-bg-hover border-transparent hover:border-gray-300'
          }`}
        >
          <div className="relative">
            {/* 项目内容 */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                {/* 左侧：项目名称和状态 */}
                <div className="flex items-center gap-2">
                  <div className="font-medium theme-text-primary truncate">{project.name}</div>
                  {/* 运行状态指示器 */}
                  <div 
                    className={`status-dot w-2 h-2 rounded-full ${
                      selectedProject?.id === project.id && pm2Status ? (
                        // 如果是选中的项目且有实时状态，显示实时状态
                        (pm2Status.status === 'online' || pm2Status.pm2_env?.status === 'online') ? 'running bg-green-500 animate-pulse' :
                        (pm2Status.status === 'stopped' || pm2Status.pm2_env?.status === 'stopped') ? 'bg-gray-400' :
                        'error bg-red-500'
                      ) : (
                        // 否则显示历史状态
                        project.status === 'running' ? 'running bg-green-500 animate-pulse' :
                        project.status === 'stopped' ? 'bg-gray-400' :
                        project.status === 'error' ? 'error bg-red-500' : 'bg-gray-400'
                      )
                    }`}
                    title={`状态: ${
                      selectedProject?.id === project.id && pm2Status ? (
                        // 实时状态标题
                        (pm2Status.status === 'online' || pm2Status.pm2_env?.status === 'online') ? '运行中（实时）' :
                        (pm2Status.status === 'stopped' || pm2Status.pm2_env?.status === 'stopped') ? '已停止（实时）' :
                        '错误（实时）'
                      ) : (
                        // 历史状态标题
                        project.status === 'running' ? '运行中（历史）' :
                        project.status === 'stopped' ? '已停止（历史）' :
                        project.status === 'error' ? '错误（历史）' : '未知（历史）'
                      )
                    }`}
                  ></div>
                </div>
                
                {/* 右侧：删除按钮 */}
                <button
                  onClick={(e) => handleDeleteProject(e, project)}
                  className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-200 p-1 rounded text-red-500 hover:text-red-600 hover:bg-red-50"
                  title={t('projects.deleteProject')}
                >
                  🗑️
                </button>
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
                    selectedProject?.id === project.id && pm2Status ? (
                      // 选中项目显示实时状态样式
                      (pm2Status.status === 'online' || pm2Status.pm2_env?.status === 'online')
                        ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300'
                        : (pm2Status.status === 'stopped' || pm2Status.pm2_env?.status === 'stopped')
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300'
                    ) : (
                      // 非选中项目显示历史状态样式
                      project.status === 'running' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300'
                        : project.status === 'stopped' 
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300'
                    )
                  }`}>
                    {selectedProject?.id === project.id && pm2Status ? (
                      // 选中项目显示实时状态文字
                      (pm2Status.status === 'online' || pm2Status.pm2_env?.status === 'online') ? '运行中 ●' :
                      (pm2Status.status === 'stopped' || pm2Status.pm2_env?.status === 'stopped') ? '已停止 ●' :
                      '错误 ●'
                    ) : (
                      // 非选中项目显示历史状态文字
                      project.status === 'running' ? '运行中' :
                      project.status === 'stopped' ? '已停止' :
                      project.status === 'error' ? '错误' : '未知'
                    )}
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
            
            {/* 选中指示器 */}
            {selectedProject?.id === project.id && (
              <span className="theme-text-primary font-bold ml-2">→</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
