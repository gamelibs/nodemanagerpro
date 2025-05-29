import { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useLogs } from '../hooks/useLogs';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onOpenSettings?: (project: Project) => void;
}

export default function ProjectCard({ project, onOpenSettings }: ProjectCardProps) {
  const { removeProject, startProject, stopProject } = useProjects();
  const { startLogSession } = useLogs();
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

  const handleOpenSettings = () => {
    // 启动日志会话以便在设置中看到安装进度
    startLogSession(project.id, project.name);
    
    // 发送自定义事件来切换到日志标签页
    window.dispatchEvent(new CustomEvent('switchToLogs', { 
      detail: { projectId: project.id } 
    }));
    
    // 打开设置模态框
    if (onOpenSettings) {
      onOpenSettings(project);
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
    <div className="p-6 bg-gradient-to-br from-[#1E293B] to-[#1A2332] rounded-xl border border-border hover:border-border-hover transition-all shadow-card hover:shadow-hover group">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg font-semibold text-text-primary group-hover:text-white transition-colors">{project.name}</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                project.status === 'running' ? 'bg-emerald-400 animate-pulse' :
                project.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
              }`}></div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                project.status === 'running' ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' :
                project.status === 'error' ? 'bg-red-400/20 text-red-300 border border-red-400/30' :
                'bg-gray-400/20 text-gray-300 border border-gray-400/30'
              }`}>
                {getStatusText(project.status)}
              </span>
            </div>
          </div>
          <div className="space-y-1.5 text-sm text-text-secondary">
            <p className="flex items-center space-x-2">
              <span className="text-xs">📂</span>
              <span className="truncate">{project.path}</span>
            </p>
            <p className="flex items-center space-x-2">
              <span className="text-xs">🕒</span>
              <span>最后打开: {formatLastOpened(project.lastOpened)}</span>
            </p>
            {project.port && (
              <p className="flex items-center space-x-2">
                <span className="text-xs">🌐</span>
                <span>端口: {project.port}</span>
              </p>
            )}
            {project.description && (
              <p className="flex items-center space-x-2">
                <span className="text-xs">📝</span>
                <span className="truncate">{project.description}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleStart}
            disabled={isStarting || project.status === 'running'}
            className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md flex items-center space-x-1.5"
          >
            <span className="text-xs">▶</span>
            <span>{isStarting ? '启动中...' : 'Start'}</span>
          </button>
          <button 
            onClick={handleStop}
            disabled={isStopping || project.status !== 'running'}
            className="px-4 py-2 text-sm text-white bg-slate-600 hover:bg-slate-700 light-theme:bg-gray-500 light-theme:hover:bg-gray-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md flex items-center space-x-1.5"
          >
            <span className="text-xs">■</span>
            <span>{isStopping ? '停止中...' : 'Stop'}</span>
          </button>
          <button 
            onClick={handleOpenSettings}
            className="px-4 py-2 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all font-medium shadow-sm hover:shadow-md flex items-center space-x-1.5"
          >
            <span className="text-xs">⚙️</span>
            <span>Settings</span>
          </button>
          <button 
            onClick={handleRemove}
            className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all font-medium shadow-sm hover:shadow-md"
            title="移除项目"
          >
            <span className="text-sm">🗑️</span>
          </button>
        </div>
      </div>
    </div>
  );
}
