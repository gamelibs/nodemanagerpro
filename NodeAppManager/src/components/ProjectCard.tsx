import { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { removeProject, startProject, stopProject } = useProjects();
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await startProject(project);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = async () => {
    setIsStopping(true);
    try {
      await stopProject(project.id);
    } finally {
      setIsStopping(false);
    }
  };

  const handleRemove = async () => {
    if (confirm(`确定要移除项目 "${project.name}" 吗？这不会删除文件，只是从列表中移除。`)) {
      await removeProject(project.id);
    }
  };

  const handleShowLogs = () => {
    // TODO: 实现日志查看功能
    alert('日志查看功能即将推出！');
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

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'running':
        return 'text-green-400';
      case 'stopped':
        return 'text-gray-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'running':
        return '运行中';
      case 'stopped':
        return '已停止';
      case 'error':
        return '错误';
      default:
        return '未知';
    }
  };

  return (
    <div className="p-6 bg-[#1E293B] rounded-xl border border-border hover:border-border-hover transition-all shadow-card hover:shadow-hover">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-medium text-text-primary">{project.name}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
              {getStatusText(project.status)}
            </span>
          </div>
          <p className="text-sm text-text-secondary mb-1">路径: {project.path}</p>
          <p className="text-sm text-text-secondary mb-1">
            最后打开: {formatLastOpened(project.lastOpened)}
          </p>
          {project.description && (
            <p className="text-sm text-text-secondary">{project.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleStart}
            disabled={isStarting || project.status === 'running'}
            className="px-3 py-1.5 text-sm text-text-primary bg-primary hover:bg-primary-hover rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStarting ? '启动中...' : '▶ Start'}
          </button>
          <button 
            onClick={handleStop}
            disabled={isStopping || project.status !== 'running'}
            className="px-3 py-1.5 text-sm text-text-secondary border border-border hover:border-border-hover rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStopping ? '停止中...' : '■ Stop'}
          </button>
          <button 
            onClick={handleShowLogs}
            className="px-3 py-1.5 text-sm text-text-secondary border border-border hover:border-border-hover rounded-lg transition-all"
          >
            Logs
          </button>
          <button 
            onClick={handleRemove}
            className="p-1.5 text-text-secondary hover:text-red-400 rounded-lg hover:bg-background-hover transition-all"
            title="移除项目"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
