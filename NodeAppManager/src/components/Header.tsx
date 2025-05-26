import { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import CreateProjectModal from './CreateProjectModal';

export default function Header() {
  const { importProject, createProject, isLoading } = useProjects();
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold text-text-primary">Projects</h2>
        <div className="space-x-4">
          <button 
            onClick={handleImportProject}
            disabled={isLoading}
            className="px-4 py-2 text-text-primary bg-primary hover:bg-primary-hover rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '导入中...' : '+ Import Project'}
          </button>
          <button 
            onClick={handleCreateProject}
            disabled={isLoading}
            className="px-4 py-2 text-text-primary border border-border hover:border-border-hover rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '处理中...' : 'Create New Project'}
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
