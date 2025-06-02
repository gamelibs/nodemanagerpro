import { useState } from 'react';
import { useToastContext } from '../../store/ToastContext';
import type { Project } from '../../types';
import type { PM2Process } from '../../services/PM2Service';

interface ProjectDetailsProps {
  project: Project;
  packageInfo: any;
  isLoadingPackage: boolean;
  pm2Status: PM2Process | null;
  isLoadingPM2: boolean;
  projectPort: number | null;
  dependencyStatus: {[key: string]: boolean};
  isCheckingDependencies: boolean;
  isInstallingDependencies: boolean;
  pm2Logs: string[];
  isLoadingLogs: boolean;
  onOpenInEditor: () => void;
  onOpenInFolder: () => void;
  onOpenInBrowser: () => void;
  onPortEdit: (port: number) => void;
  onInstallDependencies: () => void;
  onInstallSingleDependency: (packageName: string) => void;
  onStartProject: () => void;
  onStopProject: () => void;
  onRestartProject: () => void;
  onRefreshLogs: () => void;
}

export function ProjectDetails({
  project,
  packageInfo,
  isLoadingPackage,
  pm2Status,
  isLoadingPM2,
  projectPort,
  dependencyStatus,
  isCheckingDependencies,
  isInstallingDependencies,
  pm2Logs,
  isLoadingLogs,
  onOpenInEditor,
  onOpenInFolder,
  onOpenInBrowser,
  onPortEdit,
  onInstallDependencies,
  onInstallSingleDependency,
  onStartProject,
  onStopProject,
  onRestartProject,
  onRefreshLogs,
}: ProjectDetailsProps) {
  // 端口编辑状态
  const [isEditingPort, setIsEditingPort] = useState(false);
  const [tempPort, setTempPort] = useState<string>('');

  // 使用全局 Toast 系统
  const { showToast } = useToastContext();

  // 检查项目是否可以启动
  const canStartProject = () => {
    // 没有 package.json 文件无法启动
    if (!packageInfo) {
      return false;
    }
    // 已经在运行中无法启动
    if (pm2Status && (pm2Status.status === 'online' || pm2Status.pm2_env?.status === 'online')) {
      return false;
    }
    // 有未安装的依赖包无法启动
    if (hasUninstalledDependencies()) {
      return false;
    }
    return true;
  };

  // 获取启动按钮的状态文本
  const getStartButtonText = () => {
    if (isLoadingPM2) {
      return '启动中...';
    }
    if (!packageInfo) {
      return '无法启动';
    }
    if (pm2Status && (pm2Status.status === 'online' || pm2Status.pm2_env?.status === 'online')) {
      return '运行中';
    }
    if (hasUninstalledDependencies()) {
      return '依赖未安装';
    }
    return '启动';
  };

  // 获取启动按钮的提示文本
  const getStartButtonTitle = () => {
    if (pm2Status && (pm2Status.status === 'online' || pm2Status.pm2_env?.status === 'online')) {
      return '项目正在运行中，请先停止项目再启动';
    }
    if (!packageInfo) {
      return '缺少 package.json 文件，无法启动项目';
    }
    if (hasUninstalledDependencies()) {
      return '存在未安装的必要依赖包，无法启动项目';
    }
    return '启动项目';
  };

  // 检查是否有关键依赖包未安装
  const hasUninstalledDependencies = () => {
    if (!packageInfo || !packageInfo.dependencies) {
      return false;
    }
    
    // 如果还在检查依赖状态，返回 false（不禁用）
    if (isCheckingDependencies) {
      return false;
    }
    
    // 如果依赖状态还没检查完，返回 false
    if (Object.keys(dependencyStatus).length === 0) {
      return false;
    }
    
    // 检查生产依赖是否有未安装的包
    const productionDeps = Object.keys(packageInfo.dependencies);
    const hasUninstalled = productionDeps.some(dep => dependencyStatus[dep] === false);
    return hasUninstalled;
  };

  // 处理端口编辑
  const handlePortEditStart = () => {
    setIsEditingPort(true);
    setTempPort((projectPort || project?.port || '').toString());
  };

  const handlePortSave = async () => {
    const newPort = parseInt(tempPort);
    if (isNaN(newPort) || newPort < 1 || newPort > 65535) {
      showToast('端口号无效，请输入 1-65535 之间的数字', 'error');
      return;
    }
    
    onPortEdit(newPort);
    setIsEditingPort(false);
    showToast('端口设置已保存到项目配置文件', 'success');
  };

  const handlePortCancel = () => {
    setIsEditingPort(false);
    setTempPort('');
  };

  return (
    <div className="space-y-4">
      {/* 两栏布局：基本信息和运行状态 */}
      <div className="grid grid-cols-2 gap-4">
      {/* 基本信息 */}
      <div className="theme-bg-secondary p-3 rounded-lg">
        <h4 className="font-semibold theme-text-primary mb-2">基本信息</h4>
        <div className="space-y-2 text-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="theme-text-muted">项目描述:</span>
              <button
                onClick={onOpenInEditor}
                className="text-blue-600 hover:text-blue-800 text-xs opacity-70 hover:opacity-100 flex items-center gap-1"
                title="在编辑器中打开项目"
              >
                ✏️ 编辑器
              </button>
            </div>
            <span className="theme-text-primary">
              {isLoadingPackage ? '读取中...' : (packageInfo?.description || '暂无描述')}
            </span>
          </div>
          
          {/* 项目详细信息 */}
          <div className="mt-3 pt-2 border-t theme-border">
            <div className="font-medium theme-text-primary mb-1 text-xs">项目详情:</div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="theme-text-muted text-xs">项目路径:</span>
                <div className="flex items-center gap-1">
                  <span className="theme-text-primary text-xs max-w-32 truncate" title={project.path}>
                    {project.path}
                  </span>
                  <button
                    onClick={onOpenInFolder}
                    className="text-blue-600 hover:text-blue-800 text-xs opacity-70 hover:opacity-100"
                    title="在文件夹中打开"
                  >
                    📂
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="theme-text-muted text-xs">项目类型:</span>
                <span className="theme-text-primary text-xs">{project.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="theme-text-muted text-xs">包管理器:</span>
                <span className="theme-text-primary text-xs">{project.packageManager}</span>
              </div>
              {isLoadingPackage ? (
                <div className="flex items-center justify-center py-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-xs theme-text-muted">读取包信息...</span>
                </div>
              ) : packageInfo ? (
                <>
                  {packageInfo.version && (
                    <div className="flex justify-between">
                      <span className="theme-text-muted text-xs">项目版本:</span>
                      <span className="theme-text-primary text-xs">{packageInfo.version}</span>
                    </div>
                  )}
                  {packageInfo.main && (
                    <div className="flex justify-between">
                      <span className="theme-text-muted text-xs">入口文件:</span>
                      <span className="theme-text-primary text-xs">{packageInfo.main}</span>
                    </div>
                  )}
                  
                  {/* 端口编辑功能 */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="theme-text-muted text-xs">项目地址:</span>
                      {(projectPort || project?.port) ? (
                        <>
                          <a
                            href={`http://localhost:${projectPort || project?.port}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.preventDefault();
                              onOpenInBrowser();
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
                            title="在浏览器中打开"
                          >
                            http://localhost:{projectPort || project?.port}
                          </a>
                          <button
                            onClick={onOpenInBrowser}
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="在浏览器中打开"
                          >
                            🌐
                          </button>
                        </>
                      ) : (
                        <span className="text-xs theme-text-muted italic flex items-center gap-1">
                          ⏳ 端口检测中
                        </span>
                      )}
                    </div>
                    {isEditingPort ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={tempPort}
                          onChange={(e) => setTempPort(e.target.value)}
                          className="w-16 px-1 py-0.5 text-xs border rounded theme-bg-primary theme-text-primary theme-border focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          min="1"
                          max="65535"
                          autoFocus
                        />
                        <button
                          onClick={handlePortSave}
                          className="text-green-600 hover:text-green-800 text-xs"
                          title="保存端口"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handlePortCancel}
                          className="text-red-600 hover:text-red-800 text-xs"
                          title="取消"
                        >
                          ✗
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="theme-text-muted text-xs">端口:</span>
                        <span className="theme-text-primary text-xs">
                          {projectPort || project?.port || (
                            <span className="theme-text-muted italic">检测中</span>
                          )}
                        </span>
                        <button
                          onClick={handlePortEditStart}
                          className="text-blue-600 hover:text-blue-800 text-xs opacity-70 hover:opacity-100"
                          title="编辑端口（将修改项目配置文件）"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs theme-text-muted italic">
                    未找到 package.json 文件
                  </div>
                  
                  {/* 非Node.js项目警告 */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded px-2 py-1">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-600">⚠</span>
                      <span className="text-xs text-amber-700 dark:text-amber-300">
                        此项目缺少 package.json 配置文件，可能不是 Node.js 项目或配置不完整
                      </span>
                    </div>
                    <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      PM2 无法启动没有 package.json 的项目
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          

        </div>
      </div>
      
      {/* 运行状态 */}
      <div className="theme-bg-secondary p-3 rounded-lg">
        <h4 className="font-semibold theme-text-primary mb-2">运行状态</h4>
        {isLoadingPM2 ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm theme-text-muted">获取状态中...</span>
          </div>
        ) : (
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
                   (pm2Status.status === 'error' || pm2Status.status === 'errored' || pm2Status.pm2_env?.status === 'error' || pm2Status.pm2_env?.status === 'errored') ? '🔴 错误' :
                   (pm2Status.status === 'launching' || pm2Status.pm2_env?.status === 'launching') ? '🟡 启动中' :
                   (pm2Status.status === 'stopping' || pm2Status.pm2_env?.status === 'stopping') ? '🟠 停止中' : '🔴 错误'}
                </span>
              ) : project?.status ? (
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  project.status === 'running'
                    ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300'
                    : project.status === 'stopped'
                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300'
                }`}>
                  {project.status === 'running' ? '🟢 运行中' : 
                   project.status === 'stopped' ? '⚪ 已停止' : 
                   '🔴 错误'}
                </span>
              ) : (
                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300 flex items-center gap-1">
                  <span className="animate-pulse">⏳</span> 状态检测中
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
                {new Date(project.lastOpened).toLocaleString()}
              </span>
            </div>
          </div>
        )}
        
        {/* 项目控制按钮 */}
        <div className="space-y-2 pt-2 border-t theme-border">
          {/* 主要控制按钮 */}
          <div className="flex space-x-2">
            {(pm2Status?.status === 'online' || pm2Status?.pm2_env?.status === 'online') ? (
              <>
                <button 
                  onClick={onStopProject}
                  className="flex-1 px-3 py-2 btn-remove rounded-lg text-sm"
                  disabled={isLoadingPM2}
                >
                  {isLoadingPM2 ? '停止中...' : '停止'}
                </button>
                <button 
                  onClick={onRestartProject}
                  className="flex-1 px-3 py-2 btn-warning rounded-lg text-sm"
                  disabled={isLoadingPM2}
                >
                  {isLoadingPM2 ? '重启中...' : '重启'}
                </button>
              </>
            ) : (
              <button 
                onClick={onStartProject}
                className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                  !canStartProject() 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'btn-success'
                }`}
                disabled={isLoadingPM2 || !canStartProject()}
                title={getStartButtonTitle()}
              >
                {getStartButtonText()}
              </button>
            )}
          </div>
        </div>
      </div>
      </div>
      
      {/* 依赖包信息 - 独立在两栏下面，与日志并列 */}
      {packageInfo && (packageInfo.dependencies || packageInfo.devDependencies) && (
        <div className="theme-bg-secondary p-4 rounded-lg">
          <h4 className="font-semibold theme-text-primary mb-3">依赖包信息</h4>
          
          {/* 依赖缺失警告和安装按钮 */}
          {hasUninstalledDependencies() && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded px-3 py-2 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-orange-600">⚠</span>
                  <span className="text-sm text-orange-700 dark:text-orange-300">
                    检测到未安装的依赖包，项目可能无法正常启动
                  </span>
                </div>
                <button
                  onClick={onInstallDependencies}
                  disabled={isInstallingDependencies}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${
                    isInstallingDependencies
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-800/20 dark:text-blue-300 dark:hover:bg-blue-800/40'
                  }`}
                  title={`使用 ${project?.packageManager || 'npm'} 安装依赖`}
                >
                  {isInstallingDependencies ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                      安装中...
                    </div>
                  ) : (
                    '📦 安装依赖'
                  )}
                </button>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            {/* 所有依赖包列表 */}
            <div className="flex flex-wrap gap-2">
              {(() => {
                // 合并所有依赖包（生产依赖 + 开发依赖）
                const allDependencies = {
                  ...packageInfo.dependencies,
                  ...packageInfo.devDependencies
                };
                
                return Object.entries(allDependencies).map(([pkg, version]) => {
                  const isInstalled = dependencyStatus[pkg];
                  const statusIcon = isCheckingDependencies ? '?' : (isInstalled ? '✓' : '✗');
                  const statusColor = isCheckingDependencies ? 'text-gray-500' : (isInstalled ? 'text-green-600' : 'text-red-600');
                  
                  return (
                    <div 
                      key={pkg} 
                      className={`px-2 py-1 bg-blue-100 dark:bg-blue-800/20 text-blue-800 dark:text-blue-300 text-xs rounded flex items-center gap-1.5 ${
                        !isInstalled && !isCheckingDependencies ? 'opacity-60' : ''
                      }`}
                      title={`${pkg}@${(version as string).replace('^', '').replace('~', '')} - ${isCheckingDependencies ? '检查中...' : (isInstalled ? '已安装' : '未安装')}`}
                    >
                      <span>{pkg}@{(version as string).replace('^', '').replace('~', '')}</span>
                      <span className={`text-xs ${statusColor}`}>{statusIcon}</span>
                      {/* 只为未安装的依赖包显示安装按钮 */}
                      {!isInstalled && !isCheckingDependencies && (
                        <button
                          onClick={() => onInstallSingleDependency(pkg)}
                          disabled={isInstallingDependencies}
                          className={`ml-1 px-1.5 py-0.5 text-xs rounded transition-colors ${
                            isInstallingDependencies
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                          title={`安装 ${pkg}`}
                        >
                          {isInstallingDependencies ? '...' : '安装'}
                        </button>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
      
      {/* PM2日志 - 独立在两栏下面 */}
      <div className="theme-bg-secondary p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold theme-text-primary">最近日志</h4>
          <button 
            onClick={onRefreshLogs}
            className="text-xs px-2 py-1 btn-info rounded"
            disabled={isLoadingLogs}
          >
            {isLoadingLogs ? '刷新中...' : '刷新'}
          </button>
        </div>
        
        {isLoadingLogs ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-xs theme-text-muted">加载日志中...</span>
          </div>
        ) : pm2Logs.length > 0 ? (
          <div className="bg-black text-green-400 p-3 rounded text-xs font-mono max-h-64 overflow-y-auto">
            {pm2Logs.map((log, index) => (
              <div key={index} className="mb-1 leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs theme-text-muted text-center">
            暂无日志数据
            {pm2Status && (pm2Status.status === 'errored' || pm2Status.pm2_env?.status === 'errored') && (
              <div className="mt-2 text-red-500">
                进程状态为 "errored"，请检查项目依赖和配置
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
