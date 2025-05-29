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
    about: {
      title: '关于',
      description: '现代化的Node.js项目管理工具',
      features1: '一键启动和停止Node.js项目',
      features2: '实时日志监控和项目状态管理',
      techStack: '技术栈',
    },
    debugTools: {
      title: '开发者调试工具',
      description: '仅在开发模式下可用的调试功能',
      hotReload: '热重载测试',
      hotReloadDesc: '测试热重载功能和计数器状态保持',
      ipcTest: 'IPC 通信测试',
      ipcTestDesc: '测试主进程与渲染进程间的通信',
      storageInfo: '存储状态调试',
      storageInfoDesc: '查看项目数据存储状态和目录信息',
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
    about: {
      title: 'About',
      description: 'Modern Node.js project management tool',
      features1: 'One-click start and stop Node.js projects',
      features2: 'Real-time log monitoring and project status management',
      techStack: 'Tech Stack',
    },
    debugTools: {
      title: 'Developer Debug Tools',
      description: 'Debugging features available only in development mode',
      hotReload: 'Hot Reload Test',
      hotReloadDesc: 'Test hot reload functionality and counter state persistence',
      ipcTest: 'IPC Communication Test',
      ipcTestDesc: 'Test communication between main and renderer processes',
      storageInfo: 'Storage State Debug',
      storageInfoDesc: 'View project data storage state and directory information',
    },
  },

  // Logs
  logs: {
    noActiveProjects: 'No Active Projects',
    noActiveProjectsDesc: 'Start a project to view logs here',
    startHint: 'Click the "Start" button on a project to begin',
  },

  // Project Management
  projects: {
    title: 'Projects',
    import: 'Import Project',
    importing: 'Importing',
    create: 'Create Project',
    creating: 'Creating',
    createNew: 'Quick Create Project',
    name: 'Project Name',
    path: 'Project Path',
    type: 'Project Type',
    port: 'Port',
    status: 'Status',
    running: 'Running',
    stopped: 'Stopped',
    starting: 'Starting',
    stopping: 'Stopping',
    empty: 'No Projects',
    emptyDesc: 'No projects yet, start by creating your first one!',
    loading: 'Loading...',
    
    // Create project modal
    createModal: {
      title: 'Create New Project',
      basicInfo: 'Basic Information',
      projectName: 'Project Name',
      projectNamePlaceholder: 'my-awesome-project',
      projectPath: 'Project Path',
      projectPathPlaceholder: '/Users/yourname/projects',
      selectButton: 'Select',
      portNumber: 'Port Number',
      portPlaceholder: '8000',
      portDesc: 'Default starts from 8000',
      
      projectTemplate: 'Project Template',
      templates: {
        pureApi: {
          name: '🔌 Pure API Server',
          description: 'Pure backend API service, focused on providing RESTful APIs',
          features: ['Express.js Server', 'RESTful API', 'JSON Response', 'CORS Support', 'Middleware Config', 'Backend Focus'],
        },
        staticApp: {
          name: '🌐 Static Website + API',
          description: 'Traditional website mode, static file serving + Express API',
          features: ['Express.js Backend', 'Static File Serving', 'HTML/CSS/JS', 'Public Directory', 'Traditional Website', 'Simple Deployment'],
        },
        fullStack: {
          name: '⚡ Full-Stack Application',
          description: 'Modern full-stack application with build tools and frontend framework',
          features: ['TypeScript Support', 'Vite Build Tool', 'Express Backend', 'Hot Reload', 'API Proxy', 'Modern Frontend Framework'],
        }
      },
      
      frontendFramework: 'Frontend Framework',
      frameworks: {
        vanillaTs: {
          name: 'Vanilla TypeScript',
          description: 'Pure TypeScript, no framework dependencies'
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
      
      packageManager: 'Package Manager',
      packageManagers: {
        npm: {
          name: 'npm',
          description: 'Node.js default package manager, stable and reliable, widely used'
        },
        yarn: {
          name: 'Yarn',
          description: 'Fast, reliable, secure dependency management tool with workspace support'
        },
        pnpm: {
          name: 'pnpm',
          description: 'Efficient disk space usage and faster installation speed'
        }
      },
      
      optionalTools: 'Optional Tools',
      tools: {
        eslint: {
          name: 'ESLint',
          description: 'Code quality checking'
        },
        prettier: {
          name: 'Prettier',
          description: 'Code formatting'
        },
        jest: {
          name: 'Jest',
          description: 'Unit testing framework'
        },
        envConfig: {
          name: '.env Configuration',
          description: 'Environment variables file'
        },
        autoInstall: {
          name: 'Auto Install Dependencies',
          description: 'Automatically run install command after creation'
        },
        git: {
          name: 'Git Initialization',
          description: 'Initialize Git repository'
        }
      },
      
      cancel: 'Cancel',
      create: 'Create Project',
      
      // Validation messages
      validation: {
        nameRequired: 'Project name cannot be empty',
        pathRequired: 'Project path cannot be empty',
        portRange: 'Port number must be between 1000-65535'
      }
    },
  },

  // Project Actions
  actions: {
    start: 'Start',
    stop: 'Stop',
    restart: 'Restart',
    remove: 'Remove',
    openLogs: 'View Logs',
    openInBrowser: 'Open in Browser',
  },

  // Theme Options
  themes: {
    dark: 'Dark Theme',
    light: 'Light Theme',
  },

  // Language Options
  languages: {
    zh: '中文',
    en: 'English',
  },

  // Notification Messages
  messages: {
    settingsSaved: 'Settings saved',
    settingsReset: 'Settings reset to defaults',
    projectImported: 'Project imported successfully',
    projectCreated: 'Project created successfully',
    projectStarted: 'Project started successfully',
    projectStopped: 'Project stopped successfully',
    projectRemoved: 'Project removed',
    importFailed: 'Import failed',
    createFailed: 'Create failed',
    startFailed: 'Start failed',
    stopFailed: 'Stop failed',
    settingsLoadFailed: 'Failed to load settings',
    settingsSaveFailed: 'Failed to save settings',
  },

  // Project Creation
  create: {
    project: 'Create Project',
    template: 'Project Template',
    packageManager: 'Package Manager',
    frontendFramework: 'Frontend Framework',
    tools: 'Optional Tools',
    eslint: 'ESLint - Code quality checking',
    prettier: 'Prettier - Code formatting',
    jest: 'Jest - Unit testing framework',
    envConfig: '.env Config - Environment variables configuration',
    autoInstall: 'Auto Install Dependencies - Install after creation',
    gitInit: 'Git Init - Initialize Git repository',
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
