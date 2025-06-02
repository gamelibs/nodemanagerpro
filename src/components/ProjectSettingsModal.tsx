import { useState, useEffect } from 'react';
import type { Project } from '../types';
import { RendererFileSystemService } from '../services/RendererFileSystemService';
import { useProjects } from '../hooks/useProjects';

// 从PM2Service复制的进程名称生成逻辑
function generateStableProjectId(projectName: string, projectPath: string): string {
  // 组合名称和路径，使用分隔符确保不会混淆
  const combined = `${projectName}|${projectPath}`;
  
  // 使用哈希来确保唯一性，而不是简单去除字符
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  // 确保哈希为正数
  const positiveHash = Math.abs(hash);
  
  // 转换为Base36字符串（包含数字和字母）
  const hashString = positiveHash.toString(36);
  
  // 结合项目名的前几个字符（清理后）+ 哈希
  const cleanName = projectName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6);
  const stableId = `${cleanName}${hashString}`.substring(0, 16);
  
  // 确保至少有8个字符，不足的用哈希补充
  if (stableId.length < 8) {
    return (stableId + hashString + '00000000').substring(0, 16);
  }
  
  return stableId;
}

interface ProjectSettingsModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedProject: Project) => void;
}

interface PackageInfo {
  dependencies: Record<string, { version: string; installed: boolean }>;
  devDependencies: Record<string, { version: string; installed: boolean }>;
  scripts: Record<string, string>;
  error?: string;
  errorType?: string;
}

interface PM2ProcessData {
  name: string;
  pid: number;
  status: string;
  cpu: number;
  memory: number;
  uptime: number;
  restarts: number;
}

const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'dependencies' | 'performance'>('dependencies');
  const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [installing, setInstalling] = useState(false);
  const [pm2Data, setPM2Data] = useState<PM2ProcessData | null>(null);
  const [startingProject, setStartingProject] = useState(false);
  const [stoppingProject, setStoppingProject] = useState(false);
  
  // Import project management functions
  const { startProject, stopProject, synchronizeProjectStatuses } = useProjects();

  // Load package info when dependencies tab is opened
  useEffect(() => {
    if (isOpen && activeTab === 'dependencies') {
      loadPackageInfo();
    }
  }, [isOpen, activeTab, project.path]);

  // Load PM2 data when performance tab is opened
  useEffect(() => {
    if (isOpen && activeTab === 'performance') {
      loadPM2Data();
    }
  }, [isOpen, activeTab, project.id]);

  const loadPackageInfo = async () => {
    try {
      const result = await RendererFileSystemService.getProjectPackageInfo(project.path);
      if (result.success) {
        setPackageInfo(result.data);
      } else {
        setPackageInfo({
          dependencies: {},
          devDependencies: {},
          scripts: {},
          error: result.error
        });
      }
    } catch (error) {
      console.error('Failed to load package info:', error);
      setPackageInfo({
        dependencies: {},
        devDependencies: {},
        scripts: {},
        error: '加载失败'
      });
    }
  };

  const loadPM2Data = async () => {
    try {
      if (window.electronAPI) {
        // 使用与PM2Service相同的进程名称生成逻辑
        const processName = generateStableProjectId(project.name, project.path);
        const result = await window.electronAPI.invoke('pm2:describe', processName);
        if (result.success && result.data) {
          setPM2Data(result.data);
        } else {
          setPM2Data(null);
        }
      }
    } catch (error) {
      console.error('Failed to load PM2 data:', error);
      setPM2Data(null);
    }
  };

  const handleSelectAll = () => {
    if (!packageInfo) return;
    
    const uninstalledPackages: string[] = [];
    
    // Add uninstalled dependencies
    if (packageInfo.dependencies) {
      Object.entries(packageInfo.dependencies).forEach(([pkg, info]) => {
        if (!info.installed) {
          uninstalledPackages.push(pkg);
        }
      });
    }
    
    // Add uninstalled devDependencies
    if (packageInfo.devDependencies) {
      Object.entries(packageInfo.devDependencies).forEach(([pkg, info]) => {
        if (!info.installed) {
          uninstalledPackages.push(pkg);
        }
      });
    }
    
    setSelectedPackages(uninstalledPackages);
  };

  const handleClearSelection = () => {
    setSelectedPackages([]);
  };

  const handlePackageToggle = (packageName: string) => {
    setSelectedPackages(prev => 
      prev.includes(packageName)
        ? prev.filter(p => p !== packageName)
        : [...prev, packageName]
    );
  };

  const handleInstallSelected = async () => {
    if (selectedPackages.length === 0) return;

    setInstalling(true);
    try {
      if (window.electronAPI) {
        await window.electronAPI.invoke('logger:log', 'INFO', `开始安装选中的依赖包: ${selectedPackages.join(', ')}`);
      }
      
      const result = await RendererFileSystemService.installSpecificPackages(
        project.path,
        selectedPackages
      );

      if (result.success) {
        if (window.electronAPI) {
          await window.electronAPI.invoke('logger:log', 'SUCCESS', '依赖包安装完成');
        }
        await loadPackageInfo();
        setSelectedPackages([]);
      } else {
        if (window.electronAPI) {
          await window.electronAPI.invoke('logger:log', 'ERROR', `安装失败: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Installation failed:', error);
      if (window.electronAPI) {
        await window.electronAPI.invoke('logger:log', 'ERROR', `安装出错: ${error}`);
      }
    } finally {
      setInstalling(false);
    }
  };

  const handleRestartProject = async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.invoke('logger:log', 'INFO', `重启项目: ${project.name}`);
        const result = await window.electronAPI.invoke('pm2:restart', project.id);
        if (result.success) {
          await window.electronAPI.invoke('logger:log', 'SUCCESS', '项目重启成功');
          await loadPM2Data(); // 重新加载数据
        } else {
          await window.electronAPI.invoke('logger:log', 'ERROR', `重启失败: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Failed to restart project:', error);
      if (window.electronAPI) {
        await window.electronAPI.invoke('logger:log', 'ERROR', `重启出错: ${error}`);
      }
    }
  };

  const handleCreatePackageJson = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.invoke('project:createPackageJson', project.path, project.name);
        if (result.success) {
          await window.electronAPI.invoke('logger:log', 'SUCCESS', 'package.json 创建成功');
          await loadPackageInfo();
        } else {
          await window.electronAPI.invoke('logger:log', 'ERROR', `创建失败: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Failed to create package.json:', error);
      if (window.electronAPI) {
        await window.electronAPI.invoke('logger:log', 'ERROR', `创建出错: ${error}`);
      }
    }
  };

  const handleStartProject = async () => {
    setStartingProject(true);
    try {
      await startProject(project);
      await loadPM2Data(); // 重新加载数据
      await synchronizeProjectStatuses(); // 同步状态
    } catch (error) {
      console.error('Failed to start project:', error);
    } finally {
      setStartingProject(false);
    }
  };

  const handleStopProject = async () => {
    setStoppingProject(true);
    try {
      await stopProject(project.id);
      await loadPM2Data(); // 重新加载数据
      await synchronizeProjectStatuses(); // 同步状态
    } catch (error) {
      console.error('Failed to stop project:', error);
    } finally {
      setStoppingProject(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (uptime: number) => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">项目设置 - {project.name}</h2>
        </div>

        {/* Tab Navigation */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'dependencies', label: '依赖管理' },
              { id: 'performance', label: '性能监控' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'dependencies' | 'performance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'dependencies' && (
            <div className="space-y-6">
              {packageInfo?.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {packageInfo.errorType === 'missing-package-json' ? '缺少 package.json 文件' : '加载依赖信息失败'}
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{packageInfo.error}</p>
                        {packageInfo.errorType === 'missing-package-json' && (
                          <div className="mt-3">
                            <button
                              onClick={handleCreatePackageJson}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                              创建 package.json
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : packageInfo ? (
                <>
                  {/* 选择操作按钮 */}
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSelectAll}
                        className="text-sm bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700"
                      >
                        全选未安装
                      </button>
                      <button
                        onClick={handleClearSelection}
                        className="text-sm bg-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-400"
                      >
                        清空选择
                      </button>
                    </div>
                    <button
                      onClick={handleInstallSelected}
                      disabled={selectedPackages.length === 0 || installing}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {installing ? '安装中...' : `安装选中的包 (${selectedPackages.length})`}
                    </button>
                  </div>

                  {/* Dependencies Section */}
                  {packageInfo.dependencies && Object.keys(packageInfo.dependencies).length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">生产依赖</h3>
                      <div className="space-y-2">
                        {Object.entries(packageInfo.dependencies).map(([pkg, info]) => (
                          <div key={pkg} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={selectedPackages.includes(pkg)}
                                onChange={() => handlePackageToggle(pkg)}
                                disabled={info.installed}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                              />
                              <div>
                                <span className="font-medium text-gray-900">{pkg}</span>
                                <span className="text-gray-500 ml-2">@{info.version}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">生产</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                info.installed 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {info.installed ? '已安装' : '未安装'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* DevDependencies Section */}
                  {packageInfo.devDependencies && Object.keys(packageInfo.devDependencies).length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">开发依赖</h3>
                      <div className="space-y-2">
                        {Object.entries(packageInfo.devDependencies).map(([pkg, info]) => (
                          <div key={pkg} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={selectedPackages.includes(pkg)}
                                onChange={() => handlePackageToggle(pkg)}
                                disabled={info.installed}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                              />
                              <div>
                                <span className="font-medium text-gray-900">{pkg}</span>
                                <span className="text-gray-500 ml-2">@{info.version}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">开发</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                info.installed 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {info.installed ? '已安装' : '未安装'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 如果没有依赖 */}
                  {(!packageInfo.dependencies || Object.keys(packageInfo.dependencies).length === 0) && 
                   (!packageInfo.devDependencies || Object.keys(packageInfo.devDependencies).length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <p>未找到依赖包信息</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">加载中...</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">项目控制</h3>
                <div className="flex space-x-2">
                  {/* Project Control Buttons */}
                  {project.status === 'running' ? (
                    <button
                      onClick={handleStopProject}
                      disabled={stoppingProject}
                      className="text-sm bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      {stoppingProject ? (
                        <>
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>停止中...</span>
                        </>
                      ) : (
                        <>
                          <span>⏹️</span>
                          <span>停止项目</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleStartProject}
                      disabled={startingProject}
                      className="text-sm bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      {startingProject ? (
                        <>
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>启动中...</span>
                        </>
                      ) : (
                        <>
                          <span>▶️</span>
                          <span>启动项目</span>
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={loadPM2Data}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                  >
                    刷新
                  </button>
                  <button
                    onClick={handleRestartProject}
                    className="text-sm bg-orange-600 text-white px-3 py-1 rounded-md hover:bg-orange-700"
                  >
                    重启项目
                  </button>
                </div>
              </div>

              {/* Process Monitoring Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">📊</span>
                  进程监控
                </h4>

                {pm2Data ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">基本信息</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">进程名称:</span>
                        <span className="font-medium">{pm2Data.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">进程ID:</span>
                        <span className="font-medium">{pm2Data.pid || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">状态:</span>
                        <span className={`font-medium ${
                          pm2Data.status === 'online' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {pm2Data.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">重启次数:</span>
                        <span className="font-medium">{pm2Data.restarts}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">性能指标</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">CPU 使用率:</span>
                        <span className="font-medium">{pm2Data.cpu.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">内存使用:</span>
                        <span className="font-medium">{formatBytes(pm2Data.memory)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">运行时间:</span>
                        <span className="font-medium">{formatUptime(pm2Data.uptime)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        项目未运行
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>当前项目不在PM2管理中或未启动。请先启动项目后查看性能监控数据。</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettingsModal;
