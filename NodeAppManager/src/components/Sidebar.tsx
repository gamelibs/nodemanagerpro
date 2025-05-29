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
  const { navigation, i18n } = useApp();
  const { activeTab, setActiveTab } = navigation;
  const { t } = i18n;

  return (
    <aside className="w-80 border-r border-border bg-[#1E293B] light-theme:bg-white theme-bg-secondary flex flex-col">
      {/* 标题 */}
      <div className="p-4 border-b border-border theme-border">
        <h1 className="text-xl font-semibold text-text-primary theme-text-primary">{t('appTitle')}</h1>
      </div>

      {/* 图标导航 */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium theme-text-primary ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg text-white'
              : 'bg-gradient-to-r from-indigo-800 to-purple-800 light-theme:from-indigo-200 light-theme:to-purple-200 opacity-75 hover:opacity-90 hover:shadow-md light-theme:text-gray-700'
          }`}
        >
          <span className="text-lg">⚙️</span>
          <span>{t('nav.settings')}</span>
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium theme-text-primary ${
            activeTab === 'projects'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg text-white'
              : 'bg-gradient-to-r from-emerald-800 to-teal-800 light-theme:from-emerald-200 light-theme:to-teal-200 opacity-75 hover:opacity-90 hover:shadow-md light-theme:text-gray-700'
          }`}
        >
          <span className="text-lg">📁</span>
          <span>{t('nav.projects')}</span>
        </button>
      </div>

      {/* 分隔线 */}
      <div className="mx-4 border-t border-border theme-border mb-2"></div>

      {/* 日志区域（始终显示） */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <ActiveProjectLogs />
      </div>
    </aside>
  );
}

// 改进的日志组件 - 使用标签页管理多个日志会话
function ActiveProjectLogs() {
  const { getActiveLogSessions } = useLogs();
  const { state, i18n } = useApp();
  const { t } = i18n;
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  
  const activeSessions = getActiveLogSessions();
  
  // 自动选择活跃标签
  useEffect(() => {
    if (activeSessions.length > 0 && !activeTabId) {
      // 优先选择创建会话，否则选择第一个
      const creationSession = activeSessions.find(s => s.projectId.startsWith('creating-'));
      setActiveTabId(creationSession?.projectId || activeSessions[0].projectId);
    }
    
    // 如果当前选中的标签不存在了，切换到第一个可用的
    if (activeTabId && !activeSessions.find(s => s.projectId === activeTabId)) {
      setActiveTabId(activeSessions.length > 0 ? activeSessions[0].projectId : null);
    }
  }, [activeSessions, activeTabId]);

  // 如果没有活动会话，显示提示信息
  if (activeSessions.length === 0) {
    return (
      <div className="flex flex-col h-full bg-background theme-bg-secondary">
        <div className="p-6 text-center text-text-secondary theme-text-secondary flex flex-col items-center justify-center h-full">
          <div className="mb-4 p-4 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 light-theme:from-gray-200 light-theme:to-gray-300">
            <span className="text-3xl">📄</span>
          </div>
          <h3 className="text-sm font-medium theme-text-primary mb-2">{t('logs.noActiveProjects')}</h3>
          <p className="text-xs text-gray-400 theme-text-muted">{t('logs.noActiveProjectsDesc')}</p>
          <div className="mt-4 flex items-center space-x-1 text-xs text-indigo-400">
            <span>💡</span>
            <span>{t('logs.startHint')}</span>
          </div>
        </div>
      </div>
    );
  }

  // 获取当前选中的会话
  const currentSession = activeTabId 
    ? activeSessions.find(s => s.projectId === activeTabId)
    : activeSessions[0];
  
  if (!currentSession) return null;

  // 检查是否是创建项目的临时会话
  const isCreationSession = currentSession.projectId.startsWith('creating-');
  
  // 获取项目信息
  let project = null;
  let projectName = currentSession.projectName;
  let projectPath = '';
  let projectPort = null;
  
  if (!isCreationSession) {
    project = state.projects.find(p => p.id === currentSession.projectId);
    if (project) {
      projectName = project.name;
      projectPath = project.path;
      projectPort = project.port;
    }
  }

  // 生成标签信息
  const tabs = activeSessions.map(session => {
    const isCreation = session.projectId.startsWith('creating-');
    let tabName = session.projectName;
    let tabIcon = '📊';
    
    if (isCreation) {
      tabIcon = '🏗️';
      tabName = session.projectName.replace('创建项目: ', '');
    } else {
      const proj = state.projects.find(p => p.id === session.projectId);
      if (proj) {
        tabName = proj.name;
        tabIcon = proj.status === 'running' ? '🟢' : '⚪';
      }
    }
    
    return {
      id: session.projectId,
      name: tabName,
      icon: tabIcon,
      isCreation,
      isActive: session.projectId === activeTabId
    };
  });

  // 使用真实的日志数据
  const logs = currentSession.logs.length > 0 ? currentSession.logs : (
    isCreationSession ? [] : [
      {
        id: '1',
        level: 'info',
        message: `🚀 启动项目: ${projectName}`,
        timestamp: new Date()
      },
      {
        id: '2',
        level: 'info',
        message: `📂 工作目录: ${projectPath}`,
        timestamp: new Date()
      },
      {
        id: '3',
        level: 'info',
        message: `📦 包管理器: ${project?.packageManager || 'npm'}`,
        timestamp: new Date()
      },
      {
        id: '4',
        level: 'success',
        message: `🌐 服务地址: http://localhost:${projectPort}`,
        timestamp: new Date()
      }
    ]
  );

  return (
    <div className="flex flex-col h-full bg-background theme-bg-secondary">
      {/* 标签页头部 */}
      <div className="bg-background theme-bg-primary border-b border-border theme-border">
        <div className="flex items-center overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab.isActive
                  ? 'border-indigo-500 theme-text-primary bg-slate-100 light-theme:bg-slate-100 dark:bg-slate-700'
                  : 'border-transparent theme-text-secondary hover:theme-text-primary hover:bg-slate-50 light-theme:hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="max-w-24 truncate">{tab.name}</span>
              {tab.isCreation && (
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 项目信息栏 */}
      <div className="p-3 bg-gradient-to-r from-slate-100 to-slate-50 light-theme:from-gray-50 light-theme:to-gray-100 dark:from-slate-800 dark:to-slate-700 border-b border-border theme-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isCreationSession ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-400'}`}></div>
            <h3 className="text-sm font-semibold theme-text-primary">{projectName}</h3>
          </div>
          {projectPort && (
            <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-lg font-medium">
              :{projectPort}
            </span>
          )}
        </div>
        
        {projectPath && (
          <div className="text-xs theme-text-secondary truncate flex items-center space-x-1">
            <span>📂</span>
            <span>{projectPath}</span>
          </div>
        )}
        
        {projectPort && project?.template === 'static-app' && (
          <div className="mt-2">
            <button
              onClick={async () => {
                try {
                  await window.electronAPI?.invoke('shell:openExternal', `http://localhost:${projectPort}`);
                } catch (error) {
                  console.error('打开浏览器失败:', error);
                }
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 underline decoration-dotted flex items-center space-x-1"
            >
              <span>🌐</span>
              <span>访问网站: http://localhost:{projectPort}</span>
            </button>
          </div>
        )}
        
        {isCreationSession && (
          <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 flex items-center space-x-1">
            <span>🏗️</span>
            <span>项目创建会话</span>
          </div>
        )}
      </div>

      {/* 日志内容区域 - 保持原有样式 */}
      <div className="flex-1 overflow-y-auto bg-gray-950 dark:bg-gray-950 light-theme:bg-gray-100">
        <div className="p-4 text-xs font-mono h-full">
          {logs.length === 0 && isCreationSession ? (
            <div className="text-gray-500 light-theme:text-gray-600 text-center py-4">
              <span>等待创建日志...</span>
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start space-x-2">
                  <span className="text-gray-500 light-theme:text-gray-600 text-[10px] mt-0.5 w-16 flex-shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString('zh-CN', { 
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                  <span className={`flex-1 ${getLogColor(log.level)} light-theme:text-gray-800`}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
