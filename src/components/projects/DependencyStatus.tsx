import React from 'react';
import type { Project } from '../../types';

interface DependencyStatusProps {
  project: Project;
  packageInfo: any;
  dependencyStatus: {[key: string]: boolean};
  isCheckingDependencies: boolean;
  isInstallingDependencies: boolean;
  onInstallDependencies: (project: Project) => void;
}

export const DependencyStatus: React.FC<DependencyStatusProps> = ({
  project,
  packageInfo,
  dependencyStatus,
  isCheckingDependencies,
  isInstallingDependencies,
  onInstallDependencies
}) => {
  if (!packageInfo) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">依赖管理</h3>
          <div className="text-center py-8 text-gray-500">
            <p>未找到 package.json 文件</p>
            <p className="text-sm mt-1">无法检查项目依赖</p>
          </div>
        </div>
      </div>
    );
  }

  const allDependencies = {
    ...packageInfo.dependencies,
    ...packageInfo.devDependencies
  };

  const dependencyCount = Object.keys(allDependencies).length;
  
  if (dependencyCount === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">依赖管理</h3>
          <div className="text-center py-8 text-gray-500">
            <p>此项目没有依赖包</p>
          </div>
        </div>
      </div>
    );
  }

  // 计算安装状态统计
  const installedCount = Object.values(dependencyStatus).filter(status => status === true).length;
  const checkedCount = Object.keys(dependencyStatus).length;
  const hasUninstalled = Object.values(dependencyStatus).some(status => status === false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">依赖管理</h3>
          
          {/* 整体安装按钮 */}
          {hasUninstalled && !isCheckingDependencies && (
            <button
              onClick={() => onInstallDependencies(project)}
              disabled={isInstallingDependencies}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
            >
              {isInstallingDependencies ? '安装中...' : '安装缺失依赖'}
            </button>
          )}
        </div>

        {/* 依赖状态概览 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">依赖包总数:</span>
            <span className="font-medium">{dependencyCount}</span>
          </div>
          
          {isCheckingDependencies ? (
            <div className="flex items-center gap-2 mt-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">正在检查依赖状态...</span>
            </div>
          ) : checkedCount > 0 ? (
            <>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">已安装:</span>
                <span className={`font-medium ${installedCount === dependencyCount ? 'text-green-600' : 'text-yellow-600'}`}>
                  {installedCount} / {checkedCount}
                </span>
              </div>
              
              {/* 进度条 */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      installedCount === checkedCount ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${(installedCount / checkedCount) * 100}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="mt-2 text-sm text-gray-500">
              点击检查依赖状态
            </div>
          )}
        </div>

        {/* 依赖列表 */}
        <div className="space-y-4">
          {/* 生产依赖 */}
          {packageInfo.dependencies && Object.keys(packageInfo.dependencies).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">生产依赖</h4>
              <div className="space-y-2">
                {Object.entries(packageInfo.dependencies).map(([name, version]) => {
                  const isInstalled = dependencyStatus[name];
                  const isChecked = name in dependencyStatus;
                  
                  return (
                    <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{name}</span>
                          <span className="text-sm text-gray-500">{version as string}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isCheckingDependencies ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                        ) : isChecked ? (
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                isInstalled ? 'bg-green-500' : 'bg-red-500'
                              }`}
                            />
                            <span
                              className={`text-xs font-medium ${
                                isInstalled ? 'text-green-700' : 'text-red-700'
                              }`}
                            >
                              {isInstalled ? '已安装' : '未安装'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">未检查</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 开发依赖 */}
          {packageInfo.devDependencies && Object.keys(packageInfo.devDependencies).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">开发依赖</h4>
              <div className="space-y-2">
                {Object.entries(packageInfo.devDependencies).map(([name, version]) => {
                  const isInstalled = dependencyStatus[name];
                  const isChecked = name in dependencyStatus;
                  
                  return (
                    <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{name}</span>
                          <span className="text-sm text-gray-500">{version as string}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isCheckingDependencies ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                        ) : isChecked ? (
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                isInstalled ? 'bg-green-500' : 'bg-red-500'
                              }`}
                            />
                            <span
                              className={`text-xs font-medium ${
                                isInstalled ? 'text-green-700' : 'text-red-700'
                              }`}
                            >
                              {isInstalled ? '已安装' : '未安装'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">未检查</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
