// 中文翻译
const zh = {
  // 通用
  cancel: '取消',
  confirm: '确认',
  save: '保存',
  reset: '重置',
  loading: '加载中...',
  error: '错误',
  success: '成功',
  warning: '警告',
  info: '信息',

  // 应用标题
  appTitle: '专业 Node.js 管理器',
  appDescription: '专业的 Node.js 项目管理平台',

  // 导航
  nav: {
    settings: '设置',
    projects: '项目',
  },

  // 设置页面
  settings: {
    title: '设置',
    description: '管理应用程序首选项和配置',
    reset: '重置所有设置',
    app: {
      title: '应用设置',
      theme: '主题',
      themeDesc: '选择应用程序的外观主题',
      language: '语言',
      languageDesc: '设置应用程序界面语言',
      autoStart: '开机自启动',
      autoStartDesc: '系统启动时自动运行应用程序',
      devTools: '开发者工具',
      devToolsDesc: '切换开发者工具的开启状态（独立窗口）',
    },
    notifications: {
      title: '通知设置',
      projectStatus: '项目状态通知',
      projectStatusDesc: '当项目启动或停止时显示通知',
      errors: '错误通知',
      errorsDesc: '发生错误时显示通知',
    },
    projects: {
      title: '项目管理',
      defaultSettings: '默认设置',
      autoInstallDeps: '自动安装依赖',
      autoInstallDepsDesc: '创建新项目时自动运行 npm install',
      autoOpenBrowser: '自动打开浏览器',
      autoOpenBrowserDesc: '启动Web项目时自动在浏览器中打开',
      maxConcurrentProjects: '最大并发项目数',
      maxConcurrentProjectsDesc: '允许同时运行的项目数量上限',
      autoSaveInterval: '自动保存间隔',
      autoSaveIntervalDesc: '自动保存项目状态的时间间隔（秒）',
      showProjectThumbnails: '显示项目缩略图',
      showProjectThumbnailsDesc: '在项目列表中显示预览图片',
      gitIntegration: 'Git 集成',
      gitIntegrationDesc: '启用 Git 版本控制功能',
      dockerSupport: 'Docker 支持',
      dockerSupportDesc: '启用 Docker 容器化支持',
    },
    terminal: {
      title: '终端集成',
      enabled: '启用终端集成',
      enabledDesc: '在应用内嵌入终端功能',
      defaultShell: '默认Shell',
      defaultShellDesc: '选择默认的终端Shell',
      preserveHistory: '保留历史记录',
      preserveHistoryDesc: '保存并恢复终端命令历史',
    },
    monitoring: {
      title: '性能监控',
      enablePerformanceMonitoring: '启用性能监控',
      enablePerformanceMonitoringDesc: '实时监控项目的CPU和内存使用情况',
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
    },
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
      backupPathDesc: '备份文件的存储路径',
    },
    editor: {
      title: '编辑器集成',
      defaultEditor: '默认编辑器',
      defaultEditorDesc: '选择打开项目时使用的代码编辑器',
      customEditorCommand: '自定义编辑器命令',
      customEditorCommandDesc: '自定义编辑器的启动命令',
      openProjectOnCreate: '创建后自动打开',
      openProjectOnCreateDesc: '创建新项目后自动在编辑器中打开',
    },
    // 扩展的项目管理设置翻译
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
    // 通知设置扩展
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
    // 端口设置扩展
    portRange: {
      auto: '自动分配端口',
      autoDesc: '自动为新项目分配可用端口',
      express: 'Express端口范围',
      expressDesc: 'Express项目使用的端口范围',
      vite: 'Vite端口范围',
      viteDesc: 'Vite项目使用的端口范围',
      other: '其他端口范围',
      otherDesc: '其他类型项目使用的端口范围',
    },
  },

  // 日志
  logs: {
    noActiveProjects: '暂无活动项目',
    noActiveProjectsDesc: '启动项目后可在此查看日志',
    startHint: '点击项目的"启动"按钮开始',
  },

  // 项目管理  
  projects: {
    title: '项目',
    import: '导入项目',
    importing: '导入中',
    create: '创建项目',
    creating: '创建中',
    createNew: '快速创建项目',
    name: '项目名称',
    path: '项目路径',
    type: '项目类型',
    port: '端口',
    status: '项目状态',
    running: '运行中',
    stopped: '已停止',
    starting: '启动中',
    stopping: '停止中',
    empty: '暂无项目',
    emptyDesc: '还没有任何项目，开始创建第一个吧！',
    loading: '加载中...',
    
    // 创建项目相关
    createModal: {
      title: '创建新项目',
      basicInfo: '基本信息',
      projectName: '项目名称',
      projectNamePlaceholder: 'my-awesome-project',
      projectPath: '项目路径',
      projectPathPlaceholder: '/Users/yourname/projects',
      selectButton: '选择',
      portNumber: '端口号',
      portPlaceholder: '8000',
      portDesc: '默认从 8000 开始',
      
      projectTemplate: '项目模板',
      templates: {
        pureApi: {
          name: '🔌 Pure API Server',
          description: '纯后端 API 服务，专注于提供 RESTful API',
          features: ['Express.js 服务器', 'RESTful API', 'JSON 响应', 'CORS 支持', '中间件配置', '专注后端'],
        },
        staticApp: {
          name: '🌐 Static Website + API',
          description: '传统网站模式，静态文件服务 + Express API',
          features: ['Express.js 后端', '静态文件服务', 'HTML/CSS/JS', 'public 目录', '传统网站', '简单部署'],
        },
        fullStack: {
          name: '⚡ Full-Stack Application',
          description: '现代全栈应用，包含构建工具和前端框架',
          features: ['TypeScript 支持', 'Vite 构建工具', 'Express 后端', '热重载', 'API 代理', '现代前端框架'],
        }
      },
      
      frontendFramework: '前端框架',
      frameworks: {
        vanillaTs: {
          name: 'Vanilla TypeScript',
          description: '纯 TypeScript，无框架依赖'
        },
        react: {
          name: 'React',
          description: 'React 18 + TypeScript'
        },
        vue: {
          name: 'Vue',
          description: 'Vue 3 + TypeScript'
        }
      },
      
      packageManager: '包管理器',
      packageManagers: {
        npm: {
          name: 'npm',
          description: 'Node.js 默认包管理器，稳定可靠，广泛使用'
        },
        yarn: {
          name: 'Yarn',
          description: '快速、可靠、安全的依赖管理工具，支持工作区'
        },
        pnpm: {
          name: 'pnpm',
          description: '高效的磁盘空间利用，更快的安装速度'
        }
      },
      
      optionalTools: '可选工具',
      tools: {
        eslint: {
          name: 'ESLint',
          description: '代码质量检查'
        },
        prettier: {
          name: 'Prettier',
          description: '代码格式化'
        },
        jest: {
          name: 'Jest',
          description: '单元测试框架'
        },
        envConfig: {
          name: '.env 配置',
          description: '环境变量文件'
        },
        autoInstall: {
          name: '自动安装依赖',
          description: '创建后自动运行安装命令'
        },
        git: {
          name: 'Git 初始化',
          description: '初始化 Git 仓库'
        }
      },
      
      cancel: '取消',
      create: '创建项目',
      
      // 验证消息
      validation: {
        nameRequired: '项目名称不能为空',
        pathRequired: '项目路径不能为空',
        portRange: '端口号必须在 1000-65535 之间'
      }
    },
  },

  // 项目操作
  actions: {
    start: '启动',
    stop: '停止',
    restart: '重启',
    remove: '删除',
    openLogs: '查看日志',
    openInBrowser: '在浏览器中打开',
  },

  // 主题选项
  themes: {
    dark: '深色主题',
    light: '浅色主题',
  },

  // 语言选项
  languages: {
    zh: '中文',
    en: 'English',
  },

  // 通知消息
  messages: {
    settingsSaved: '设置已保存',
    settingsReset: '设置已重置为默认值',
    projectImported: '项目导入成功',
    projectCreated: '项目创建成功',
    projectStarted: '项目启动成功',
    projectStopped: '项目停止成功',
    projectRemoved: '项目已删除',
    importFailed: '导入失败',
    createFailed: '创建失败',
    startFailed: '启动失败',
    stopFailed: '停止失败',
    settingsLoadFailed: '设置加载失败',
    settingsSaveFailed: '设置保存失败',
  },

  // 项目创建
  create: {
    project: '创建项目',
    template: '项目模板',
    packageManager: '包管理器',
    frontendFramework: '前端框架',
    tools: '可选工具',
    eslint: 'ESLint - 代码质量检查',
    prettier: 'Prettier - 代码格式化',
    jest: 'Jest - 单元测试框架',
    envConfig: '.env 配置 - 环境变量配置',
    autoInstall: '自动安装依赖 - 创建后自动安装',
    gitInit: 'Git 初始化 - 初始化 Git 仓库',
  },
};

// 英文翻译
const en = {
  // Common
  cancel: 'Cancel',
  confirm: 'Confirm',
  save: 'Save',
  reset: 'Reset',
  loading: 'Loading...',
  error: 'Error',
  success: 'Success',
  warning: 'Warning',
  info: 'Info',

  // App Title
  appTitle: 'NodeHub Pro',
  appDescription: 'Professional Node.js Project Management Platform',

  // Navigation
  nav: {
    settings: 'Settings',
    projects: 'Projects',
  },

  // Settings Page
  settings: {
    title: 'Settings',
    description: 'Manage application preferences and configuration',
    reset: 'Reset All Settings',
    app: {
      title: 'App Settings',
      theme: 'Theme',
      themeDesc: 'Choose the appearance theme for the application',
      language: 'Language',
      languageDesc: 'Set the interface language of the application',
      autoStart: 'Auto Start on Boot',
      autoStartDesc: 'Automatically run the application when system starts',
      devTools: 'Developer Tools',
      devToolsDesc: 'Toggle developer tools (opens in detached window)',
    },
    notifications: {
      title: 'Notifications',
      projectStatus: 'Project Status Notifications',
      projectStatusDesc: 'Show notifications when projects start or stop',
      errors: 'Error Notifications',
      errorsDesc: 'Show notifications when errors occur',
    },
    projects: {
      title: 'Project Management',
      defaultSettings: 'Default Settings',
      autoInstallDeps: 'Auto Install Dependencies',
      autoInstallDepsDesc: 'Automatically run npm install when creating new projects',
      autoOpenBrowser: 'Auto Open Browser',
      autoOpenBrowserDesc: 'Automatically open browser when starting web projects',
      maxConcurrentProjects: 'Max Concurrent Projects',
      maxConcurrentProjectsDesc: 'Maximum number of projects that can run simultaneously',
      autoSaveInterval: 'Auto Save Interval',
      autoSaveIntervalDesc: 'Time interval for auto-saving project states (seconds)',
      showProjectThumbnails: 'Show Project Thumbnails',
      showProjectThumbnailsDesc: 'Display preview images in project list',
      gitIntegration: 'Git Integration',
      gitIntegrationDesc: 'Enable Git version control features',
      dockerSupport: 'Docker Support',
      dockerSupportDesc: 'Enable Docker containerization support',
    },
    terminal: {
      title: 'Terminal Integration',
      enabled: 'Enable Terminal Integration',
      enabledDesc: 'Enable embedded terminal functionality in the app',
      defaultShell: 'Default Shell',
      defaultShellDesc: 'Choose the default terminal shell',
      preserveHistory: 'Preserve History',
      preserveHistoryDesc: 'Save and restore terminal command history',
    },
    monitoring: {
      title: 'Performance Monitoring',
      enablePerformanceMonitoring: 'Enable Performance Monitoring',
      enablePerformanceMonitoringDesc: 'Real-time monitoring of CPU and memory usage',
      logRetentionDays: 'Log Retention Days',
      logRetentionDaysDesc: 'Number of days to keep log files',
      autoCleanupLogs: 'Auto Cleanup Logs',
      autoCleanupLogsDesc: 'Automatically delete expired log files',
      alertOnHighCPU: 'CPU Usage Alert',
      alertOnHighCPUDesc: 'Show alert when CPU usage is high',
      alertOnHighMemory: 'Memory Usage Alert',
      alertOnHighMemoryDesc: 'Show alert when memory usage is high',
      cpuThreshold: 'CPU Alert Threshold',
      cpuThresholdDesc: 'CPU usage threshold for alerts (percentage)',
      memoryThreshold: 'Memory Alert Threshold',
      memoryThresholdDesc: 'Memory usage threshold for alerts (MB)',
    },
    backup: {
      title: 'Project Backup',
      enabled: 'Enable Backup',
      enabledDesc: 'Enable backup functionality for project configs and code',
      autoBackup: 'Auto Backup',
      autoBackupDesc: 'Automatically backup projects periodically',
      backupInterval: 'Backup Interval',
      backupIntervalDesc: 'Time interval for automatic backups (hours)',
      maxBackups: 'Max Backups',
      maxBackupsDesc: 'Maximum number of backup files to keep',
      backupPath: 'Backup Path',
      backupPathDesc: 'Storage path for backup files',
    },
    editor: {
      title: 'Editor Integration',
      defaultEditor: 'Default Editor',
      defaultEditorDesc: 'Choose the code editor to use when opening projects',
      customEditorCommand: 'Custom Editor Command',
      customEditorCommandDesc: 'Custom command to launch your editor',
      openProjectOnCreate: 'Auto Open After Create',
      openProjectOnCreateDesc: 'Automatically open project in editor after creation',
    },
    // 扩展的项目管理设置翻译
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
    // 通知设置扩展
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
    // 端口设置扩展
    portRange: {
      auto: '自动分配端口',
      autoDesc: '自动为新项目分配可用端口',
      express: 'Express端口范围',
      expressDesc: 'Express项目使用的端口范围',
      vite: 'Vite端口范围',
      viteDesc: 'Vite项目使用的端口范围',
      other: '其他端口范围',
      otherDesc: '其他类型项目使用的端口范围',
    },
  },

  // 日志
  logs: {
    noActiveProjects: '暂无活动项目',
    noActiveProjectsDesc: '启动项目后可在此查看日志',
    startHint: '点击项目的"启动"按钮开始',
  },

  // 项目管理  
  projects: {
    title: '项目',
    import: '导入项目',
    importing: '导入中',
    create: '创建项目',
    creating: '创建中',
    createNew: '快速创建项目',
    name: '项目名称',
    path: '项目路径',
    type: '项目类型',
    port: '端口',
    status: '项目状态',
    running: '运行中',
    stopped: '已停止',
    starting: '启动中',
    stopping: '停止中',
    empty: '暂无项目',
    emptyDesc: '还没有任何项目，开始创建第一个吧！',
    loading: '加载中...',
    
    // 创建项目相关
    createModal: {
      title: '创建新项目',
      basicInfo: '基本信息',
      projectName: '项目名称',
      projectNamePlaceholder: 'my-awesome-project',
      projectPath: '项目路径',
      projectPathPlaceholder: '/Users/yourname/projects',
      selectButton: '选择',
      portNumber: '端口号',
      portPlaceholder: '8000',
      portDesc: '默认从 8000 开始',
      
      projectTemplate: '项目模板',
      templates: {
        pureApi: {
          name: '🔌 Pure API Server',
          description: '纯后端 API 服务，专注于提供 RESTful API',
          features: ['Express.js 服务器', 'RESTful API', 'JSON 响应', 'CORS 支持', '中间件配置', '专注后端'],
        },
        staticApp: {
          name: '🌐 Static Website + API',
          description: '传统网站模式，静态文件服务 + Express API',
          features: ['Express.js 后端', '静态文件服务', 'HTML/CSS/JS', 'public 目录', '传统网站', '简单部署'],
        },
        fullStack: {
          name: '⚡ Full-Stack Application',
          description: '现代全栈应用，包含构建工具和前端框架',
          features: ['TypeScript 支持', 'Vite 构建工具', 'Express 后端', '热重载', 'API 代理', '现代前端框架'],
        }
      },
      
      frontendFramework: '前端框架',
      frameworks: {
        vanillaTs: {
          name: 'Vanilla TypeScript',
          description: '纯 TypeScript，无框架依赖'
        },
        react: {
          name: 'React',
          description: 'React 18 + TypeScript'
        },
        vue: {
          name: 'Vue',
          description: 'Vue 3 + TypeScript'
        }
      },
      
      packageManager: '包管理器',
      packageManagers: {
        npm: {
          name: 'npm',
          description: 'Node.js 默认包管理器，稳定可靠，广泛使用'
        },
        yarn: {
          name: 'Yarn',
          description: '快速、可靠、安全的依赖管理工具，支持工作区'
        },
        pnpm: {
          name: 'pnpm',
          description: '高效的磁盘空间利用，更快的安装速度'
        }
      },
      
      optionalTools: '可选工具',
      tools: {
        eslint: {
          name: 'ESLint',
          description: '代码质量检查'
        },
        prettier: {
          name: 'Prettier',
          description: '代码格式化'
        },
        jest: {
          name: 'Jest',
          description: '单元测试框架'
        },
        envConfig: {
          name: '.env 配置',
          description: '环境变量文件'
        },
        autoInstall: {
          name: '自动安装依赖',
          description: '创建后自动运行安装命令'
        },
        git: {
          name: 'Git 初始化',
          description: '初始化 Git 仓库'
        }
      },
      
      cancel: '取消',
      create: '创建项目',
      
      // 验证消息
      validation: {
        nameRequired: '项目名称不能为空',
        pathRequired: '项目路径不能为空',
        portRange: '端口号必须在 1000-65535 之间'
      }
    },
  },

  // 项目操作
  actions: {
    start: '启动',
    stop: '停止',
    restart: '重启',
    remove: '删除',
    openLogs: '查看日志',
    openInBrowser: '在浏览器中打开',
  },

  // 主题选项
  themes: {
    dark: '深色主题',
    light: '浅色主题',
  },

  // 语言选项
  languages: {
    zh: '中文',
    en: 'English',
  },

  // 通知消息
  messages: {
    settingsSaved: '设置已保存',
    settingsReset: '设置已重置为默认值',
    projectImported: '项目导入成功',
    projectCreated: '项目创建成功',
    projectStarted: '项目启动成功',
    projectStopped: '项目停止成功',
    projectRemoved: '项目已删除',
    importFailed: '导入失败',
    createFailed: '创建失败',
    startFailed: '启动失败',
    stopFailed: '停止失败',
    settingsLoadFailed: '设置加载失败',
    settingsSaveFailed: '设置保存失败',
  },

  // 项目创建
  create: {
    project: '创建项目',
    template: '项目模板',
    packageManager: '包管理器',
    frontendFramework: '前端框架',
    tools: '可选工具',
    eslint: 'ESLint - 代码质量检查',
    prettier: 'Prettier - 代码格式化',
    jest: 'Jest - 单元测试框架',
    envConfig: '.env 配置 - 环境变量配置',
    autoInstall: '自动安装依赖 - 创建后自动安装',
    gitInit: 'Git 初始化 - 初始化 Git 仓库',
  },
};

// 翻译映射
const translations = { zh, en };

// 当前语言状态
let currentLanguage: 'zh' | 'en' = 'zh';

// 获取翻译文本的函数
export function t(key: string): string {
  const keys = key.split('.');
  let value: any = translations[currentLanguage];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // 如果找不到翻译，返回原始 key
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

// 设置语言
export function setLanguage(lang: 'zh' | 'en') {
  currentLanguage = lang;
}

// 获取当前语言
export function getCurrentLanguage() {
  return currentLanguage;
}

// 获取所有可用语言
export function getAvailableLanguages() {
  return Object.keys(translations);
}

// 创建国际化实例
export function createI18n() {
  return {
    t,
    setLanguage,
    getCurrentLanguage,
    getAvailableLanguages,
  };
}

// 国际化服务类（为了保持与现有代码的兼容性）
export class I18nService {
  static setLanguage(lang: 'zh' | 'en') {
    setLanguage(lang);
  }

  static getCurrentLanguage() {
    return getCurrentLanguage();
  }

  static t(key: string) {
    return t(key);
  }

  static getAvailableLanguages() {
    return [
      { code: 'zh', name: '中文' },
      { code: 'en', name: 'English' },
    ];
  }
}
