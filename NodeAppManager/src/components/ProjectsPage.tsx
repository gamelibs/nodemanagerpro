import { useState, useEffect } from 'react';
import CreateProjectModal from './CreateProjectModal';
import ProjectSettingsModal from './ProjectSettingsModal';
import { useProjects } from '../hooks/useProjects';
import { useApp } from '../store/AppContext';
import { PM2Service, type PM2Process } from '../services/PM2Service';
import type { Project } from '../types';

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
  const { createProject, importProject, synchronizeProjectStatuses } = useProjects();
  const { navigation } = useApp();
  const { setActiveTab } = navigation;
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeProjectTab, setActiveProjectTab] = useState('overview'); // 项目详情标签页
  const [pm2Status, setPm2Status] = useState<PM2Process | null>(null); // PM2进程状态
  const [isLoadingPM2, setIsLoadingPM2] = useState(false);
  
  // 生成PM2进程名称的辅助函数
  const generateProcessName = (project: Project) => {
    return `${project.name}-${project.id}`;
  };

  // 同步项目状态和测试PM2服务
  useEffect(() => {
    if (projects.length > 0) {
      synchronizeProjectStatuses();
    }
    // 测试PM2服务
    testPM2Service();
  }, [projects.length, synchronizeProjectStatuses]);

  // 获取选中项目的PM2状态（仅在切换到概览标签时触发）
  const fetchPM2Status = async () => {
    if (!selectedProject) {
      setPm2Status(null);
      return;
    }

    setIsLoadingPM2(true);
    try {
      console.log('🔍 正在获取项目PM2状态:', selectedProject.name);
      const result = await PM2Service.listAllProcesses();
      if (result.success && result.processes) {
        console.log('📋 PM2进程列表:', result.processes);
        
        // 生成期望的进程名称
        const expectedProcessName = generateProcessName(selectedProject);
        console.log('🎯 期望的进程名称:', expectedProcessName);
        
        // 更严格的匹配逻辑：优先匹配进程名称，然后匹配路径
        const projectProcess = result.processes.find(
          (proc: PM2Process) => {
            // 先检查进程名称是否完全匹配
            if (proc.name === expectedProcessName) {
              return true;
            }
            // 再检查路径是否匹配
            if (proc.pm2_env && proc.pm2_env.pm_cwd === selectedProject.path) {
              return true;
            }
            // 最后检查名称是否部分匹配（兼容旧版本）
            if (proc.name && (
              proc.name === selectedProject.name || 
              proc.name.includes(selectedProject.name) ||
              selectedProject.name.includes(proc.name)
            )) {
              return true;
            }
            return false;
          }
        );
        
        if (projectProcess) {
          console.log('✅ 找到匹配的PM2进程:', projectProcess);
        } else {
          console.log('❌ 未找到匹配的PM2进程');
        }
        
        setPm2Status(projectProcess || null);
      } else {
        console.log('❌ 获取PM2进程列表失败:', result.error);
        setPm2Status(null);
      }
    } catch (error) {
      console.error('获取PM2状态失败:', error);
      setPm2Status(null);
    } finally {
      setIsLoadingPM2(false);
    }
  };

  // 当选中项目或切换到概览标签时获取PM2状态
  useEffect(() => {
    if (selectedProject && activeProjectTab === 'overview') {
      fetchPM2Status();
    } else if (!selectedProject) {
      setPm2Status(null);
    }
  }, [selectedProject, activeProjectTab]);

  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  const handleImportProject = async () => {
    await importProject();
  };

  const handleCreateConfirm = async (projectConfig: Parameters<typeof createProject>[0]) => {
    await createProject(projectConfig);
    setShowCreateModal(false);
  };

  const handleSelectProject = (project: Project) => {
    console.log('👆 选择项目:', project.name, project.id);
    setSelectedProject(project);
  };

  // 启动项目
  const handleStartProject = async () => {
    if (!selectedProject) return;
    
    try {
      setIsLoadingPM2(true);
      console.log('🚀 开始启动项目:', selectedProject.name);
      
      const result = await PM2Service.startProject(selectedProject);
      console.log('启动结果:', result);
      
      if (result.success) {
        console.log('✅ 项目启动成功，刷新PM2状态...');
        // 启动成功后立即刷新状态
        await fetchPM2Status();
      } else {
        console.error('❌ 项目启动失败:', result.error);
      }
    } catch (error) {
      console.error('启动项目失败:', error);
    } finally {
      setIsLoadingPM2(false);
    }
  };

  // 停止项目
  const handleStopProject = async () => {
    if (!selectedProject) return;
    
    try {
      setIsLoadingPM2(true);
      
      // 使用正确的进程名称
      const processName = generateProcessName(selectedProject);
      console.log('⏹️ 开始停止项目:', selectedProject.name, '进程名:', processName);
      
      const result = await PM2Service.stopProject(processName);
      console.log('停止结果:', result);
      
      if (result.success) {
        console.log('✅ 项目停止成功，刷新PM2状态...');
        // 停止成功后立即刷新状态
        await fetchPM2Status();
      } else {
        console.error('❌ 项目停止失败:', result.error);
      }
    } catch (error) {
      console.error('停止项目失败:', error);
    } finally {
      setIsLoadingPM2(false);
    }
  };

  // 重启项目
  const handleRestartProject = async () => {
    if (!selectedProject) return;
    
    try {
      setIsLoadingPM2(true);
      
      // 使用正确的进程名称
      const processName = generateProcessName(selectedProject);
      console.log('🔄 开始重启项目:', selectedProject.name, '进程名:', processName);
      
      const result = await PM2Service.restartProject(processName);
      console.log('重启结果:', result);
      
      if (result.success) {
        console.log('✅ 项目重启成功，刷新PM2状态...');
        // 重启成功后立即刷新状态
        await fetchPM2Status();
      } else {
        console.error('❌ 项目重启失败:', result.error);
      }
    } catch (error) {
      console.error('重启项目失败:', error);
    } finally {
      setIsLoadingPM2(false);
    }
  };

  const handleCloseSettings = () => {
    setShowSettingsModal(false);
    setTimeout(() => {
      setSelectedProject(null);
    }, 300);
  };

  // 测试PM2服务连接
  const testPM2Service = async () => {
    console.log('🧪 测试PM2服务连接...');
    try {
      const result = await PM2Service.listAllProcesses();
      console.log('🧪 PM2服务测试结果:', result);
    } catch (error) {
      console.error('🧪 PM2服务测试失败:', error);
    }
  };

  // 渲染项目状态
  const renderProjectStatus = (project: Project) => {
    const statusConfig = {
      running: { color: 'text-green-400', bg: 'bg-green-400/20', text: '运行中' },
      stopped: { color: 'text-gray-400', bg: 'bg-gray-400/20', text: '已停止' },
      error: { color: 'text-red-400', bg: 'bg-red-400/20', text: '错误' }
    };
    
    const config = statusConfig[project.status] || statusConfig.stopped;
    
    return (
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${config.bg}`}>
        <div className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`}></div>
        <span className={`text-xs ${config.color}`}>{config.text}</span>
      </div>
    );
  };

  // 渲染项目详情内容
  const renderProjectDetails = () => {
    if (!selectedProject) {
      return (
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold theme-text-primary mb-2">请选择管理的项目</h3>
            <p className="theme-text-muted">从左侧项目列表中选择一个项目来查看详细信息</p>
          </div>
        </div>
      );
    }

    const tabs = [
      { id: 'overview', label: '项目概览', icon: '📊' },
      { id: 'config', label: '项目配置', icon: '⚙️' },
      { id: 'dependencies', label: '依赖管理', icon: '📦' },
      { id: 'logs', label: '日志查看', icon: '📝' },
      { id: 'performance', label: '性能监控', icon: '📈' }
    ];

    return (
      <div className="flex flex-col h-full">
        {/* 项目详情头部 - 标签页 */}
        <div className="p-6 border-b theme-border">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveProjectTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeProjectTab === tab.id 
                    ? 'btn-primary' 
                    : 'theme-text-muted hover:theme-text-primary'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {activeProjectTab === tab.id && '*'}{tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 项目详情内容 */}
        <div className="flex-1 p-6 overflow-auto">
          {activeProjectTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="theme-bg-secondary p-4 rounded-lg">
                  <h4 className="font-semibold theme-text-primary mb-2">基本信息</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="theme-text-muted">项目路径:</span>
                      <span className="theme-text-primary">{selectedProject.path}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="theme-text-muted">项目类型:</span>
                      <span className="theme-text-primary">{selectedProject.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="theme-text-muted">端口:</span>
                      <span className="theme-text-primary">{selectedProject.port || '未分配'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="theme-text-muted">包管理器:</span>
                      <span className="theme-text-primary">{selectedProject.packageManager}</span>
                    </div>
                  </div>
                </div>
                
                <div className="theme-bg-secondary p-4 rounded-lg">
                  <h4 className="font-semibold theme-text-primary mb-3">运行状态</h4>
                  {isLoadingPM2 ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-sm theme-text-muted">获取状态中...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="theme-text-muted">当前状态:</span>
                          {pm2Status ? (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              (pm2Status.status === 'online' || pm2Status.pm2_env?.status === 'online')
                                ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300'
                                : (pm2Status.status === 'stopped' || pm2Status.pm2_env?.status === 'stopped')
                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300'
                            }`}>
                              {(pm2Status.status === 'online' || pm2Status.pm2_env?.status === 'online') ? '🟢 运行中' : 
                               (pm2Status.status === 'stopped' || pm2Status.pm2_env?.status === 'stopped') ? '⚪ 已停止' : 
                               (pm2Status.status === 'error' || pm2Status.pm2_env?.status === 'error') ? '🔴 错误' :
                               (pm2Status.status === 'launching' || pm2Status.pm2_env?.status === 'launching') ? '🟡 启动中' :
                               (pm2Status.status === 'stopping' || pm2Status.pm2_env?.status === 'stopping') ? '🟠 停止中' : '🔴 未知状态'}
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300">
                              ⚫ 未运行
                            </span>
                          )}
                        </div>
                        
                        {pm2Status && (
                          <>
                            <div className="flex justify-between">
                              <span className="theme-text-muted">进程ID:</span>
                              <span className="theme-text-primary">{pm2Status.pid || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="theme-text-muted">CPU占用:</span>
                              <span className="theme-text-primary">{
                                typeof pm2Status.cpu === 'number' ? pm2Status.cpu.toFixed(1) : 
                                typeof pm2Status.monit?.cpu === 'number' ? pm2Status.monit.cpu.toFixed(1) : '0'
                              }%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="theme-text-muted">内存占用:</span>
                              <span className="theme-text-primary">{
                                typeof pm2Status.memory === 'number' && pm2Status.memory > 0
                                  ? (pm2Status.memory / 1024 / 1024).toFixed(1) 
                                  : typeof pm2Status.monit?.memory === 'number' && pm2Status.monit.memory > 0
                                  ? (pm2Status.monit.memory / 1024 / 1024).toFixed(1)
                                  : '0'
                              } MB</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="theme-text-muted">运行时间:</span>
                              <span className="theme-text-primary">{
                                typeof pm2Status.uptime === 'number' && pm2Status.uptime > 0
                                  ? Math.floor(pm2Status.uptime / 1000 / 60)
                                  : '0'
                              } 分钟</span>
                            </div>
                          </>
                        )}
                        
                        <div className="flex justify-between">
                          <span className="theme-text-muted">最后打开:</span>
                          <span className="theme-text-primary">
                            {new Date(selectedProject.lastOpened).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      {/* 项目控制按钮 */}
                      <div className="space-y-2 pt-2 border-t theme-border">
                        {/* 主要控制按钮 */}
                        <div className="flex space-x-2">
                          {(pm2Status?.status === 'online' || pm2Status?.pm2_env?.status === 'online') ? (
                            <button 
                              onClick={handleStopProject}
                              className="flex-1 px-3 py-2 btn-remove rounded-lg text-sm"
                              disabled={isLoadingPM2}
                            >
                              {isLoadingPM2 ? '停止中...' : '停止'}
                            </button>
                          ) : (
                            <button 
                              onClick={handleStartProject}
                              className="flex-1 px-3 py-2 btn-success rounded-lg text-sm"
                              disabled={isLoadingPM2}
                            >
                              {isLoadingPM2 ? '启动中...' : '启动'}
                            </button>
                          )}
                          
                          <button 
                            onClick={handleRestartProject}
                            className="flex-1 px-3 py-2 btn-warning rounded-lg text-sm"
                            disabled={isLoadingPM2}
                          >
                            {isLoadingPM2 ? '重启中...' : '重启'}
                          </button>
                        </div>
                        
                        {/* 辅助按钮 */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setShowSettingsModal(true)}
                            className="px-3 py-2 btn-secondary rounded-lg text-sm"
                          >
                            ⚙️ 项目设置
                          </button>
                          <button
                            onClick={() => fetchPM2Status()}
                            className="px-3 py-2 btn-info rounded-lg text-sm"
                            disabled={isLoadingPM2}
                          >
                            🔄 刷新状态
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 快速操作 */}
              <div className="theme-bg-secondary p-4 rounded-lg">
                <h4 className="font-semibold theme-text-primary mb-3">快速操作</h4>
                <div className="grid grid-cols-3 gap-3">
                  <button className="p-3 btn-info rounded-lg text-sm">在文件夹中打开</button>
                  <button className="p-3 btn-info rounded-lg text-sm">在编辑器中打开</button>
                  <button className="p-3 btn-info rounded-lg text-sm">在浏览器中打开</button>
                </div>
              </div>
            </div>
          )}

          {activeProjectTab === 'config' && (
            <div className="space-y-6">
              <div className="theme-bg-secondary p-4 rounded-lg">
                <h4 className="font-semibold theme-text-primary mb-3">项目配置</h4>
                <p className="theme-text-muted text-sm">项目配置功能即将推出...</p>
              </div>
            </div>
          )}

          {activeProjectTab === 'dependencies' && (
            <div className="space-y-6">
              <div className="theme-bg-secondary p-4 rounded-lg">
                <h4 className="font-semibold theme-text-primary mb-3">依赖管理</h4>
                <p className="theme-text-muted text-sm">依赖管理功能即将推出...</p>
              </div>
            </div>
          )}

          {activeProjectTab === 'logs' && (
            <div className="space-y-6">
              <div className="theme-bg-secondary p-4 rounded-lg">
                <h4 className="font-semibold theme-text-primary mb-3">日志查看</h4>
                <p className="theme-text-muted text-sm">日志查看功能即将推出...</p>
              </div>
            </div>
          )}

          {activeProjectTab === 'performance' && (
            <div className="space-y-6">
              <div className="theme-bg-secondary p-4 rounded-lg">
                <h4 className="font-semibold theme-text-primary mb-3">性能监控</h4>
                <p className="theme-text-muted text-sm">性能监控功能即将推出...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* 顶部标题栏 */}
      <div className="theme-bg-secondary border-b theme-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold theme-text-primary">专业的 Node.js 管理器</h1>
        <div className="flex items-center gap-4">
          <span className="theme-text-muted">总项目数：{projects.length}</span>
          <button
            onClick={handleImportProject}
            className="btn-success px-4 py-2 rounded-lg text-sm transition-colors"
          >
            导入项目
          </button>
          <button
            onClick={handleCreateProject}
            className="btn-primary px-4 py-2 rounded-lg text-sm transition-colors"
          >
            创建项目
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className="theme-text-muted hover:theme-text-primary text-xl bg-transparent"
            title="设置"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex">
        {/* 左侧项目列表 */}
        <div className="w-1/3 border-r theme-border theme-bg-secondary flex flex-col">
          {/* 项目列表头部 */}
          <div className="p-4 border-b theme-border">
            <h2 className="text-lg font-semibold theme-text-primary">项目列表</h2>
          </div>

          {/* 项目列表内容 */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                <p>错误: {error}</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="p-4 text-center">
                <div className="text-4xl mb-4">📁</div>
                <p className="theme-text-muted text-sm">暂无项目</p>
                <p className="theme-text-muted text-xs mt-1">点击上方按钮创建或导入项目</p>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleSelectProject(project)}
                    className={`px-4 py-3 cursor-pointer transition-all flex items-center justify-between ${
                      selectedProject?.id === project.id
                        ? 'theme-bg-primary'
                        : 'theme-text-muted hover:theme-bg-hover'
                    }`}
                  >
                    <div>
                      <div className="font-medium theme-text-primary">{project.name}</div>
                      <div className="text-xs theme-text-muted">{project.type}</div>
                    </div>
                    {selectedProject?.id === project.id && (
                      <span className="theme-text-primary font-bold">→</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 右侧项目详情 */}
        <div className="flex-1 theme-bg-primary flex flex-col">
        {!selectedProject ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold theme-text-primary mb-2">请选择管理的项目</h3>
              <p className="theme-text-muted">从左侧项目列表中选择一个项目来查看详细信息</p>
            </div>
          </div>
        ) : (
          <>
            {/* 标签页导航 */}
            <div className="border-b theme-border px-6 py-4">
              <div className="flex space-x-6">
                <button
                  onClick={() => setActiveProjectTab('overview')}
                  className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                    activeProjectTab === 'overview'
                      ? 'theme-text-primary border-blue-400'
                      : 'theme-text-muted border-transparent hover:theme-text-primary'
                  }`}
                >
                  *项目概览
                </button>
                <button
                  onClick={() => setActiveProjectTab('config')}
                  className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                    activeProjectTab === 'config'
                      ? 'theme-text-primary border-blue-400'
                      : 'theme-text-muted border-transparent hover:theme-text-primary'
                  }`}
                >
                  项目配置
                </button>
                <button
                  onClick={() => setActiveProjectTab('dependencies')}
                  className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                    activeProjectTab === 'dependencies'
                      ? 'theme-text-primary border-blue-400'
                      : 'theme-text-muted border-transparent hover:theme-text-primary'
                  }`}
                >
                  依赖管理
                </button>
                <button
                  onClick={() => setActiveProjectTab('logs')}
                  className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                    activeProjectTab === 'logs'
                      ? 'theme-text-primary border-blue-400'
                      : 'theme-text-muted border-transparent hover:theme-text-primary'
                  }`}
                >
                  日志查看
                </button>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 p-6">
              {activeProjectTab === 'overview' && (
                <div className="grid grid-cols-2 gap-6 h-full">
                  {/* 左侧：基本信息 */}
                  <div className="space-y-4">
                    <div className="theme-bg-secondary p-4 rounded-lg">
                      <h4 className="font-semibold theme-text-primary mb-3">基本信息</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="theme-text-muted">项目名称:</span>
                          <span className="theme-text-primary">{selectedProject.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="theme-text-muted">项目类型:</span>
                          <span className="theme-text-primary">{selectedProject.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="theme-text-muted">项目路径:</span>
                          <span className="theme-text-primary text-xs">{selectedProject.path}</span>
                        </div>
                      </div>
                    </div>

                    {/* 快速打开面板 */}
                    <div className="theme-bg-secondary p-4 rounded-lg">
                      <h4 className="font-semibold theme-text-primary mb-3">快速打开面板</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="btn-secondary px-3 py-2 rounded text-xs">
                          在VS Code中打开
                        </button>
                        <button className="btn-secondary px-3 py-2 rounded text-xs">
                          在文件管理器中打开
                        </button>
                        <button className="btn-secondary px-3 py-2 rounded text-xs">
                          在终端中打开
                        </button>
                        <button className="btn-secondary px-3 py-2 rounded text-xs">
                          在浏览器中打开
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 右侧：性能监控信息 */}
                  <div className="theme-bg-secondary p-4 rounded-lg">
                    <h4 className="font-semibold theme-text-primary mb-3">性能监控信息</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="theme-text-muted">运行状态:</span>
                        {pm2Status ? (
                          <span className={`px-2 py-1 rounded text-xs ${
                            (pm2Status.status === 'online' || pm2Status.pm2_env?.status === 'online') 
                              ? 'btn-success' 
                              : 'btn-secondary'
                          }`}>
                            {(pm2Status.status === 'online' || pm2Status.pm2_env?.status === 'online') ? '🟢 运行中' : 
                             (pm2Status.status === 'stopped' || pm2Status.pm2_env?.status === 'stopped') ? '⚪ 已停止' : 
                             (pm2Status.status === 'error' || pm2Status.pm2_env?.status === 'error') ? '🔴 错误' :
                             (pm2Status.status === 'launching' || pm2Status.pm2_env?.status === 'launching') ? '🟡 启动中' :
                             (pm2Status.status === 'stopping' || pm2Status.pm2_env?.status === 'stopping') ? '🟠 停止中' : '🔴 未知状态'}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300">
                            ⚫ 未运行
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between">
                        <span className="theme-text-muted">CPU使用率:</span>
                        <span className="theme-text-primary">{pm2Status?.monit?.cpu ? `${pm2Status.monit.cpu}%` : '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="theme-text-muted">内存使用:</span>
                        <span className="theme-text-primary">{pm2Status?.monit?.memory ? `${(pm2Status.monit.memory / 1024 / 1024).toFixed(1)}MB` : '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="theme-text-muted">进程PID:</span>
                        <span className="theme-text-primary">{pm2Status?.pid || '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="theme-text-muted">运行时间:</span>
                        <span className="theme-text-primary">{pm2Status?.pm2_env?.pm_uptime ? new Date(pm2Status.pm2_env.pm_uptime).toLocaleString() : '--'}</span>
                      </div>
                    </div>
                    
                    {/* 控制按钮 */}
                    <div className="mt-4 pt-3 border-t theme-border">
                      <div className="flex gap-3">
                        {pm2Status && (pm2Status.status === 'online' || pm2Status.pm2_env?.status === 'online') ? (
                          <>
                            <button
                              onClick={handleStopProject}
                              className="btn-remove px-4 py-2 rounded-lg text-sm transition-colors"
                              disabled={isLoadingPM2}
                            >
                              停止
                            </button>
                            <button
                              onClick={handleRestartProject}
                              className="btn-primary px-4 py-2 rounded-lg text-sm transition-colors"
                              disabled={isLoadingPM2}
                            >
                              重启
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={handleStartProject}
                            className="btn-success px-4 py-2 rounded-lg text-sm transition-colors"
                            disabled={isLoadingPM2}
                          >
                            启动
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 其他标签页内容保持原样 */}
              {activeProjectTab !== 'overview' && renderProjectDetails()}
            </div>
          </>
        )}
        </div>
      </div>

      {/* 创建项目模态框 */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleCreateConfirm}
      />

      {/* 项目设置模态框 */}
      {selectedProject && (
        <ProjectSettingsModal
          isOpen={showSettingsModal}
          onClose={handleCloseSettings}
          project={selectedProject}
          onUpdate={(updatedProject) => {
            console.log('Project updated:', updatedProject);
          }}
        />
      )}
    </div>
  );
}
