import { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useApp } from '../store/AppContext';
import CreateProjectModal from './CreateProjectModal';
import StatusSyncIndicator from './StatusSyncIndicator';

export default function Header() {
  const { importProject, createProject, isLoading, synchronizeProjectStatuses } = useProjects();
  const { i18n } = useApp();
  const { t } = i18n;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | undefined>();

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

  const handleRefreshStatus = async () => {
    setSyncing(true);
    try {
      await synchronizeProjectStatuses();
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('刷新状态失败:', error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <h2 className="text-3xl font-bold theme-text-primary">{t('projects.title')}</h2>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <StatusSyncIndicator lastSync={lastSyncTime} isLoading={syncing} />
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleRefreshStatus}
            disabled={isLoading || syncing}
            className="px-4 py-2.5 btn-info rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <span className={`text-sm ${syncing ? 'animate-spin' : ''}`}>🔄</span>
            <span>{syncing ? '同步中' : '刷新状态'}</span>
          </button>
          <button 
            onClick={handleImportProject}
            disabled={isLoading}
            className="px-6 py-2.5 btn-success rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <span className="text-sm">📁</span>
            <span>{isLoading ? t('projects.importing') : t('projects.import')}</span>
          </button>
          <button 
            onClick={handleCreateProject}
            disabled={isLoading}
            className="px-6 py-2.5 btn-primary rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <span className="text-sm">✨</span>
            <span>{isLoading ? t('projects.creating') : t('projects.create')}</span>
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
}
