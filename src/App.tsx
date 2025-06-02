import { useEffect } from 'react';
import ProjectsPage from './components/ProjectsPage';
import SettingsPage from './components/SettingsPage';
import { useApp } from './store/AppContext';
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
  }, []); // 只在挂载时执行一次

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
  return <AppContent />;
}
