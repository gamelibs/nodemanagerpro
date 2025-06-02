import { useState } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { useApp } from '../../store/AppContext';
import { useToastContext } from '../../store/ToastContext';
import CreateProjectModal from '../CreateProjectModal';

interface ProjectHeaderProps {
  // selectedProject 不再需要，因为删除按钮移到了列表中
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = () => {
  const { importProject, createProject, isLoading, synchronizeProjectStatuses } = useProjects();
  const { navigation, i18n } = useApp();
  const { setActiveTab } = navigation;
  const { t } = i18n;
  const { showToast } = useToastContext();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleImportProject = async () => {
    await importProject();
  };

  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  const handleCreateConfirm = async (projectConfig: Parameters<typeof createProject>[0]) => {
    await createProject(projectConfig);
    setShowCreateModal(false);
  };

  const handleSettingsClick = () => {
    setActiveTab('settings');
  };

  const handleSyncStatus = async () => {
    setIsSyncing(true);
    try {
      showToast('正在同步项目状态...', 'info');
      await synchronizeProjectStatuses();
    } catch (error) {
      console.error('手动同步项目状态失败:', error);
      showToast('同步项目状态失败', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between w-full">
        {/* 左侧：应用名称和信息 */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold theme-text-primary">{t('appTitle')}</h1>
        </div>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncStatus}
            disabled={isSyncing || isLoading}
            className="theme-text-muted hover:theme-text-primary bg-transparent px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="同步项目状态"
          >
            <span className={isSyncing ? 'animate-spin' : ''}>🔄</span>
            <span className="text-sm">{isSyncing ? '同步中...' : '同步状态'}</span>
          </button>
          
          <button
            onClick={handleImportProject}
            disabled={isLoading}
            className="btn-success px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>📁</span>
            <span>{isLoading ? t('projects.importing') : t('projects.import')}</span>
          </button>
          
          <button
            onClick={handleCreateProject}
            disabled={isLoading}
            className="btn-primary px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>✨</span>
            <span>{isLoading ? t('projects.creating') : t('projects.create')}</span>
          </button>
          
          <button 
            onClick={handleSettingsClick}
            className="theme-text-muted hover:theme-text-primary text-xl bg-transparent p-2 rounded-lg transition-colors"
            title={t('common.settings')}
          >
            ⚙️
          </button>
        </div>
      </div>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleCreateConfirm}
      />
    </>
  );
};
