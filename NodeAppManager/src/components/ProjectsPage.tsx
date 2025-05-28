import Header from './Header';
import ProjectCard from './ProjectCard';
import HotReloadTest from './HotReloadTest';
import StorageDebugInfo from './StorageDebugInfo';
import { useApp } from '../store/AppContext';
import type { Project } from '../types';

interface ProjectsPageProps {
  isDev: boolean;
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  initializeTestData: () => void;
}

export default function ProjectsPage({ 
  isDev, 
  projects, 
  isLoading, 
  error, 
  initializeTestData 
}: ProjectsPageProps) {
  const { i18n } = useApp();
  const { t } = i18n;

  return (
    <div className="p-8 h-full overflow-auto">
      {/* 开发模式提示 */}
      {isDev && (
        <div className="mb-4 p-3 bg-green-900/20 light-theme:bg-green-100/80 border border-green-700 light-theme:border-green-300 rounded-lg">
          <p className="text-green-400 light-theme:text-green-700 text-sm">
            🔥 {t('dev.mode')} | {t('dev.hotReload')} | {t('dev.liveUpdate')}
          </p>
        </div>
      )}

      {/* 页面标题和操作按钮 */}
      <Header />
      
      {/* 开发工具 */}
      {isDev && (
        <div className="mb-6">
          <HotReloadTest />
        </div>
      )}

      {/* 调试信息 */}
      {isDev && <StorageDebugInfo />}
      
      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 light-theme:bg-red-100/80 border border-red-700 light-theme:border-red-300 rounded-lg">
          <p className="text-red-400 light-theme:text-red-700 text-sm">{t('common.error')}: {error}</p>
        </div>
      )}
      
      {/* 项目列表内容 */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-text-secondary theme-text-secondary">{t('projects.loading')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-600 light-theme:from-gray-200 light-theme:to-gray-300 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">📁</span>
                </div>
                <h3 className="text-lg font-semibold text-white theme-text-primary mb-2">{t('projects.empty')}</h3>
                <p className="text-text-secondary theme-text-secondary mb-6">{t('projects.emptyDesc')}</p>
              </div>
              {isDev && (
                <button
                  onClick={initializeTestData}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-xl"
                >
                  🧪 {t('dev.addTestProjects')}
                </button>
              )}
            </div>
          ) : (
            projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
