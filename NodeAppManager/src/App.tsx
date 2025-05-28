import Sidebar from './components/Sidebar';
import ProjectsPage from './components/ProjectsPage';
import SettingsPage from './components/SettingsPage';
import { AppProvider, useApp } from './store/AppContext';
import { ToastProvider } from './store/ToastContext';
import { useProjects } from './hooks/useProjects';
import { useTestData } from './hooks/useTestData';
import { useEffect } from 'react';
import './App.css';

function AppContent() {
  // 添加开发模式标识
  const isDev = import.meta.env.DEV;
  const { projects, isLoading, error, loadProjects } = useProjects();
  const { initializeTestData } = useTestData();
  const { navigation } = useApp();
  const { activeTab } = navigation;

  // 组件挂载时加载项目
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

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
            isDev={isDev}
            projects={projects}
            isLoading={isLoading}
            error={error}
            initializeTestData={initializeTestData}
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
