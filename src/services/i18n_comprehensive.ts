import type { AppSettings } from '../types';

// 中文翻译
const zh = {
  common: {
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    settings: '设置',
    general: '通用',
    advanced: '高级',
    reset: '重置',
    import: '导入',
    export: '导出',
    browse: '浏览',
    enabled: '启用',
    disabled: '禁用',
    auto: '自动',
    manual: '手动',
  },
  nav: {
    projects: '项目',
    settings: '设置',
    logs: '日志',
    about: '关于',
  },
  actions: {
    start: '启动',
    stop: '停止',
    restart: '重启',
    remove: '移除',
    edit: '编辑',
    open: '打开',
    create: '创建',
    clone: '克隆',
    duplicate: '复制',
    refresh: '刷新',
    openInEditor: '在编辑器中打开',
    openInTerminal: '在终端中打开',
    showInFolder: '在文件夹中显示',
    copyPath: '复制路径',
  },
  settings: {
    title: '设置',
    description: '应用程序配置和偏好设置',
    app: {
      title: '应用设置',
      theme: '主题',
      themeDesc: '选择应用程序的视觉主题',
      language: '语言',
      languageDesc: '设置应用程序界面语言',
      autoStart: '开机自启',
      autoStartDesc: '系统启动时自动启动应用程序',
      devTools: '开发者工具',
      devToolsDesc: '启用开发者调试工具',
    },
    general: {
      title: '通用设置',
      theme: '主题',
      themeDesc: '选择应用程序的视觉主题',
      language: '语言',
      languageDesc: '设置应用程序界面语言',
      autoStart: '开机自启',
      autoStartDesc: '系统启动时自动启动应用程序',
      minimizeToTray: '最小化到托盘',
      minimizeToTrayDesc: '关闭窗口时最小化到系统托盘',
      devTools: '开发者工具',
      devToolsDesc: '启用开发者调试工具',
    },
    notifications: {
      title: '通知设置',
      projectStatus: '项目状态通知',
      projectStatusDesc: '项目启动、停止等状态变化时通知',
      errors: '错误通知',
      errorsDesc: '项目运行出错时显示通知',
      warnings: '警告通知',
      warningsDesc: '显示项目警告信息',
      updates: '更新通知',
      updatesDesc: '应用或依赖更新时通知',
      enableSound: '声音提醒',
      enableSoundDesc: '通知时播放提示音',
      enableDesktop: '桌面通知',
      enableDesktopDesc: '在系统桌面显示通知',
    },
    projects: {
      title: '项目管理',
      defaultPath: '默认项目路径',
      defaultPathDesc: '新建项目的默认存储路径',
      defaultPackageManager: '默认包管理器',
      defaultPackageManagerDesc: '创建新项目时使用的包管理器',
      
      // 端口设置
      portRange: {
        title: '端口设置',
        auto: '自动分配端口',
        autoDesc: '自动为新项目分配可用端口',
        express: 'Express端口范围',
        expressDesc: 'Express项目使用的端口范围',
        vite: 'Vite端口范围',
        viteDesc: 'Vite项目使用的端口范围',
        other: '其他端口范围',
        otherDesc: '其他类型项目使用的端口范围',
      },
      
      // 项目创建设置
      creation: {
        title: '项目创建',
        autoInstallDeps: '自动安装依赖',
        autoInstallDepsDesc: '创建新项目时自动运行依赖安装',
        autoOpenBrowser: '自动打开浏览器',
        autoOpenBrowserDesc: '启动Web项目时自动在浏览器中打开',
        autoOpenEditor: '自动打开编辑器',
        autoOpenEditorDesc: '创建项目后自动在编辑器中打开',
        useLatestVersions: '使用最新版本',
        useLatestVersionsDesc: '安装依赖时使用最新版本',
        enableTypeScript: '启用TypeScript',
        enableTypeScriptDesc: '默认为新项目启用TypeScript',
        enableESLint: '启用ESLint',
        enableESLintDesc: '默认为新项目配置代码检查',
        enablePrettier: '启用Prettier',
        enablePrettierDesc: '默认为新项目配置代码格式化',
        enableGit: '初始化Git',
        enableGitDesc: '为新项目自动初始化Git仓库',
        defaultLicense: '默认许可证',
        defaultLicenseDesc: '新项目使用的默认开源许可证',
      },
      
      // 运行时管理
      runtime: {
        title: '运行时管理',
        maxConcurrentProjects: '最大并发项目数',
        maxConcurrentProjectsDesc: '允许同时运行的项目数量上限',
        autoRestartOnCrash: '崩溃自动重启',
        autoRestartOnCrashDesc: '项目崩溃时自动重新启动',
        autoSaveInterval: '自动保存间隔',
        autoSaveIntervalDesc: '自动保存项目状态的时间间隔（秒）',
        killProcessesOnStop: '停止时终止进程',
        killProcessesOnStopDesc: '停止项目时强制终止所有相关进程',
        watchFileChanges: '监控文件变化',
        watchFileChangesDesc: '实时监控项目文件的变化',
        hotReload: '热重载',
        hotReloadDesc: '文件变化时自动重载项目',
      },
      
      // UI和显示
      ui: {
        title: 'UI和显示',
        showProjectThumbnails: '显示项目缩略图',
        showProjectThumbnailsDesc: '在项目列表中显示预览图片',
        gridView: '网格视图',
        gridViewDesc: '使用网格布局显示项目',
        showProjectDetails: '显示项目详情',
        showProjectDetailsDesc: '在项目卡片中显示详细信息',
        compactMode: '紧凑模式',
        compactModeDesc: '使用更紧凑的界面布局',
        sortBy: '排序方式',
        sortByDesc: '项目列表的默认排序方式',
        sortOrder: '排序顺序',
        sortOrderDesc: '升序或降序排列',
      },
      
      // Git集成
      git: {
        title: 'Git集成',
        enabled: '启用Git集成',
        enabledDesc: '启用Git版本控制功能',
        autoCommit: '自动提交',
        autoCommitDesc: '自动提交重要的项目更改',
        autoCommitMessage: '自动提交信息',
        autoCommitMessageDesc: '自动提交时使用的默认提交信息',
        showBranchInProjectCard: '显示分支信息',
        showBranchInProjectCardDesc: '在项目卡片上显示当前分支',
        showUncommittedChanges: '显示未提交更改',
        showUncommittedChangesDesc: '显示项目中未提交的更改',
        defaultBranch: '默认分支',
        defaultBranchDesc: '新项目的默认主分支名称',
      },
      
      // Docker支持
      docker: {
        title: 'Docker支持',
        enabled: '启用Docker',
        enabledDesc: '启用Docker容器化支持',
        autoDetectDockerfile: '自动检测Dockerfile',
        autoDetectDockerfileDesc: '自动检测项目中的Dockerfile',
        defaultBaseImage: '默认基础镜像',
        defaultBaseImageDesc: '生成Dockerfile时使用的默认基础镜像',
        autoGenerateDockerfile: '自动生成Dockerfile',
        autoGenerateDockerfileDesc: '为新项目自动生成Dockerfile',
        exposePortsAutomatically: '自动暴露端口',
        exposePortsAutomaticallyDesc: '在Dockerfile中自动暴露项目端口',
      },
      
      // 终端集成
      terminal: {
        title: '终端集成',
        enabled: '启用终端集成',
        enabledDesc: '在应用内嵌入终端功能',
        defaultShell: '默认Shell',
        defaultShellDesc: '选择默认的终端Shell',
        preserveHistory: '保留历史记录',
        preserveHistoryDesc: '保存并恢复终端命令历史',
        maxHistorySize: '历史记录大小',
        maxHistorySizeDesc: '保存的最大历史命令数量',
        customCommands: '自定义命令',
        customCommandsDesc: '配置常用的自定义命令',
      },
      
      // 性能监控
      monitoring: {
        title: '性能监控',
        enabled: '启用监控',
        enabledDesc: '启用项目性能监控功能',
        realTimeMonitoring: '实时监控',
        realTimeMonitoringDesc: '实时监控项目运行状态',
        logRetentionDays: '日志保留天数',
        logRetentionDaysDesc: '设置日志文件的保留天数',
        autoCleanupLogs: '自动清理日志',
        autoCleanupLogsDesc: '自动删除过期的日志文件',
        alertOnHighCPU: 'CPU使用率警告',
        alertOnHighCPUDesc: 'CPU使用率过高时显示警告',
        alertOnHighMemory: '内存使用警告',
        alertOnHighMemoryDesc: '内存使用过高时显示警告',
        cpuThreshold: 'CPU警告阈值',
        cpuThresholdDesc: 'CPU使用率警告阈值（百分比）',
        memoryThreshold: '内存警告阈值',
        memoryThresholdDesc: '内存使用警告阈值（MB）',
        trackProjectMetrics: '跟踪项目指标',
        trackProjectMetricsDesc: '收集和分析项目性能指标',
        enableErrorTracking: '错误跟踪',
        enableErrorTrackingDesc: '自动跟踪和报告项目错误',
      },
      
      // 项目备份
      backup: {
        title: '项目备份',
        enabled: '启用备份功能',
        enabledDesc: '开启项目配置和代码的备份功能',
        autoBackup: '自动备份',
        autoBackupDesc: '定期自动备份项目',
        backupInterval: '备份间隔',
        backupIntervalDesc: '自动备份的时间间隔（小时）',
        maxBackups: '最大备份数',
        maxBackupsDesc: '保留的最大备份文件数量',
        backupPath: '备份路径',
        backupPathDesc: '项目备份文件的存储路径',
        includeNodeModules: '包含node_modules',
        includeNodeModulesDesc: '备份时包含node_modules目录',
        includeGitHistory: '包含Git历史',
        includeGitHistoryDesc: '备份时包含完整的Git提交历史',
        compressBackups: '压缩备份',
        compressBackupsDesc: '使用压缩格式保存备份文件',
        excludePatterns: '排除模式',
        excludePatternsDesc: '备份时排除的文件和目录模式',
      },
      
      // 编辑器集成
      editor: {
        title: '编辑器集成',
        defaultEditor: '默认编辑器',
        defaultEditorDesc: '选择默认的代码编辑器',
        customEditorCommand: '自定义编辑器命令',
        customEditorCommandDesc: '使用自定义编辑器时的启动命令',
        openProjectOnCreate: '创建后打开项目',
        openProjectOnCreateDesc: '创建项目后自动在编辑器中打开',
        openSpecificFiles: '打开特定文件',
        openSpecificFilesDesc: '打开项目时自动打开特定文件',
        defaultFilesToOpen: '默认打开文件',
        defaultFilesToOpenDesc: '自动打开的文件列表',
        enableEditorSync: '编辑器同步',
        enableEditorSyncDesc: '与外部编辑器同步文件状态',
      },
      
      // 依赖管理
      dependencies: {
        title: '依赖管理',
        autoUpdate: '自动更新',
        autoUpdateDesc: '自动更新项目依赖到最新版本',
        updateFrequency: '更新频率',
        updateFrequencyDesc: '检查依赖更新的频率',
        checkSecurity: '安全检查',
        checkSecurityDesc: '检查依赖包的安全漏洞',
        autoFixVulnerabilities: '自动修复漏洞',
        autoFixVulnerabilitiesDesc: '自动修复发现的安全漏洞',
        showOutdatedPackages: '显示过期包',
        showOutdatedPackagesDesc: '在项目中显示过期的依赖包',
        licenseChecking: '许可证检查',
        licenseCheckingDesc: '检查依赖包的许可证兼容性',
      },
      
      // 模板管理
      templates: {
        title: '模板管理',
        customTemplatesPath: '自定义模板路径',
        customTemplatesPathDesc: '存储自定义项目模板的路径',
        favoriteTemplates: '收藏模板',
        favoriteTemplatesDesc: '经常使用的项目模板',
        enableRemoteTemplates: '启用远程模板',
        enableRemoteTemplatesDesc: '允许从远程仓库下载模板',
        templateSources: '模板源',
        templateSourcesDesc: '配置远程模板仓库源',
      },
      
      // 团队协作
      collaboration: {
        title: '团队协作',
        enableTeamFeatures: '启用团队功能',
        enableTeamFeaturesDesc: '开启团队协作相关功能',
        shareProjects: '项目共享',
        shareProjectsDesc: '与团队成员共享项目',
        syncSettings: '设置同步',
        syncSettingsDesc: '在团队间同步应用设置',
        teamWorkspacePath: '团队工作区',
        teamWorkspacePathDesc: '团队共享项目的存储路径',
      },
      
      // 插件系统
      plugins: {
        title: '插件系统',
        enabled: '启用插件',
        enabledDesc: '启用第三方插件扩展功能',
        autoUpdate: '自动更新插件',
        autoUpdateDesc: '自动更新已安装的插件',
        allowThirdParty: '允许第三方插件',
        allowThirdPartyDesc: '允许安装来自第三方的插件',
        pluginDirectory: '插件目录',
        pluginDirectoryDesc: '插件安装和存储目录',
        installedPlugins: '已安装插件',
        installedPluginsDesc: '管理当前安装的插件',
      },
    },
  },
  project: {
    status: {
      running: '运行中',
      stopped: '已停止',
      error: '错误',
      starting: '启动中',
      stopping: '停止中',
    },
    type: {
      node: 'Node.js',
      react: 'React',
      vue: 'Vue.js',
      electron: 'Electron',
      other: '其他',
      'pure-api': '纯API',
      'static-app': '静态应用',
      'full-stack': '全栈应用',
    },
    template: {
      'pure-api': '纯API项目',
      'static-app': '静态Web应用',
      'full-stack': '全栈Web应用',
    },
    packageManager: {
      npm: 'NPM',
      yarn: 'Yarn',
      pnpm: 'PNPM',
    },
  },
  logs: {
    title: '日志',
    clear: '清空日志',
    export: '导出日志',
    level: {
      info: '信息',
      warn: '警告',
      error: '错误',
      success: '成功',
    },
  },
  modal: {
    createProject: {
      title: '创建新项目',
      name: '项目名称',
      namePlaceholder: '输入项目名称',
      path: '项目路径',
      pathPlaceholder: '选择项目存储路径',
      template: '项目模板',
      port: '端口号',
      packageManager: '包管理器',
      tools: '开发工具',
      description: '项目描述',
      descriptionPlaceholder: '简短描述您的项目',
    },
    projectSettings: {
      title: '项目设置',
      general: '基本信息',
      scripts: '脚本管理',
      environment: '环境变量',
      dependencies: '依赖管理',
    },
  },
  toast: {
    projectCreated: '项目创建成功',
    projectDeleted: '项目删除成功',
    projectStarted: '项目启动成功',
    projectStopped: '项目停止成功',
    settingsSaved: '设置保存成功',
    error: '操作失败',
  },
};

// 英文翻译
const en = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    settings: 'Settings',
    general: 'General',
    advanced: 'Advanced',
    reset: 'Reset',
    import: 'Import',
    export: 'Export',
    browse: 'Browse',
    enabled: 'Enabled',
    disabled: 'Disabled',
    auto: 'Auto',
    manual: 'Manual',
  },
  nav: {
    projects: 'Projects',
    settings: 'Settings',
    logs: 'Logs',
    about: 'About',
  },
  actions: {
    start: 'Start',
    stop: 'Stop',
    restart: 'Restart',
    remove: 'Remove',
    edit: 'Edit',
    open: 'Open',
    create: 'Create',
    clone: 'Clone',
    duplicate: 'Duplicate',
    refresh: 'Refresh',
    openInEditor: 'Open in Editor',
    openInTerminal: 'Open in Terminal',
    showInFolder: 'Show in Folder',
    copyPath: 'Copy Path',
  },
  settings: {
    title: 'Settings',
    general: {
      title: 'General Settings',
      theme: 'Theme',
      themeDesc: 'Choose the visual theme of the application',
      language: 'Language',
      languageDesc: 'Set the interface language',
      autoStart: 'Auto Start',
      autoStartDesc: 'Start the application automatically when system boots',
      minimizeToTray: 'Minimize to Tray',
      minimizeToTrayDesc: 'Minimize to system tray when closing window',
      devTools: 'Developer Tools',
      devToolsDesc: 'Enable developer debugging tools',
    },
    notifications: {
      title: 'Notifications',
      projectStatus: 'Project Status',
      projectStatusDesc: 'Notify when projects start, stop or change status',
      errors: 'Error Notifications',
      errorsDesc: 'Show notifications when errors occur',
      warnings: 'Warning Notifications',
      warningsDesc: 'Show project warning messages',
      updates: 'Update Notifications',
      updatesDesc: 'Notify when app or dependencies updates are available',
      enableSound: 'Sound Alerts',
      enableSoundDesc: 'Play sound when notifications appear',
      enableDesktop: 'Desktop Notifications',
      enableDesktopDesc: 'Show notifications on system desktop',
    },
    projects: {
      title: 'Project Management',
      defaultPath: 'Default Project Path',
      defaultPathDesc: 'Default storage path for new projects',
      defaultPackageManager: 'Default Package Manager',
      defaultPackageManagerDesc: 'Package manager to use for new projects',
      
      // Port Settings
      portRange: {
        title: 'Port Settings',
        auto: 'Auto Assign Ports',
        autoDesc: 'Automatically assign available ports for new projects',
        express: 'Express Port Range',
        expressDesc: 'Port range for Express projects',
        vite: 'Vite Port Range',
        viteDesc: 'Port range for Vite projects',
        other: 'Other Port Range',
        otherDesc: 'Port range for other project types',
      },
      
      // Project Creation
      creation: {
        title: 'Project Creation',
        autoInstallDeps: 'Auto Install Dependencies',
        autoInstallDepsDesc: 'Automatically run dependency installation when creating new projects',
        autoOpenBrowser: 'Auto Open Browser',
        autoOpenBrowserDesc: 'Automatically open browser when starting web projects',
        autoOpenEditor: 'Auto Open Editor',
        autoOpenEditorDesc: 'Automatically open editor after creating projects',
        useLatestVersions: 'Use Latest Versions',
        useLatestVersionsDesc: 'Use latest versions when installing dependencies',
        enableTypeScript: 'Enable TypeScript',
        enableTypeScriptDesc: 'Enable TypeScript by default for new projects',
        enableESLint: 'Enable ESLint',
        enableESLintDesc: 'Configure code linting by default for new projects',
        enablePrettier: 'Enable Prettier',
        enablePrettierDesc: 'Configure code formatting by default for new projects',
        enableGit: 'Initialize Git',
        enableGitDesc: 'Automatically initialize Git repository for new projects',
        defaultLicense: 'Default License',
        defaultLicenseDesc: 'Default open source license for new projects',
      },
      
      // Runtime Management
      runtime: {
        title: 'Runtime Management',
        maxConcurrentProjects: 'Max Concurrent Projects',
        maxConcurrentProjectsDesc: 'Maximum number of projects that can run simultaneously',
        autoRestartOnCrash: 'Auto Restart on Crash',
        autoRestartOnCrashDesc: 'Automatically restart projects when they crash',
        autoSaveInterval: 'Auto Save Interval',
        autoSaveIntervalDesc: 'Interval for automatically saving project state (seconds)',
        killProcessesOnStop: 'Kill Processes on Stop',
        killProcessesOnStopDesc: 'Force terminate all related processes when stopping project',
        watchFileChanges: 'Watch File Changes',
        watchFileChangesDesc: 'Monitor project file changes in real-time',
        hotReload: 'Hot Reload',
        hotReloadDesc: 'Automatically reload project when files change',
      },
      
      // UI and Display
      ui: {
        title: 'UI and Display',
        showProjectThumbnails: 'Show Project Thumbnails',
        showProjectThumbnailsDesc: 'Display preview images in project list',
        gridView: 'Grid View',
        gridViewDesc: 'Use grid layout to display projects',
        showProjectDetails: 'Show Project Details',
        showProjectDetailsDesc: 'Display detailed information in project cards',
        compactMode: 'Compact Mode',
        compactModeDesc: 'Use more compact interface layout',
        sortBy: 'Sort By',
        sortByDesc: 'Default sorting method for project list',
        sortOrder: 'Sort Order',
        sortOrderDesc: 'Ascending or descending order',
      },
      
      // Git Integration
      git: {
        title: 'Git Integration',
        enabled: 'Enable Git Integration',
        enabledDesc: 'Enable Git version control features',
        autoCommit: 'Auto Commit',
        autoCommitDesc: 'Automatically commit important project changes',
        autoCommitMessage: 'Auto Commit Message',
        autoCommitMessageDesc: 'Default commit message for automatic commits',
        showBranchInProjectCard: 'Show Branch Info',
        showBranchInProjectCardDesc: 'Display current branch on project cards',
        showUncommittedChanges: 'Show Uncommitted Changes',
        showUncommittedChangesDesc: 'Display uncommitted changes in projects',
        defaultBranch: 'Default Branch',
        defaultBranchDesc: 'Default main branch name for new projects',
      },
      
      // Docker Support
      docker: {
        title: 'Docker Support',
        enabled: 'Enable Docker',
        enabledDesc: 'Enable Docker containerization support',
        autoDetectDockerfile: 'Auto Detect Dockerfile',
        autoDetectDockerfileDesc: 'Automatically detect Dockerfile in projects',
        defaultBaseImage: 'Default Base Image',
        defaultBaseImageDesc: 'Default base image to use when generating Dockerfile',
        autoGenerateDockerfile: 'Auto Generate Dockerfile',
        autoGenerateDockerfileDesc: 'Automatically generate Dockerfile for new projects',
        exposePortsAutomatically: 'Auto Expose Ports',
        exposePortsAutomaticallyDesc: 'Automatically expose project ports in Dockerfile',
      },
      
      // Terminal Integration
      terminal: {
        title: 'Terminal Integration',
        enabled: 'Enable Terminal Integration',
        enabledDesc: 'Embed terminal functionality within the app',
        defaultShell: 'Default Shell',
        defaultShellDesc: 'Choose the default terminal shell',
        preserveHistory: 'Preserve History',
        preserveHistoryDesc: 'Save and restore terminal command history',
        maxHistorySize: 'Max History Size',
        maxHistorySizeDesc: 'Maximum number of history commands to save',
        customCommands: 'Custom Commands',
        customCommandsDesc: 'Configure frequently used custom commands',
      },
      
      // Performance Monitoring
      monitoring: {
        title: 'Performance Monitoring',
        enabled: 'Enable Monitoring',
        enabledDesc: 'Enable project performance monitoring features',
        realTimeMonitoring: 'Real-time Monitoring',
        realTimeMonitoringDesc: 'Monitor project runtime status in real-time',
        logRetentionDays: 'Log Retention Days',
        logRetentionDaysDesc: 'Number of days to keep log files',
        autoCleanupLogs: 'Auto Cleanup Logs',
        autoCleanupLogsDesc: 'Automatically delete expired log files',
        alertOnHighCPU: 'High CPU Alert',
        alertOnHighCPUDesc: 'Show alert when CPU usage is high',
        alertOnHighMemory: 'High Memory Alert',
        alertOnHighMemoryDesc: 'Show alert when memory usage is high',
        cpuThreshold: 'CPU Alert Threshold',
        cpuThresholdDesc: 'CPU usage alert threshold (percentage)',
        memoryThreshold: 'Memory Alert Threshold',
        memoryThresholdDesc: 'Memory usage alert threshold (MB)',
        trackProjectMetrics: 'Track Project Metrics',
        trackProjectMetricsDesc: 'Collect and analyze project performance metrics',
        enableErrorTracking: 'Error Tracking',
        enableErrorTrackingDesc: 'Automatically track and report project errors',
      },
      
      // Project Backup
      backup: {
        title: 'Project Backup',
        enabled: 'Enable Backup',
        enabledDesc: 'Enable project configuration and code backup features',
        autoBackup: 'Auto Backup',
        autoBackupDesc: 'Periodically backup projects automatically',
        backupInterval: 'Backup Interval',
        backupIntervalDesc: 'Time interval for automatic backups (hours)',
        maxBackups: 'Max Backups',
        maxBackupsDesc: 'Maximum number of backup files to keep',
        backupPath: 'Backup Path',
        backupPathDesc: 'Storage path for project backup files',
        includeNodeModules: 'Include node_modules',
        includeNodeModulesDesc: 'Include node_modules directory in backups',
        includeGitHistory: 'Include Git History',
        includeGitHistoryDesc: 'Include complete Git commit history in backups',
        compressBackups: 'Compress Backups',
        compressBackupsDesc: 'Use compressed format for backup files',
        excludePatterns: 'Exclude Patterns',
        excludePatternsDesc: 'File and directory patterns to exclude from backups',
      },
      
      // Editor Integration
      editor: {
        title: 'Editor Integration',
        defaultEditor: 'Default Editor',
        defaultEditorDesc: 'Choose the default code editor',
        customEditorCommand: 'Custom Editor Command',
        customEditorCommandDesc: 'Launch command for custom editor',
        openProjectOnCreate: 'Open Project on Create',
        openProjectOnCreateDesc: 'Automatically open project in editor after creation',
        openSpecificFiles: 'Open Specific Files',
        openSpecificFilesDesc: 'Automatically open specific files when opening project',
        defaultFilesToOpen: 'Default Files to Open',
        defaultFilesToOpenDesc: 'List of files to open automatically',
        enableEditorSync: 'Editor Sync',
        enableEditorSyncDesc: 'Sync file state with external editor',
      },
      
      // Dependencies Management
      dependencies: {
        title: 'Dependencies Management',
        autoUpdate: 'Auto Update',
        autoUpdateDesc: 'Automatically update project dependencies to latest versions',
        updateFrequency: 'Update Frequency',
        updateFrequencyDesc: 'How often to check for dependency updates',
        checkSecurity: 'Security Check',
        checkSecurityDesc: 'Check for security vulnerabilities in dependencies',
        autoFixVulnerabilities: 'Auto Fix Vulnerabilities',
        autoFixVulnerabilitiesDesc: 'Automatically fix discovered security vulnerabilities',
        showOutdatedPackages: 'Show Outdated Packages',
        showOutdatedPackagesDesc: 'Display outdated dependencies in projects',
        licenseChecking: 'License Checking',
        licenseCheckingDesc: 'Check license compatibility of dependencies',
      },
      
      // Template Management
      templates: {
        title: 'Template Management',
        customTemplatesPath: 'Custom Templates Path',
        customTemplatesPathDesc: 'Path to store custom project templates',
        favoriteTemplates: 'Favorite Templates',
        favoriteTemplatesDesc: 'Frequently used project templates',
        enableRemoteTemplates: 'Enable Remote Templates',
        enableRemoteTemplatesDesc: 'Allow downloading templates from remote repositories',
        templateSources: 'Template Sources',
        templateSourcesDesc: 'Configure remote template repository sources',
      },
      
      // Team Collaboration
      collaboration: {
        title: 'Team Collaboration',
        enableTeamFeatures: 'Enable Team Features',
        enableTeamFeaturesDesc: 'Enable team collaboration related features',
        shareProjects: 'Share Projects',
        shareProjectsDesc: 'Share projects with team members',
        syncSettings: 'Sync Settings',
        syncSettingsDesc: 'Sync application settings across team',
        teamWorkspacePath: 'Team Workspace',
        teamWorkspacePathDesc: 'Storage path for team shared projects',
      },
      
      // Plugin System
      plugins: {
        title: 'Plugin System',
        enabled: 'Enable Plugins',
        enabledDesc: 'Enable third-party plugin extension features',
        autoUpdate: 'Auto Update Plugins',
        autoUpdateDesc: 'Automatically update installed plugins',
        allowThirdParty: 'Allow Third-party Plugins',
        allowThirdPartyDesc: 'Allow installation of third-party plugins',
        pluginDirectory: 'Plugin Directory',
        pluginDirectoryDesc: 'Directory for plugin installation and storage',
        installedPlugins: 'Installed Plugins',
        installedPluginsDesc: 'Manage currently installed plugins',
      },
    },
  },
  project: {
    status: {
      running: 'Running',
      stopped: 'Stopped',
      error: 'Error',
      starting: 'Starting',
      stopping: 'Stopping',
    },
    type: {
      node: 'Node.js',
      react: 'React',
      vue: 'Vue.js',
      electron: 'Electron',
      other: 'Other',
      'pure-api': 'Pure API',
      'static-app': 'Static App',
      'full-stack': 'Full Stack',
    },
    template: {
      'pure-api': 'Pure API Project',
      'static-app': 'Static Web App',
      'full-stack': 'Full Stack Web App',
    },
    packageManager: {
      npm: 'NPM',
      yarn: 'Yarn',
      pnpm: 'PNPM',
    },
  },
  logs: {
    title: 'Logs',
    clear: 'Clear Logs',
    export: 'Export Logs',
    level: {
      info: 'Info',
      warn: 'Warning',
      error: 'Error',
      success: 'Success',
    },
  },
  modal: {
    createProject: {
      title: 'Create New Project',
      name: 'Project Name',
      namePlaceholder: 'Enter project name',
      path: 'Project Path',
      pathPlaceholder: 'Select project storage path',
      template: 'Project Template',
      port: 'Port Number',
      packageManager: 'Package Manager',
      tools: 'Development Tools',
      description: 'Project Description',
      descriptionPlaceholder: 'Brief description of your project',
    },
    projectSettings: {
      title: 'Project Settings',
      general: 'General Info',
      scripts: 'Script Management',
      environment: 'Environment Variables',
      dependencies: 'Dependencies Management',
    },
  },
  toast: {
    projectCreated: 'Project created successfully',
    projectDeleted: 'Project deleted successfully',
    projectStarted: 'Project started successfully',
    projectStopped: 'Project stopped successfully',
    settingsSaved: 'Settings saved successfully',
    error: 'Operation failed',
  },
};

// 导出翻译对象
export const translations = { zh, en };

// 默认语言
export const DEFAULT_LANGUAGE = 'zh';

// 当前语言
let currentLanguage: 'zh' | 'en' = DEFAULT_LANGUAGE;

// 设置语言
export const setLanguage = (lang: 'zh' | 'en') => {
  currentLanguage = lang;
};

// 获取当前语言
export const getCurrentLanguage = () => currentLanguage;

// 翻译函数
export const t = (key: string, params?: Record<string, string>): string => {
  const keys = key.split('.');
  let value: any = translations[currentLanguage];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // 如果当前语言没有找到，尝试使用默认语言
      value = translations[DEFAULT_LANGUAGE];
      for (const defaultK of keys) {
        if (value && typeof value === 'object' && defaultK in value) {
          value = value[defaultK];
        } else {
          return key; // 如果都没找到，返回原key
        }
      }
      break;
    }
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  // 参数替换
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
      return params[paramKey] || match;
    });
  }
  
  return value;
};

// 初始化i18n系统
export const initI18n = (language?: 'zh' | 'en') => {
  if (language) {
    setLanguage(language);
  }
};

export default {
  translations,
  t,
  setLanguage,
  getCurrentLanguage,
  initI18n,
  DEFAULT_LANGUAGE,
};
