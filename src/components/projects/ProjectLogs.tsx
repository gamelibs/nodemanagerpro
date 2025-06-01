import React from 'react';
import type { Project } from '../../types';

interface ProjectLogsProps {
  project: Project;
  pm2Logs: string[];
  isLoadingLogs: boolean;
  onRefreshLogs: (project: Project) => void;
}

export const ProjectLogs: React.FC<ProjectLogsProps> = ({
  project,
  pm2Logs,
  isLoadingLogs,
  onRefreshLogs
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">项目日志</h3>
          <button
            onClick={() => onRefreshLogs(project)}
            disabled={isLoadingLogs}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {isLoadingLogs ? '刷新中...' : '刷新日志'}
          </button>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
          {isLoadingLogs ? (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              <span>加载日志中...</span>
            </div>
          ) : pm2Logs.length > 0 ? (
            <div className="space-y-1">
              {pm2Logs.map((log, index) => (
                <div
                  key={index}
                  className="text-sm font-mono text-gray-300 leading-relaxed whitespace-pre-wrap break-words"
                >
                  {log}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>暂无日志信息</p>
              <p className="text-sm mt-1">项目启动后将显示日志</p>
            </div>
          )}
        </div>

        {pm2Logs.length > 0 && (
          <div className="mt-3 text-xs text-gray-500 text-center">
            显示最近 {pm2Logs.length} 条日志
          </div>
        )}
      </div>
    </div>
  );
};
