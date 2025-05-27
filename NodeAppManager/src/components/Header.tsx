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
        <div className="flex items-center space-x-3">
          <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Projects</h2>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleImportProject}
            disabled={isLoading}
            className="px-6 py-2.5 text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <span className="text-sm">📁</span>
            <span>{isLoading ? '导入中...' : 'Import Project'}</span>
          </button>
          <button 
            onClick={handleCreateProject}
            disabled={isLoading}
            className="px-6 py-2.5 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <span className="text-sm">✨</span>
            <span>{isLoading ? '处理中...' : 'Create New'}</span>
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
