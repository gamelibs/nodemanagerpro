import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProjectCard from './components/ProjectCard';
import HotReloadTest from './components/HotReloadTest';
import StorageDebugInfo from './components/StorageDebugInfo';
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
          
          {activeTab === 'settings' ? (
            // 设置页面
            <div className="bg-gradient-to-br from-[#1E293B] to-[#1A2332] p-8 rounded-xl border border-border shadow-card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
                  <span className="text-white text-xl">⚙️</span>
                </div>
                <h2 className="text-2xl font-bold text-white">设置</h2>
              </div>
              <div className="space-y-6">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-2">应用信息</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>• Node App Manager - 企业级项目管理工具</p>
                    <p>• 集成PM2进程管理，支持自动重启和性能监控</p>
                    <p>• 实时日志显示，项目状态监控</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-2">技术栈</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Electron', 'React', 'TypeScript', 'Vite', 'PM2', 'Tailwind CSS'].map(tech => (
                      <span key={tech} className="px-3 py-1 bg-indigo-600/20 text-indigo-300 rounded-full text-xs border border-indigo-500/30">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-center text-gray-400 text-sm">
                  <p>更多设置功能正在开发中...</p>
                </div>
              </div>
            </div>
          ) : (
            // 项目列表页面
            isLoading ? (
              <div className="text-center py-8">
                <p className="text-text-secondary">加载项目中...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mb-6">
                      <div className="mx-auto w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-600 rounded-full flex items-center justify-center mb-4">
                        <span className="text-3xl">📁</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">暂无项目</h3>
                      <p className="text-text-secondary mb-6">开始添加您的第一个Node.js项目</p>
                    </div>
                    {isDev && (
                      <button
                        onClick={initializeTestData}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-xl"
                      >
                        🧪 添加测试项目 (开发模式)
                      </button>
                    )}
                  </div>
                ) : (
                  projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))
                )}
              </div>
            )
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
