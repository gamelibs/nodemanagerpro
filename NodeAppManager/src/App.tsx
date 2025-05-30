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



  return (
    <div className="h-screen w-screen bg-[#0F172A] light-theme:bg-gray-50 theme-bg-primary overflow-hidden">
      {activeTab === 'settings' ? (
        // 设置页面 - 独立页面
        <SettingsPage />
      ) : (
        // 新的项目管理布局
        <ProjectsPage 
          projects={projects}
          isLoading={isLoading}
          error={error}
        />
      )}
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
