// 项目模板类型
export type ProjectTemplate = 'pure-api' | 'static-app' | 'full-stack';

// 前端框架类型（仅用于 vite-express 模板）
export type FrontendFramework = 'vanilla-ts' | 'react' | 'vue';

// 项目类型定义
export interface Project {
  id: string;
  name: string;
  path: string;
  type: 'node' | 'react' | 'vue' | 'electron' | 'other' | 'pure-api' | 'static-app' | 'full-stack';
  status: 'stopped' | 'running' | 'error';
  port?: number;
  lastOpened: Date;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  scripts: ProjectScript[];
  description?: string;
  version?: string;
  template?: ProjectTemplate;
  frontendFramework?: FrontendFramework;
}

export interface ProjectScript {
  name: string;
  command: string;
  description?: string;
}

// 项目日志类型
export interface ProjectLog {
  id: string;
  projectId: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  source?: 'system' | 'stdout' | 'stderr';
}

// 项目日志会话类型
export interface ProjectLogSession {
  projectId: string;
  projectName: string;
  startTime: Date;
  logs: ProjectLog[];
  isActive: boolean;
}

// 应用状态类型
export interface AppState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  activeProject: Project | null;
  logSessions: ProjectLogSession[]; // 添加日志会话
}

// 操作类型
export type AppAction = 
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'REMOVE_PROJECT'; payload: string }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT_PARTIAL'; payload: { id: string; updates: Partial<Project> } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ACTIVE_PROJECT'; payload: Project | null }
  | { type: 'UPDATE_PROJECT_STATUS'; payload: { id: string; status: Project['status'] } }
  | { type: 'START_LOG_SESSION'; payload: { projectId: string; projectName: string } }
  | { type: 'END_LOG_SESSION'; payload: string }
  | { type: 'ADD_LOG'; payload: ProjectLog }
  | { type: 'CLEAR_PROJECT_LOGS'; payload: string };

// 文件系统相关类型
export interface FileSystemResult {
  success: boolean;
  data?: any;
  error?: string;
}

// IPC 通信类型
export interface IPCResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 项目创建进度回调类型
export interface ProjectCreationProgress {
  onProgress?: (message: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
}

// 项目创建配置接口
export interface ProjectCreationConfig {
  name: string;
  path: string;
  template: ProjectTemplate;
  frontendFramework?: FrontendFramework; // 仅用于 vite-express 模板
  port: number;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  tools: {
    eslint: boolean;
    prettier: boolean;
    jest: boolean;
    envConfig: boolean;
    autoInstall: boolean;
    git: boolean;
  };
}

// 包管理器信息接口
export interface PackageManagerInfo {
  id: 'npm' | 'yarn' | 'pnpm';
  name: string;
  description: string;
  command: string;
}

// 模板信息接口
export interface TemplateInfo {
  id: ProjectTemplate;
  name: string;
  description: string;
  features: string[];
  supportsFrontendFramework: boolean;
}

// 应用设置类型
export interface AppSettings {
  theme: 'dark' | 'light';
  language: 'zh' | 'en';
  autoStart: boolean;
  minimizeToTray: boolean;
  devTools: boolean; // 添加开发者工具控制
  notifications: {
    projectStatus: boolean;
    errors: boolean;
    warnings: boolean;
    updates: boolean;
    enableSound: boolean;
    enableDesktop: boolean;
  };
  projects: {
    defaultPath: string;
    portRange: {
      express: { start: number; end: number };
      vite: { start: number; end: number };
      other: { start: number; end: number };
      auto: boolean; // 自动分配端口
    };
    defaultPackageManager: 'npm' | 'yarn' | 'pnpm';
    
    // 项目创建和管理
    creation: {
      autoInstallDeps: boolean; // 创建项目时自动安装依赖
      autoOpenBrowser: boolean; // 启动项目时自动打开浏览器
      autoOpenEditor: boolean; // 创建后自动打开编辑器
      useLatestVersions: boolean; // 使用最新版本的依赖
      enableTypeScript: boolean; // 默认启用TypeScript
      enableESLint: boolean; // 默认启用ESLint
      enablePrettier: boolean; // 默认启用Prettier
      enableGit: boolean; // 默认初始化Git仓库
      defaultLicense: 'MIT' | 'Apache-2.0' | 'GPL-3.0' | 'BSD-3-Clause' | 'None';
    };
    
    // 运行时管理
    runtime: {
      maxConcurrentProjects: number; // 最大同时运行的项目数
      autoRestartOnCrash: boolean; // 崩溃时自动重启
      autoSaveInterval: number; // 自动保存项目状态间隔(秒)
      killProcessesOnStop: boolean; // 停止时强制终止所有相关进程
      watchFileChanges: boolean; // 监控文件变化
      hotReload: boolean; // 热重载功能
    };
    
    // UI和显示
    ui: {
      showProjectThumbnails: boolean; // 显示项目预览图
      gridView: boolean; // 网格视图
      showProjectDetails: boolean; // 显示项目详细信息
      compactMode: boolean; // 紧凑模式
      sortBy: 'name' | 'lastOpened' | 'dateCreated' | 'status';
      sortOrder: 'asc' | 'desc';
      favoriteProjects: string[]; // 收藏的项目ID列表
    };
    
    // Git集成
    git: {
      enabled: boolean; // Git 集成功能
      autoCommit: boolean; // 自动提交重要更改
      autoCommitMessage: string; // 默认提交信息
      showBranchInProjectCard: boolean; // 在项目卡片显示分支
      showUncommittedChanges: boolean; // 显示未提交更改
      defaultBranch: string; // 默认分支名
    };
    
    // Docker支持
    docker: {
      enabled: boolean; // Docker 支持
      autoDetectDockerfile: boolean; // 自动检测Dockerfile
      defaultBaseImage: string; // 默认基础镜像
      autoGenerateDockerfile: boolean; // 自动生成Dockerfile
      exposePortsAutomatically: boolean; // 自动暴露端口
    };
    
    // 终端集成
    terminal: {
      enabled: boolean;
      defaultShell: 'bash' | 'zsh' | 'fish' | 'powershell' | 'cmd';
      preserveHistory: boolean;
      maxHistorySize: number; // 历史记录最大条数
      customCommands: Array<{
        name: string;
        command: string;
        description: string;
      }>;
    };
    
    // 性能监控
    monitoring: {
      enabled: boolean; // 性能监控
      realTimeMonitoring: boolean; // 实时监控
      logRetentionDays: number; // 日志保留天数
      autoCleanupLogs: boolean; // 自动清理日志
      alertOnHighCPU: boolean; // CPU使用率过高时警告
      alertOnHighMemory: boolean; // 内存使用过高时警告
      cpuThreshold: number; // CPU警告阈值(百分比)
      memoryThreshold: number; // 内存警告阈值(MB)
      trackProjectMetrics: boolean; // 跟踪项目指标
      enableErrorTracking: boolean; // 错误跟踪
    };
    
    // 备份系统
    backup: {
      enabled: boolean; // 启用项目备份
      autoBackup: boolean; // 自动备份
      backupInterval: number; // 备份间隔(小时)
      maxBackups: number; // 最大备份数量
      backupPath: string; // 备份路径
      includeNodeModules: boolean; // 备份时包含node_modules
      includeGitHistory: boolean; // 备份时包含Git历史
      compressBackups: boolean; // 压缩备份文件
      excludePatterns: string[]; // 排除模式
    };
    
    // 编辑器集成
    editor: {
      defaultEditor: 'vscode' | 'webstorm' | 'atom' | 'sublime' | 'vim' | 'custom';
      customEditorCommand: string; // 自定义编辑器命令
      openProjectOnCreate: boolean; // 创建项目后自动打开编辑器
      openSpecificFiles: boolean; // 打开特定文件
      defaultFilesToOpen: string[]; // 默认打开的文件列表
      enableEditorSync: boolean; // 编辑器同步
    };
    
    // 依赖管理
    dependencies: {
      autoUpdate: boolean; // 自动更新依赖
      updateFrequency: 'never' | 'daily' | 'weekly' | 'monthly';
      checkSecurity: boolean; // 检查安全漏洞
      autoFixVulnerabilities: boolean; // 自动修复漏洞
      showOutdatedPackages: boolean; // 显示过期包
      licenseChecking: boolean; // 许可证检查
    };
    
    // 模板和脚手架
    templates: {
      customTemplatesPath: string; // 自定义模板路径
      favoriteTemplates: string[]; // 收藏的模板
      enableRemoteTemplates: boolean; // 启用远程模板
      templateSources: Array<{
        name: string;
        url: string;
        enabled: boolean;
      }>;
    };
    
    // 团队协作
    collaboration: {
      enableTeamFeatures: boolean; // 启用团队功能
      shareProjects: boolean; // 项目共享
      syncSettings: boolean; // 设置同步
      teamWorkspacePath: string; // 团队工作区路径
    };
    
    // 插件系统
    plugins: {
      enabled: boolean; // 启用插件系统
      autoUpdate: boolean; // 自动更新插件
      allowThirdParty: boolean; // 允许第三方插件
      pluginDirectory: string; // 插件目录
      installedPlugins: Array<{
        id: string;
        name: string;
        version: string;
        enabled: boolean;
      }>;
    };
  };
}

// 设置相关的Action类型
export type SettingsAction =
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'UPDATE_THEME'; payload: 'dark' | 'light' }
  | { type: 'UPDATE_LANGUAGE'; payload: 'zh' | 'en' }
  | { type: 'UPDATE_SETTING'; payload: { key: keyof AppSettings; value: any } };
