import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProjectCard from './components/ProjectCard';
import HotReloadTest from './components/HotReloadTest';
import StorageDebugInfo from './components/StorageDebugInfo';
import { AppProvider } from './store/AppContext';
import { ToastProvider } from './store/ToastContext';
import { useProjects } from './hooks/useProjects';
import { useEffect } from 'react';
import './App.css';

function AppContent() {
  // 添加开发模式标识
  const isDev = import.meta.env.DEV;
  const { projects, isLoading, error, loadProjects } = useProjects();

  // 组件挂载时加载项目
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <div className="flex h-screen bg-[#0F172A]">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {isDev && (
            <div className="mb-4 p-3 bg-green-900/20 border border-green-700 rounded-lg">
              <p className="text-green-400 text-sm">
                🔥 开发模式 | 支持热更新 | 修改代码即时生效
              </p>
            </div>
          )}
          <Header />
          
          {isDev && (
            <div className="mb-6">
              <HotReloadTest />
            </div>
          )}

          {isDev && <StorageDebugInfo />}
          
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg">
              <p className="text-red-400 text-sm">错误: {error}</p>
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-text-secondary">加载项目中...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-text-secondary">暂无项目，点击"+ Import Project"开始添加项目</p>
                </div>
              ) : (
                projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              )}
            </div>
          )}
        </div>
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
