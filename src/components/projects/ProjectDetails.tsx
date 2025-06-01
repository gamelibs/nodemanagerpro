import React from 'react';
import type { Project } from '../../types';
import type { PM2Process } from '../../services/PM2Service';

interface ProjectDetailsProps {
  project: Project;
  packageInfo: any;
  isLoadingPackage: boolean;
  pm2Status: PM2Process | null;
  isLoadingPM2: boolean;
  projectPort: number | null;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  packageInfo,
  isLoadingPackage,
  pm2Status,
  isLoadingPM2,
  projectPort
}) => {
  // 获取PM2状态信息
  const getPM2StatusInfo = () => {
    if (isLoadingPM2) {
      return { text: '检查中...', color: 'text-gray-600' };
    }
    
    if (!pm2Status) {
      return { text: '未运行', color: 'text-gray-600' };
    }
    
    const status = pm2Status.pm2_env?.status;
    switch (status) {
      case 'online':
        return { text: '运行中', color: 'text-green-600' };
      case 'stopped':
        return { text: '已停止', color: 'text-gray-600' };
      case 'error':
      case 'errored':
        return { text: '错误', color: 'text-red-600' };
      case 'stopping':
        return { text: '停止中', color: 'text-yellow-600' };
      case 'launching':
        return { text: '启动中', color: 'text-blue-600' };
      default:
        return { text: '未知', color: 'text-gray-600' };
    }
  };

  const statusInfo = getPM2StatusInfo();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        {/* 项目基本信息 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  pm2Status?.pm2_env?.status === 'online'
                    ? 'bg-green-500'
                    : project.status === 'error'
                    ? 'bg-red-500'
                    : 'bg-gray-400'
                }`}
              />
              <span className={`text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">项目路径:</span>
              <p className="text-gray-900 font-mono text-xs mt-1 break-all">
                {project.path}
              </p>
            </div>
            <div>
              <span className="text-gray-500">项目类型:</span>
              <p className="text-gray-900 mt-1">{project.type}</p>
            </div>
            <div>
              <span className="text-gray-500">包管理器:</span>
              <p className="text-gray-900 mt-1">{project.packageManager}</p>
            </div>
            <div>
              <span className="text-gray-500">端口:</span>
              <p className="text-gray-900 mt-1">
                {projectPort || project.port || '未设置'}
              </p>
            </div>
          </div>
          
          {project.description && (
            <div className="mt-4">
              <span className="text-gray-500 text-sm">描述:</span>
              <p className="text-gray-900 mt-1">{project.description}</p>
            </div>
          )}
        </div>

        {/* PM2 进程信息 */}
        {pm2Status && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">PM2 进程信息</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">进程ID:</span>
                <p className="text-gray-900 mt-1">{pm2Status.pid || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">CPU使用率:</span>
                <p className="text-gray-900 mt-1">{pm2Status.monit?.cpu || 0}%</p>
              </div>
              <div>
                <span className="text-gray-500">内存使用:</span>
                <p className="text-gray-900 mt-1">
                  {pm2Status.monit?.memory ? 
                    `${Math.round(pm2Status.monit.memory / 1024 / 1024)}MB` : 
                    'N/A'
                  }
                </p>
              </div>
              <div>
                <span className="text-gray-500">重启次数:</span>
                <p className="text-gray-900 mt-1">{pm2Status.pm2_env?.restart_time || 0}</p>
              </div>
            </div>
            {pm2Status.pm2_env?.pm_uptime && (
              <div className="mt-3">
                <span className="text-gray-500 text-sm">启动时间:</span>
                <p className="text-gray-900 mt-1 text-sm">
                  {new Date(pm2Status.pm2_env.pm_uptime).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Package.json 信息 */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">项目信息</h3>
          
          {isLoadingPackage ? (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              <span>读取 package.json 中...</span>
            </div>
          ) : packageInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 text-sm">项目名称:</span>
                  <p className="text-gray-900 mt-1">{packageInfo.name}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">版本:</span>
                  <p className="text-gray-900 mt-1">{packageInfo.version}</p>
                </div>
              </div>
              
              {packageInfo.description && (
                <div>
                  <span className="text-gray-500 text-sm">描述:</span>
                  <p className="text-gray-900 mt-1">{packageInfo.description}</p>
                </div>
              )}
              
              {packageInfo.scripts && Object.keys(packageInfo.scripts).length > 0 && (
                <div>
                  <span className="text-gray-500 text-sm">可用脚本:</span>
                  <div className="mt-2 space-y-1">
                    {Object.entries(packageInfo.scripts).map(([scriptName, command]) => (
                      <div key={scriptName} className="text-sm">
                        <code className="bg-gray-100 px-2 py-1 rounded text-blue-600">
                          {scriptName}
                        </code>
                        <span className="text-gray-600 ml-2">{command as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {packageInfo.author && (
                <div>
                  <span className="text-gray-500 text-sm">作者:</span>
                  <p className="text-gray-900 mt-1">
                    {typeof packageInfo.author === 'string' ? 
                      packageInfo.author : 
                      packageInfo.author.name
                    }
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>未找到 package.json 文件</p>
              <p className="text-sm mt-1">这可能不是一个有效的 Node.js 项目</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
