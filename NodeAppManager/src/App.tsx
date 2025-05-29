import Sidebar from './components/Sidebar';
import ProjectsPage from './components/ProjectsPage';
import SettingsPage from './components/SettingsPage';
import { AppProvider, useApp } from './store/AppContext';
import { ToastProvider } from './store/ToastContext';
import { useProjects } from './hooks/useProjects';
import { useEffect } from 'react';
import './App.css';

function AppContent() {
  const { projects, isLoading, error, loadProjects } = useProjects();
  const { navigation } = useApp();
  const { activeTab } = navigation;

  // 组件挂载时加载项目
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // 监听日志切换事件
  useEffect(() => {
    const handleSwitchToLogs = (event: any) => {
      console.log('收到 switchToLogs 事件:', event.detail);
      // 由于日志区域已经在 Sidebar 中显示，这里可能不需要额外操作
      // 或者你可以在这里添加一些特定的逻辑，比如高亮显示等
    };

    window.addEventListener('switchToLogs', handleSwitchToLogs);
    
    return () => {
      window.removeEventListener('switchToLogs', handleSwitchToLogs);
    };
  }, []);

  return (
    <div className="flex h-screen bg-[#0F172A] light-theme:bg-gray-50 theme-bg-primary">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {activeTab === 'settings' ? (
          // 设置页面 - 独立页面
          <SettingsPage />
        ) : (
          // 项目页面 - 独立页面
          <ProjectsPage 
            projects={projects}
            isLoading={isLoading}
            error={error}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ToastProvider>
  );
}
