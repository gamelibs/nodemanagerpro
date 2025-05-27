import { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { useLogs } from '../hooks/useLogs';

// 辅助函数：根据日志级别获取颜色
function getLogColor(level: string) {
  switch (level) {
    case 'error':
      return 'text-red-300';
    case 'warn':
      return 'text-yellow-300';
    case 'success':
      return 'text-green-300';
    case 'info':
    default:
      return 'text-blue-300';
  }
}

export default function Sidebar() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const { getActiveLogSessions } = useLogs();
  const { navigation } = useApp();
  const { activeTab, setActiveTab } = navigation;
  
  const activeSessions = getActiveLogSessions();

  // 获取活跃项目（如果有）
  useEffect(() => {
    if (activeSessions.length > 0 && !activeProjectId) {
      setActiveProjectId(activeSessions[0].projectId);
    }
  }, [activeSessions, activeProjectId]);

  // 监听来自ProjectCard的切换日志事件
  useEffect(() => {
    const handleSwitchToLogs = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.projectId) {
        setActiveProjectId(customEvent.detail.projectId);
      }
    };

    window.addEventListener('switchToLogs', handleSwitchToLogs as EventListener);
    return () => {
      window.removeEventListener('switchToLogs', handleSwitchToLogs as EventListener);
    };
  }, []);

  return (
    <aside className="w-80 border-r border-border bg-[#1E293B] flex flex-col">
      {/* 标题 */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-semibold text-text-primary">Node App Manager</h1>
      </div>

      {/* 图标导航 */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
              : 'text-text-secondary hover:text-white hover:bg-gradient-to-r hover:from-slate-700 hover:to-slate-600'
          }`}
        >
          <span className="text-lg">⚙️</span>
          <span>Settings</span>
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${
            activeTab === 'projects'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
              : 'text-text-secondary hover:text-white hover:bg-gradient-to-r hover:from-slate-700 hover:to-slate-600'
          }`}
        >
          <span className="text-lg">📁</span>
          <span>Projects</span>
        </button>
      </div>

      {/* 分隔线 */}
      <div className="mx-4 border-t border-border mb-2"></div>

      {/* 日志区域（始终显示） */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <ActiveProjectLogs activeProjectId={activeProjectId} />
      </div>
    </aside>
  );
}

// 用于显示选中项目的日志组件
function ActiveProjectLogs({ activeProjectId }: { activeProjectId: string | null }) {
  const { getActiveLogSessions } = useLogs();
  const { state } = useApp();
  const { clearProjectLogs } = useLogs();
  
  const activeSessions = getActiveLogSessions();
  
  // 如果没有活动项目，显示提示信息
  if (activeSessions.length === 0) {
    return (
      <div className="p-6 text-center text-text-secondary flex flex-col items-center justify-center h-full">
        <div className="mb-4 p-4 rounded-full bg-gradient-to-br from-slate-700 to-slate-600">
          <span className="text-3xl">📄</span>
        </div>
        <h3 className="text-sm font-medium text-white mb-2">暂无运行中的项目</h3>
        <p className="text-xs text-gray-400">启动项目后将在此显示实时日志</p>
        <div className="mt-4 flex items-center space-x-1 text-xs text-indigo-400">
          <span>💡</span>
          <span>点击项目卡片的 Start 按钮开始</span>
        </div>
      </div>
    );
  }

  // 获取当前选中的项目会话
  const currentSession = activeProjectId
    ? activeSessions.find(s => s.projectId === activeProjectId)
    : activeSessions[0];
  
  if (!currentSession) return null;

  // 获取项目信息
  const project = state.projects.find(p => p.id === currentSession.projectId);
  if (!project) return null;

  // 清空日志处理
  const handleClearLogs = () => {
    clearProjectLogs(project.id);
  };

  // 打开浏览器
  const handleOpenInBrowser = () => {
    if (project.port) {
      window.open(`http://localhost:${project.port}`, '_blank');
    }
  };

  // 使用真实的日志数据，如果没有日志则显示模拟数据
  const logs = currentSession.logs.length > 0 ? currentSession.logs : [
    {
      id: '1',
      level: 'info',
      message: `🚀 启动项目: ${project.name}`,
      timestamp: new Date()
    },
    {
      id: '2',
      level: 'info',
      message: `📂 工作目录: ${project.path}`,
      timestamp: new Date()
    },
    {
      id: '3',
      level: 'info',
      message: `📦 包管理器: ${project.packageManager}`,
      timestamp: new Date()
    },
    {
      id: '4',
      level: 'success',
      message: `🌐 服务地址: http://localhost:${project.port}`,
      timestamp: new Date()
    }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* 项目信息头部 */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-slate-800 to-slate-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <h3 className="text-sm font-semibold text-white">{project.name}</h3>
          </div>
          <div className="flex items-center space-x-2">
            {project.port && (
              <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-lg font-medium">
                :{project.port}
              </span>
            )}
            <button 
              onClick={handleClearLogs}
              className="text-xs text-gray-400 hover:text-white p-1 rounded hover:bg-slate-600 transition-colors"
              title="清空日志"
            >
              🗑️
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-300 truncate flex items-center space-x-1">
          <span>📂</span>
          <span>{project.path}</span>
        </div>
        {project.port && (
          <div className="mt-2">
            <button
              onClick={handleOpenInBrowser}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline decoration-dotted flex items-center space-x-1"
            >
              <span>🌐</span>
              <span>http://localhost:{project.port}</span>
            </button>
          </div>
        )}
      </div>

      {/* 日志内容 */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="bg-gray-950 rounded-lg p-4 text-xs font-mono h-full overflow-y-auto border border-gray-800">
          {logs.map((log: any, index: number) => (
            <div key={log.id || index} className="mb-1.5 leading-relaxed">
              <span className="text-gray-500 mr-2 font-medium">
                {log.timestamp.toLocaleTimeString()}
              </span>
              {log.message.includes('http://') ? (
                <button
                  onClick={handleOpenInBrowser}
                  className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer decoration-dotted"
                >
                  {log.message}
                </button>
              ) : (
                <span className={getLogColor(log.level || 'info')}>
                  {log.message}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
