import React, { useState, useEffect } from 'react';
import { useToastContext } from '../../store/ToastContext';
import type { Project } from '../../types';

interface StartupConfigProps {
  project: Project;
  packageInfo: any;
  isLoadingPackage: boolean;
  onConfigUpdate?: () => void;
}

interface StartupConfigData {
  startScript: string;
  startFile: string;
  startCommand: string;
  hasConfig: boolean;
}

// 处理缺少 package.json 的情况
const MissingPackageJsonHandler: React.FC<{
  project: Project;
  onConfigUpdate?: () => void;
}> = ({ project, onConfigUpdate }) => {
  const { showToast } = useToastContext();
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [startFile, setStartFile] = useState('index.js');
  const [startCommand, setStartCommand] = useState('');

  // 根据项目类型建议默认配置
  const getDefaultConfig = () => {
    const packageManager = project.packageManager || 'npm';
    
    if (project.projectType === 'express' || project.projectType === 'node-backend') {
      return {
        startFile: 'server.js',
        startCommand: `node server.js`  // Express 项目优先使用 node 直接启动
      };
    } else if (project.projectType === 'react') {
      return {
        startFile: 'src/index.js',
        startCommand: `${packageManager} start`
      };
    } else if (project.projectType === 'vue') {
      return {
        startFile: 'src/main.js',
        startCommand: `${packageManager} run dev`
      };
    } else if (project.projectType === 'nextjs') {
      return {
        startFile: 'pages/index.js',
        startCommand: `${packageManager} run dev`
      };
    } else if (project.projectType === 'vite') {
      return {
        startFile: 'src/main.js',
        startCommand: `${packageManager} run dev`
      };
    }
    
    // 通用 Node.js 项目：优先使用 node 直接启动
    return {
      startFile: 'index.js',
      startCommand: `node index.js`
    };
  };

  useEffect(() => {
    const defaultConfig = getDefaultConfig();
    setStartFile(defaultConfig.startFile);
    setStartCommand(defaultConfig.startCommand);
  }, [project.projectType]);

  const createPackageJson = async () => {
    setIsCreating(true);
    try {
      // 创建基础的 package.json
      const packageJson = {
        name: project.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        version: '1.0.0',
        description: project.description || `${project.name} project`,
        main: startFile,
        scripts: {
          start: startCommand,
          dev: startCommand,
          test: 'echo "Error: no test specified" && exit 1'
        },
        keywords: [],
        author: '',
        license: 'ISC',
        engines: {
          node: '>=14.0.0'
        }
      };

      // 调用IPC创建 package.json
      const result = await window.electronAPI?.invoke('project:createPackageJson', project.path, packageJson);
      
      if (result?.success) {
        showToast('package.json 文件已创建', 'success');
        setShowCreateForm(false);
        // 通知父组件配置已更新，重新加载 package 信息
        onConfigUpdate?.();
      } else {
        showToast(result?.error || '创建 package.json 失败', 'error');
      }
    } catch (error) {
      console.error('创建 package.json 失败:', error);
      showToast('创建 package.json 失败', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="theme-bg-secondary p-4 rounded-lg border-l-4 border-orange-400">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-orange-600">⚠</span>
        <h4 className="font-semibold theme-text-primary">启动配置</h4>
      </div>
      
      <p className="text-sm theme-text-muted mb-3">
        未找到 package.json 文件，无法配置启动参数。
      </p>

      {!showCreateForm ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
          >
            📦 生成默认 package.json
          </button>
          <span className="text-xs theme-text-muted">
            或手动创建一个有效的 Node.js 项目配置
          </span>
        </div>
      ) : (
        <div className="space-y-3 border-t pt-3">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium theme-text-primary">创建 package.json 配置</h5>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-primary mb-1">
              启动文件 (main)
            </label>
            <input
              type="text"
              value={startFile}
              onChange={(e) => setStartFile(e.target.value)}
              placeholder="例如: index.js, server.js, src/index.js"
              className="w-full px-3 py-2 text-sm border rounded theme-bg-primary theme-text-primary theme-border focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs theme-text-muted mt-1">
              项目的主要入口文件
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-primary mb-1">
              启动命令 (start script)
            </label>
            <input
              type="text"
              value={startCommand}
              onChange={(e) => setStartCommand(e.target.value)}
              placeholder="例如: node index.js, npm start"
              className="w-full px-3 py-2 text-sm border rounded theme-bg-primary theme-text-primary theme-border focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs theme-text-muted mt-1">
              启动项目的命令
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="text-xs font-medium text-blue-700 mb-1">将要创建的配置预览:</div>
            <div className="text-xs theme-text-muted space-y-1">
              <div>• 项目名称: {project.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}</div>
              <div>• 启动文件: {startFile}</div>
              <div>• 启动命令: {startCommand}</div>
              <div>• 项目类型: {project.projectType || 'node'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={createPackageJson}
              disabled={isCreating || !startFile.trim() || !startCommand.trim()}
              className="px-3 py-2 text-sm bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded transition-colors"
            >
              {isCreating ? '创建中...' : '✅ 创建 package.json'}
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              disabled={isCreating}
              className="px-3 py-2 text-sm bg-gray-300 text-gray-700 hover:bg-gray-400 rounded transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const StartupConfig: React.FC<StartupConfigProps> = ({
  project,
  packageInfo,
  isLoadingPackage,
  onConfigUpdate
}) => {
  const { showToast } = useToastContext();
  
  // 配置状态
  const [config, setConfig] = useState<StartupConfigData>({
    startScript: '',
    startFile: '',
    startCommand: '',
    hasConfig: false
  });
  
  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [tempConfig, setTempConfig] = useState<StartupConfigData>({
    startScript: '',
    startFile: '',
    startCommand: '',
    hasConfig: false
  });
  
  // 保存状态
  const [isSaving, setIsSaving] = useState(false);

  // 从package.json加载当前配置
  useEffect(() => {
    if (packageInfo && !isLoadingPackage) {
      const hasStartScript = !!packageInfo.scripts?.start;
      const mainFile = packageInfo.main || '';
      const startCommand = packageInfo.scripts?.start || '';
      
      const configData = {
        startScript: hasStartScript ? 'start' : '',
        startFile: mainFile,
        startCommand: startCommand,
        hasConfig: hasStartScript || !!mainFile
      };
      
      setConfig(configData);
      setTempConfig(configData);
    }
  }, [packageInfo, isLoadingPackage]);

  // 检测可能的启动文件
  const detectPossibleStartFiles = (): string[] => {
    // Node.js 项目常见的启动文件
    const commonNodeFiles = [
      'index.js',      // 最常见的入口文件
      'app.js',        // Express 应用常用
      'server.js',     // 服务器应用常用
      'main.js',       // 通用主文件
      'start.js',      // 专门的启动文件
    ];
    
    // 源码目录中的文件
    const srcFiles = [
      'src/index.js',
      'src/app.js', 
      'src/server.js',
      'src/main.js',
    ];
    
    // TypeScript 文件
    const tsFiles = [
      'index.ts',
      'app.ts',
      'server.ts',
      'main.ts',
      'src/index.ts',
      'src/app.ts',
      'src/server.ts',
      'src/main.ts',
    ];
    
    // 根据项目类型调整建议顺序
    if (project.projectType === 'express' || project.projectType === 'node-backend') {
      return ['server.js', 'app.js', 'index.js', 'src/server.js', 'src/app.js', 'src/index.js', ...tsFiles];
    } else if (project.projectType === 'react') {
      return ['src/index.js', 'index.js', 'src/app.js', 'app.js', ...tsFiles];
    } else if (project.projectType === 'vue' || project.projectType === 'nuxt') {
      return ['src/main.js', 'main.js', 'src/index.js', 'index.js', ...tsFiles];
    } else if (project.projectType === 'nextjs') {
      return ['pages/index.js', 'src/pages/index.js', 'app.js', 'server.js', ...tsFiles];
    }
    
    // 通用 Node.js 项目：优先推荐常见的启动文件
    return [...commonNodeFiles, ...srcFiles, ...tsFiles];
  };

  // 检测可能的启动命令
  const detectPossibleCommands = (): string[] => {
    const packageManager = project.packageManager || 'npm';
    const startFile = tempConfig.startFile || 'index.js';
    
    // 基于文件的Node.js启动命令
    const nodeCommands = [
      `node ${startFile}`,                    // 直接使用 node 启动
      `nodemon ${startFile}`,                 // 开发模式热重载
      `pm2 start ${startFile}`,               // PM2 启动
      `ts-node ${startFile.replace('.js', '.ts')}`, // TypeScript 启动
    ];
    
    // 基于 npm scripts 的启动命令
    const npmCommands = [
      `${packageManager} start`,              // 标准启动
      `${packageManager} run dev`,            // 开发模式
      `${packageManager} run serve`,          // 服务模式
      `${packageManager} run prod`,           // 生产模式
    ];
    
    if (project.projectType === 'vite') {
      return [`${packageManager} run dev`, `${packageManager} run preview`, `${packageManager} start`, ...nodeCommands];
    } else if (project.projectType === 'nextjs') {
      return [`${packageManager} run dev`, `${packageManager} run start`, `${packageManager} run build`, ...nodeCommands];
    } else if (project.projectType === 'react') {
      return [`${packageManager} start`, `${packageManager} run build`, `${packageManager} run dev`, ...nodeCommands];
    } else if (project.projectType === 'express' || project.projectType === 'node-backend') {
      return [...nodeCommands, ...npmCommands];
    }
    
    // 通用 Node.js 项目
    return [...nodeCommands, ...npmCommands];
  };

  // 保存配置到package.json
  const saveConfig = async () => {
    if (!tempConfig.startScript && !tempConfig.startFile && !tempConfig.startCommand) {
      showToast('请至少填写一项配置', 'error');
      return;
    }

    setIsSaving(true);
    try {
      // 准备要保存的配置
      const configToSave = {
        startFile: tempConfig.startFile || '',
        startCommand: tempConfig.startCommand || ''
      };

      // 调用IPC保存配置
      const result = await window.electronAPI?.invoke('project:updateStartupConfig', project.path, configToSave);
      
      if (result?.success) {
        setConfig(tempConfig);
        setIsEditing(false);
        showToast('启动配置已保存', 'success');
        
        // 通知父组件配置已更新
        onConfigUpdate?.();
      } else {
        showToast(result?.error || '保存配置失败', 'error');
      }
    } catch (error) {
      console.error('保存启动配置失败:', error);
      showToast('保存配置失败', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 取消编辑
  const cancelEdit = () => {
    setTempConfig(config);
    setIsEditing(false);
  };

  // 开始编辑
  const startEdit = () => {
    setTempConfig(config);
    setIsEditing(true);
  };

  // 自动检测并填充配置
  const autoDetectConfig = () => {
    const possibleFiles = detectPossibleStartFiles();
    const possibleCommands = detectPossibleCommands();
    
    setTempConfig({
      ...tempConfig,
      startFile: possibleFiles[0] || 'index.js',
      startCommand: possibleCommands[0] || `node ${possibleFiles[0] || 'index.js'}`
    });
  };

  // 根据启动文件智能推荐启动命令
  const suggestCommandForFile = (fileName: string): string => {
    const packageManager = project.packageManager || 'npm';
    
    // TypeScript 文件
    if (fileName.endsWith('.ts')) {
      return `ts-node ${fileName}`;
    }
    
    // 如果是特定的框架文件，使用对应的命令
    if (fileName.includes('next') || project.projectType === 'nextjs') {
      return `${packageManager} run dev`;
    } else if (fileName.includes('vue') || project.projectType === 'vue') {
      return `${packageManager} run dev`;
    } else if (fileName.includes('react') || project.projectType === 'react') {
      return `${packageManager} start`;
    } else if (fileName.includes('vite') || project.projectType === 'vite') {
      return `${packageManager} run dev`;
    }
    
    // 普通 Node.js 文件，优先使用 node 直接启动
    return `node ${fileName}`;
  };

  // 当启动文件改变时，自动建议对应的启动命令
  const handleStartFileChange = (newStartFile: string) => {
    const suggestedCommand = suggestCommandForFile(newStartFile);
    setTempConfig({ 
      ...tempConfig, 
      startFile: newStartFile,
      startCommand: tempConfig.startCommand || suggestedCommand // 只在命令为空时自动填充
    });
  };

  if (isLoadingPackage) {
    return (
      <div className="theme-bg-secondary p-4 rounded-lg">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm theme-text-muted">加载启动配置...</span>
        </div>
      </div>
    );
  }

  if (!packageInfo) {
    return <MissingPackageJsonHandler project={project} onConfigUpdate={onConfigUpdate} />;
  }

  return (
    <div className="theme-bg-secondary p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={config.hasConfig ? "text-green-600" : "text-orange-600"}>
            {config.hasConfig ? "✅" : "⚙️"}
          </span>
          <h4 className="font-semibold theme-text-primary">启动配置</h4>
          {!config.hasConfig && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
              未配置
            </span>
          )}
        </div>
        
        {!isEditing ? (
          <div className="flex items-center gap-2">
            {!config.hasConfig && (
              <button
                onClick={autoDetectConfig}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
                title="自动检测配置"
              >
                🔍 自动检测
              </button>
            )}
            <button
              onClick={startEdit}
              className="text-xs px-2 py-1 btn-info rounded"
            >
              {config.hasConfig ? '编辑' : '配置'}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={saveConfig}
              disabled={isSaving}
              className="text-xs px-2 py-1 btn-success rounded"
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
            <button
              onClick={cancelEdit}
              disabled={isSaving}
              className="text-xs px-2 py-1 btn-secondary rounded"
            >
              取消
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          {/* 启动文件配置 */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-1">
              启动文件 (main)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tempConfig.startFile}
                onChange={(e) => handleStartFileChange(e.target.value)}
                placeholder="例如: server.js, app.js, index.js"
                className="flex-1 px-3 py-2 text-sm border rounded theme-bg-primary theme-text-primary theme-border focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="text-xs theme-text-muted mt-1">
              指定项目的主要入口文件，将更新 package.json 的 main 字段
            </p>
          </div>

          {/* 启动命令配置 */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-1">
              启动命令 (start script)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tempConfig.startCommand}
                onChange={(e) => setTempConfig({ ...tempConfig, startCommand: e.target.value })}
                placeholder={`例如: ${project.packageManager || 'npm'} start, node server.js`}
                className="flex-1 px-3 py-2 text-sm border rounded theme-bg-primary theme-text-primary theme-border focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="text-xs theme-text-muted mt-1">
              指定启动项目的命令，将更新 package.json 的 scripts.start 字段
            </p>
          </div>

          {/* 快速建议 */}
          <div>
            <div className="text-sm font-medium theme-text-primary mb-2">快速选择:</div>
            <div className="space-y-2">
              <div>
                <div className="text-xs theme-text-muted mb-1">常用启动文件:</div>
                <div className="flex flex-wrap gap-1">
                  {detectPossibleStartFiles().slice(0, 6).map((file) => (
                    <button
                      key={file}
                      onClick={() => handleStartFileChange(file)}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      {file}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-xs theme-text-muted mb-1">常用启动命令:</div>
                <div className="flex flex-wrap gap-1">
                  {detectPossibleCommands().slice(0, 6).map((command) => (
                    <button
                      key={command}
                      onClick={() => setTempConfig({ ...tempConfig, startCommand: command })}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                      title={`使用命令: ${command}`}
                    >
                      {command}
                    </button>
                  ))}
                </div>
                
                {/* 启动命令类型说明 */}
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                  <div className="font-medium text-blue-800 mb-1">💡 启动命令说明:</div>
                  <div className="text-blue-700 space-y-1">
                    <div>• <code className="bg-blue-100 px-1 rounded">node filename.js</code> - 直接使用 Node.js 运行</div>
                    <div>• <code className="bg-blue-100 px-1 rounded">npm start</code> - 使用 package.json 中的 start 脚本</div>
                    <div>• <code className="bg-blue-100 px-1 rounded">nodemon filename.js</code> - 开发模式热重载</div>
                    <div>• <code className="bg-blue-100 px-1 rounded">pm2 start filename.js</code> - 使用 PM2 进程管理</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {config.hasConfig ? (
            <>
              {config.startFile && (
                <div className="flex justify-between items-center">
                  <span className="text-sm theme-text-muted">启动文件:</span>
                  <span className="text-sm theme-text-primary font-mono bg-gray-100 px-2 py-1 rounded">
                    {config.startFile}
                  </span>
                </div>
              )}
              {config.startCommand && (
                <div className="flex justify-between items-center">
                  <span className="text-sm theme-text-muted">启动命令:</span>
                  <span className="text-sm theme-text-primary font-mono bg-gray-100 px-2 py-1 rounded">
                    {config.startCommand}
                  </span>
                </div>
              )}
              {project.recommendedScript && (
                <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">💡</span>
                    <span className="text-sm text-blue-700">
                      系统推荐使用脚本: <code className="bg-blue-100 px-1 rounded">{project.recommendedScript}</code>
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm theme-text-muted mb-2">
                此项目尚未配置启动参数
              </p>
              <p className="text-xs theme-text-muted">
                点击 "配置" 按钮设置启动文件和启动命令
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
