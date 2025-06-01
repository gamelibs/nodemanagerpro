import React from 'react';
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
  // 检查项目是否正在运行（优先使用PM2实时状态）
  const isProjectRunning = (project: Project): boolean => {
    // 如果是当前选中的项目，优先使用实时PM2状态
    if (selectedProject?.id === project.id && pm2Status) {
      return pm2Status.pm2_env?.status === 'online';
    }
    // 否则使用项目记录的状态
    return project.status === 'running';
  };

  // 获取项目状态显示文本
  const getProjectStatus = (project: Project): string => {
    if (selectedProject?.id === project.id && pm2Status) {
      const status = pm2Status.pm2_env?.status;
      switch (status) {
        case 'online': return '运行中';
        case 'stopped': return '已停止';
        case 'error': 
        case 'errored': return '错误';
        case 'stopping': return '停止中';
        case 'launching': return '启动中';
        default: return '未知';
      }
    }
    
    switch (project.status) {
      case 'running': return '运行中';
      case 'stopped': return '已停止';
      case 'error': return '错误';
      default: return '未知';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">加载项目中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">加载失败</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">还没有项目</p>
          <p className="text-gray-500 text-sm">点击上方按钮创建或导入项目</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">项目列表</h2>
        <p className="text-sm text-gray-600 mt-1">共 {projects.length} 个项目</p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
              selectedProject?.id === project.id
                ? 'bg-blue-50 border-l-4 border-l-blue-500'
                : ''
            }`}
            onClick={() => onSelectProject(project)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {project.name}
                  </h3>
                  
                  {/* 运行状态指示器 */}
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isProjectRunning(project)
                          ? 'bg-green-500'
                          : project.status === 'error'
                          ? 'bg-red-500'
                          : 'bg-gray-400'
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        isProjectRunning(project)
                          ? 'text-green-700'
                          : project.status === 'error'
                          ? 'text-red-700'
                          : 'text-gray-600'
                      }`}
                    >
                      {getProjectStatus(project)}
                    </span>
                    
                    {/* 选中项目显示实时状态标识 */}
                    {selectedProject?.id === project.id && pm2Status && (
                      <span className="text-xs text-blue-600">●</span>
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {project.path}
                </p>
                
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>类型: {project.type}</span>
                  {project.port && <span>端口: {project.port}</span>}
                  <span>包管理器: {project.packageManager}</span>
                </div>
              </div>
              
              <div className="ml-4 flex-shrink-0">
                <div className="text-right">
                  {project.lastOpened && (
                    <p className="text-xs text-gray-500">
                      {new Date(project.lastOpened).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
