import { useProjects } from '../hooks/useProjects';
import { usePerformance } from '../hooks/usePerformance';
import { useApp } from '../store/AppContext';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onOpenSettings?: (project: Project) => void;
}

export default function ProjectCard({ project, onOpenSettings }: ProjectCardProps) {
  const { removeProject } = useProjects();
  const { performanceData } = usePerformance();
  const { i18n } = useApp();
  const { t } = i18n;

  // 获取当前项目的性能数据
  const currentPerformance = performanceData[project.id];

  const handleRemove = async () => {
    if (confirm(`确定要移除项目 "${project.name}" 吗？这不会删除文件，只是从列表中移除。`)) {
      await removeProject(project.id);
    }
  };

  const handleOpenSettings = () => {
    if (onOpenSettings) {
      onOpenSettings(project);
    }
  };

  const getProjectTypeIcon = (template?: string) => {
    switch (template) {
      case 'full-stack':
        return '🌐';
      case 'pure-api':
        return '🔧';
      case 'static-app':
        return '📄';
      default:
        return '📦';
    }
  };

  const formatLastOpened = (date: Date | null) => {
    if (!date) return '从未打开';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays} 天前`;
    
    return date.toLocaleDateString();
  };

  const formatPerformanceData = () => {
    if (!currentPerformance) {
      return { cpu: '--', memory: '--' };
    }
    
    const cpuPercent = Math.round(currentPerformance.cpu);
    const memoryMB = Math.round(currentPerformance.memory / 1024 / 1024);
    
    return {
      cpu: `${cpuPercent}%`,
      memory: `${memoryMB}MB`
    };
  };

  const getStatusDisplay = (status: Project['status']) => {
    switch (status) {
      case 'running':
        return {
          text: '运行中',
          color: 'theme-bg-success',
          textColor: 'theme-text-success',
          icon: '●'
        };
      case 'stopped':
        return {
          text: '已停止',
          color: 'theme-bg-error',
          textColor: 'theme-text-error',
          icon: '○'
        };
      case 'error':
        return {
          text: '错误',
          color: 'theme-bg-warning',
          textColor: 'theme-text-warning',
          icon: '⚠'
        };
      default:
        return {
          text: '未知',
          color: 'theme-bg-tertiary',
          textColor: 'theme-text-secondary',
          icon: '?'
        };
    }
  };

  return (
    <div className="project-card group">
      {/* 项目头部信息 */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getProjectTypeIcon(project.template)}</span>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold theme-text-primary transition-colors">
                {project.name}
              </h3>
              {project.version && (
                <span className="text-xs px-2 py-0.5 version-badge rounded">
                  v{project.version}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {(() => {
                const statusDisplay = getStatusDisplay(project.status);
                return (
                  <>
                    <div className={`w-2 h-2 rounded-full ${statusDisplay.color} ${
                      project.status === 'running' ? 'animate-pulse' : ''
                    }`}></div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${statusDisplay.color} ${statusDisplay.textColor} status-indicator`}>
                      <span className={statusDisplay.textColor}>{statusDisplay.icon}</span>
                      {statusDisplay.text}
                    </span>
                  </>
                );
              })()}
              {/* 性能指标 - 仅在运行时显示 */}
              {project.status === 'running' && (
                <div className="flex items-center gap-2 text-xs theme-text-secondary">
                  <span title="CPU使用率" className={currentPerformance ? 'theme-text-accent' : ''}>
                    💾 {formatPerformanceData().cpu}
                  </span>
                  <span title="内存使用" className={currentPerformance ? 'theme-text-accent' : ''}>
                    🧠 {formatPerformanceData().memory}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 项目详情 */}
      <div className="space-y-2 text-sm theme-text-secondary mb-4">
        <p className="flex items-center space-x-2">
          <span className="text-xs">📂</span>
          <span className="truncate">{project.path}</span>
        </p>
        <div className="flex items-center justify-between">
          <p className="flex items-center space-x-2">
            <span className="text-xs">🕒</span>
            <span>最后打开: {formatLastOpened(project.lastOpened)}</span>
          </p>
          {project.port && (
            <p className="flex items-center space-x-2">
              <span className="text-xs">🌐</span>
              <span>:{project.port}</span>
            </p>
          )}
        </div>
        {project.description && (
          <p className="flex items-center space-x-2">
            <span className="text-xs">📝</span>
            <span className="truncate">{project.description}</span>
          </p>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleOpenSettings}
            className="px-3 py-1.5 text-sm btn-settings rounded-lg transition-all font-medium shadow-sm hover:shadow-md flex items-center space-x-1"
          >
            <span className="text-xs">⚙️</span>
            <span>{t('nav.settings')}</span>
          </button>
          <button 
            onClick={handleRemove}
            className="px-3 py-1.5 text-sm btn-remove rounded-lg transition-all font-medium shadow-sm hover:shadow-md flex items-center space-x-1"
            title={t('actions.remove')}
          >
            <span className="text-sm">🗑️</span>
            <span>{t('actions.remove')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
