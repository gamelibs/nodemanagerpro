import { useState, useEffect } from 'react';
import CreateProjectModal from './CreateProjectModal';
import ProjectSettingsModal from './ProjectSettingsModal';
import { useProjects } from '../hooks/useProjects';
import type { Project } from '../types';

// 导入项目模块
import {
  useProjectData,
  useProjectOperations,
  ProjectList,
  ProjectDetails,
  ProjectActions,
  DependencyStatus,
  ProjectLogs
} from './projects';

interface ProjectsPageProps {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
}

export default function ProjectsPage({ 
  projects, 
  isLoading, 
  error
}: ProjectsPageProps) {
  const { createProject, importProject, removeProject, updateProject, synchronizeProjectStatuses } = useProjects();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // 使用项目数据管理 Hook
  const projectData = useProjectData();
  
  // 使用项目操作 Hook
  const projectOps = useProjectOperations();

  // 同步项目状态
  useEffect(() => {
    if (projects.length > 0) {
      synchronizeProjectStatuses();
    }
  }, [projects.length, synchronizeProjectStatuses]);

  // 处理项目创建确认
  const handleCreateConfirm = async (projectConfig: Parameters<typeof createProject>[0]) => {
    await createProject(projectConfig);
    setShowCreateModal(false);
  };

  // 处理项目设置更新
  const handleProjectUpdate = async (updatedProject: Project) => {
    const result = await updateProject(updatedProject.id, updatedProject);
    if (result.success && selectedProject && selectedProject.id === updatedProject.id) {
      setSelectedProject(updatedProject);
    }
  };

  // 处理导入项目
  const handleImportProject = async () => {
    await importProject();
  };

  const handleSelectProject = async (project: Project) => {
    console.log('👆 选择项目:', project.name, project.id);
    setSelectedProject(project);
    
    // 清空之前的数据并获取新项目的数据
    await projectData.fetchProjectData(project);
  };

  // 删除项目处理函数
  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    
    if (window.confirm(`确定要删除项目 "${selectedProject.name}" 吗？这不会删除项目文件。`)) {
      try {
        await removeProject(selectedProject.id);
        setSelectedProject(null);
        projectData.clearData();
        projectOps.showToast('项目删除成功', 'success');
      } catch (error) {
        console.error('删除项目失败:', error);
        projectOps.showToast('删除项目失败', 'error');
      }
    }
  };

  // 项目操作处理函数
  const handleStartProject = async (project: Project) => {
    const success = await projectOps.startProject(project);
    if (success) {
      // 重新获取PM2状态
      await projectData.refreshPM2Status(project);
    }
  };

  const handleStopProject = async (project: Project) => {
    const success = await projectOps.stopProject(project);
    if (success) {
      // 重新获取PM2状态
      await projectData.refreshPM2Status(project);
    }
  };

  const handleRestartProject = async (project: Project) => {
    const success = await projectOps.restartProject(project);
    if (success) {
      // 重新获取PM2状态
      await projectData.refreshPM2Status(project);
    }
  };

  const handleInstallDependencies = async (project: Project) => {
    const success = await projectOps.installDependencies(project, project.packageManager);
    if (success && projectData.packageInfo) {
      // 重新检查依赖状态
      await projectData.checkDependencies(project, projectData.packageInfo);
    }
  };

  // 端口编辑处理函数
  const handleEditPort = () => {
    projectOps.setIsEditingPort(true);
    projectOps.setTempPort((projectData.projectPort || selectedProject?.port || '').toString());
  };

  const handleSavePort = async () => {
    if (!selectedProject || !projectOps.tempPort) return;
    
    const newPort = parseInt(projectOps.tempPort);
    if (isNaN(newPort) || newPort < 1 || newPort > 65535) {
      projectOps.showToast('请输入有效的端口号 (1-65535)', 'error');
      return;
    }

    const success = await projectOps.saveProjectPort(selectedProject, newPort);
    if (success) {
      projectOps.setIsEditingPort(false);
      // 重新读取端口配置
      await projectData.refreshProjectPort(selectedProject);
      // 更新项目记录
      const updateResult = await updateProject(selectedProject.id, { port: newPort });
      if (!updateResult.success) {
        projectOps.showToast('保存端口配置失败', 'error');
      }
    }
  };

  const handleCancelEditPort = () => {
    projectOps.setIsEditingPort(false);
    projectOps.setTempPort('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* 头部操作栏 */}
      <div className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">项目管理</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
              >
                创建项目
              </button>
              <button
                onClick={handleImportProject}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200"
              >
                导入项目
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex gap-6 p-6">
          {/* 左侧：项目列表 */}
          <div className="w-1/3 flex flex-col">
            <ProjectList
              projects={projects}
              selectedProject={selectedProject}
              onSelectProject={handleSelectProject}
              isLoading={isLoading}
              error={error}
              pm2Status={projectData.pm2Status}
            />
          </div>

          {/* 右侧：项目详情和操作 */}
          <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
            {selectedProject ? (
              <>
                {/* 项目详情 */}
                <ProjectDetails
                  project={selectedProject}
                  packageInfo={projectData.packageInfo}
                  isLoadingPackage={projectData.isLoadingPackage}
                  pm2Status={projectData.pm2Status}
                  isLoadingPM2={projectData.isLoadingPM2}
                  projectPort={projectData.projectPort}
                />

                {/* 项目操作 */}
                <ProjectActions
                  project={selectedProject}
                  pm2Status={projectData.pm2Status}
                  isLoadingPM2={projectData.isLoadingPM2}
                  dependencyStatus={projectData.dependencyStatus}
                  isCheckingDependencies={projectData.isCheckingDependencies}
                  isInstallingDependencies={projectOps.isInstallingDependencies}
                  packageInfo={projectData.packageInfo}
                  projectPort={projectData.projectPort}
                  isEditingPort={projectOps.isEditingPort}
                  tempPort={projectOps.tempPort}
                  onStartProject={handleStartProject}
                  onStopProject={handleStopProject}
                  onRestartProject={handleRestartProject}
                  onDeleteProject={handleDeleteProject}
                  onInstallDependencies={handleInstallDependencies}
                  onEditPort={handleEditPort}
                  onSavePort={handleSavePort}
                  onCancelEditPort={handleCancelEditPort}
                  onPortChange={projectOps.setTempPort}
                />

                {/* 依赖状态 */}
                <DependencyStatus
                  project={selectedProject}
                  packageInfo={projectData.packageInfo}
                  dependencyStatus={projectData.dependencyStatus}
                  isCheckingDependencies={projectData.isCheckingDependencies}
                  isInstallingDependencies={projectOps.isInstallingDependencies}
                  onInstallDependencies={handleInstallDependencies}
                />

                {/* 项目日志 */}
                <ProjectLogs
                  project={selectedProject}
                  pm2Logs={projectData.pm2Logs}
                  isLoadingLogs={projectData.isLoadingLogs}
                  onRefreshLogs={projectData.fetchPM2Logs}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-600 text-lg mb-2">请选择一个项目</p>
                  <p className="text-gray-500">从左侧列表中选择项目查看详情</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast 提示 */}
      {projectOps.toastMessage && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-4 py-2 rounded-lg shadow-lg ${
            projectOps.toastType === 'success' ? 'bg-green-600 text-white' :
            projectOps.toastType === 'error' ? 'bg-red-600 text-white' :
            'bg-blue-600 text-white'
          }`}>
            {projectOps.toastMessage}
          </div>
        </div>
      )}

      {/* 模态框 */}
      {showCreateModal && (
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onConfirm={handleCreateConfirm}
        />
      )}

      {showSettingsModal && selectedProject && (
        <ProjectSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          project={selectedProject}
          onUpdate={handleProjectUpdate}
        />
      )}
    </div>
  );
}
