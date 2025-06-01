import { useEffect } from 'react';
import ProjectsPage from './components/ProjectsPage';
import SettingsPage from './components/SettingsPage';
import { AppProvider, useApp } from './store/AppContext';
import { ToastProvider } from './store/ToastContext';
import { useProjects } from './hooks/useProjects';
import './App.css';

function AppContent() {
  const { navigation, state } = useApp();
  const { activeTab } = navigation;
  const { projects, isLoading, error } = state;
  const { loadProjects } = useProjects();

  // 在组件挂载时加载项目
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <div className="app-container theme-bg-primary">
      {activeTab === 'settings' ? (
        <SettingsPage />
      ) : (
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
