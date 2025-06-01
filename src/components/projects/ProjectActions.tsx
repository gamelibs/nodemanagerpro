import React from 'react';
import type { Project } from '../../types';
import type { PM2Process } from '../../services/PM2Service';

interface ProjectActionsProps {
  project: Project;
  pm2Status: PM2Process | null;
  isLoadingPM2: boolean;
  dependencyStatus: {[key: string]: boolean};
  isCheckingDependencies: boolean;
  isInstallingDependencies: boolean;
  packageInfo: any;
  projectPort: number | null;
  isEditingPort: boolean;
  tempPort: string;
  onStartProject: (project: Project) => void;
  onStopProject: (project: Project) => void;
  onRestartProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onInstallDependencies: (project: Project) => void;
  onEditPort: () => void;
  onSavePort: () => void;
  onCancelEditPort: () => void;
  onPortChange: (port: string) => void;
}

export const ProjectActions: React.FC<ProjectActionsProps> = ({
  project,
  pm2Status,
  isLoadingPM2,
  dependencyStatus,
  isCheckingDependencies,
  isInstallingDependencies,
  packageInfo,
  projectPort,
  isEditingPort,
  tempPort,
  onStartProject,
  onStopProject,
  onRestartProject,
  onDeleteProject,
  onInstallDependencies,
  onEditPort,
  onSavePort,
  onCancelEditPort,
  onPortChange
}) => {
  // 检查项目是否正在运行
  const isProjectRunning = (): boolean => {
    if (pm2Status) {
      return pm2Status.pm2_env?.status === 'online';
    }
    return project.status === 'running';
  };

  // 检查是否可以启动项目
  const canStartProject = (): boolean => {
    // 如果项目已经在运行，不能再启动
    if (isProjectRunning()) {
      return false;
    }
    
    // 如果没有package.json，可以尝试启动
    if (!packageInfo) {
      return true;
    }
    
    // 如果还在检查依赖状态，暂时不允许启动
    if (isCheckingDependencies) {
      return false;
    }
    
    // 检查是否有未安装的关键依赖
    if (packageInfo.dependencies) {
      const dependencyNames = Object.keys(packageInfo.dependencies);
      const hasUninstalledDeps = dependencyNames.some(dep => 
        dependencyStatus[dep] === false
      );
      return !hasUninstalledDeps;
    }
    
    return true;
  };

  // 检查是否有未安装的依赖
  const hasUninstalledDependencies = (): boolean => {
    if (!packageInfo || !packageInfo.dependencies) {
      return false;
    }
    
    if (isCheckingDependencies) {
      return false;
    }
    
    if (Object.keys(dependencyStatus).length === 0) {
      return false;
    }
    
    const dependencyNames = Object.keys(packageInfo.dependencies);
    return dependencyNames.some(dep => dependencyStatus[dep] === false);
  };

  // 获取启动按钮文本
  const getStartButtonText = (): string => {
    if (isProjectRunning()) {
      return '运行中';
    }
    if (isCheckingDependencies) {
      return '检查中...';
    }
    if (!canStartProject() && hasUninstalledDependencies()) {
      return '缺少依赖';
    }
    return '启动项目';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">项目操作</h3>
        
        {/* 主要操作按钮 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* 启动/停止按钮 */}
          {!isProjectRunning() ? (
            <button
              onClick={() => onStartProject(project)}
              disabled={!canStartProject() || isLoadingPM2}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                canStartProject() && !isLoadingPM2
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoadingPM2 ? '检查状态...' : getStartButtonText()}
            </button>
          ) : (
            <button
              onClick={() => onStopProject(project)}
              disabled={isLoadingPM2}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
            >
              {isLoadingPM2 ? '处理中...' : '停止项目'}
            </button>
          )}
          
          {/* 重启按钮 */}
          <button
            onClick={() => onRestartProject(project)}
            disabled={!isProjectRunning() || isLoadingPM2}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isProjectRunning() && !isLoadingPM2
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            重启项目
          </button>
        </div>

        {/* 依赖管理 */}
        {packageInfo && hasUninstalledDependencies() && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-yellow-800">检测到缺失依赖</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  项目需要安装依赖包才能正常运行
                </p>
              </div>
              <button
                onClick={() => onInstallDependencies(project)}
                disabled={isInstallingDependencies}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                {isInstallingDependencies ? '安装中...' : '安装依赖'}
              </button>
            </div>
          </div>
        )}

        {/* 端口配置 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">项目端口</span>
            {!isEditingPort && (
              <button
                onClick={onEditPort}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                编辑
              </button>
            )}
          </div>
          
          {isEditingPort ? (
            <div className="flex gap-2">
              <input
                type="number"
                value={tempPort}
                onChange={(e) => onPortChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入端口号"
                min="1"
                max="65535"
              />
              <button
                onClick={onSavePort}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
              >
                保存
              </button>
              <button
                onClick={onCancelEditPort}
                className="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium"
              >
                取消
              </button>
            </div>
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="text-gray-900">
                {projectPort || project.port || '未设置'}
              </span>
            </div>
          )}
        </div>

        {/* 危险操作 */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">危险操作</h4>
          <button
            onClick={() => onDeleteProject(project)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200"
          >
            删除项目
          </button>
          <p className="text-xs text-gray-500 mt-2">
            删除操作不会删除项目文件，只会从管理器中移除
          </p>
        </div>
      </div>
    </div>
  );
};
