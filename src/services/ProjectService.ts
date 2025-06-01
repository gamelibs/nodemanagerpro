import type { Project, ProjectScript, FileSystemResult, ProjectCreationConfig, ProjectTemplate, ProjectCreationProgress } from '../types';
import { RendererFileSystemService } from './RendererFileSystemService';

// 模拟项目数据（作为初始数据和fallback）
const MOCK_PROJECTS: Project[] = [];

// 项目服务类
export class ProjectService {
  private static migrationDone = false;

  // 初始化服务 - 执行数据迁移
  static async initialize(): Promise<void> {
    if (this.migrationDone) return;

    try {
      console.log('🔄 初始化ProjectService并检查数据迁移...');
      await this.migrateFromLocalStorage();
      this.migrationDone = true;
      console.log('✅ ProjectService初始化完成');
    } catch (error) {
      console.error('❌ ProjectService初始化失败:', error);
    }
  }

  // 从localStorage迁移数据到文件系统
  private static async migrateFromLocalStorage(): Promise<void> {
    try {
      // 检查文件系统中是否已有数据
      const fileResult = await RendererFileSystemService.loadProjects();
      
      if (fileResult.success && fileResult.data && fileResult.data.length > 0) {
        console.log('📁 文件系统中已有项目数据，跳过迁移');
        return;
      }

      // 检查localStorage中是否有数据
      const localStorageKey = 'nodeAppManager_projects';
      const storedData = localStorage.getItem(localStorageKey);
      
      if (storedData) {
        try {
          const projects = JSON.parse(storedData);
          const migratedProjects = projects.map((p: any) => ({
            ...p,
            lastOpened: new Date(p.lastOpened)
          }));

          console.log(`🚚 发现localStorage中有 ${migratedProjects.length} 个项目，开始迁移...`);
          
          // 保存到文件系统
          const saveResult = await RendererFileSystemService.saveProjects(migratedProjects);
          
          if (saveResult.success) {
            console.log('✅ 数据迁移成功，清除localStorage');
            localStorage.removeItem(localStorageKey);
          } else {
            console.warn('⚠️ 文件系统保存失败，保留localStorage数据');
          }
        } catch (parseError) {
          console.error('❌ localStorage数据解析失败:', parseError);
        }
      } else {
        // 如果都没有数据，不自动创建测试项目，保持空状态
        console.log('📝 没有发现现有数据，保持空项目列表状态');
        // await RendererFileSystemService.saveProjects(MOCK_PROJECTS); // 已禁用自动创建测试数据
      }
    } catch (error) {
      console.error('❌ 数据迁移过程出错:', error);
    }
  }

  // 获取所有项目
  static async getAllProjects(): Promise<FileSystemResult> {
    try {
      await this.initialize();
      
      const result = await RendererFileSystemService.loadProjects();
      
      if (result.success) {
        return {
          success: true,
          data: result.data || []
        };
      } else {
        // 文件系统失败时，尝试从localStorage读取（降级方案）
        console.warn('⚠️ 文件系统读取失败，尝试localStorage降级方案');
        const fallbackProjects = this.loadProjectsFromLocalStorage();
        return {
          success: true,
          data: fallbackProjects
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取项目列表失败'
      };
    }
  }

  // 导入项目
  static async importProject(projectPath: string): Promise<FileSystemResult> {
    try {
      await this.initialize();
      
      console.log(`📥 开始导入项目: ${projectPath}`);
      
      // 真实检查项目信息
      const projectAnalysis = await this.analyzeProject(projectPath);
      
      const newProject: Project = {
        id: Date.now().toString(),
        name: projectAnalysis.name,
        path: projectPath,
        type: projectAnalysis.type,
        status: 'stopped',
        lastOpened: new Date(),
        packageManager: projectAnalysis.packageManager as 'npm' | 'yarn' | 'pnpm',
        scripts: projectAnalysis.scripts,
        description: projectAnalysis.description
      };

      // 只有在检测到端口时才设置端口
      if (projectAnalysis.port !== null) {
        newProject.port = projectAnalysis.port;
        console.log(`✅ 设置项目端口: ${projectAnalysis.port}`);
      } else {
        console.log(`⚠️ 未检测到端口配置，端口字段留空`);
      }

      // 使用文件系统服务保存
      const result = await RendererFileSystemService.addProject(newProject);
      
      if (result.success) {
        return {
          success: true,
          data: newProject
        };
      } else {
        // 降级到localStorage
        this.saveProjectToLocalStorage(newProject);
        return {
          success: true,
          data: newProject
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '导入项目失败'
      };
    }
  }

  // 移除项目
  static async removeProject(projectId: string): Promise<FileSystemResult> {
    try {
      await this.initialize();
      
      // 使用文件系统服务删除
      const result = await RendererFileSystemService.removeProject(projectId);
      
      if (result.success) {
        return {
          success: true,
          data: projectId
        };
      } else {
        // 降级到localStorage
        this.removeProjectFromLocalStorage(projectId);
        return {
          success: true,
          data: projectId
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '移除项目失败'
      };
    }
  }

  // 更新项目信息
  static async updateProject(projectId: string, updates: Partial<Project>): Promise<FileSystemResult> {
    try {
      await this.initialize();
      
      // 使用文件系统服务更新项目
      const result = await RendererFileSystemService.updateProject(projectId, updates);
      
      if (result.success) {
        return {
          success: true,
          data: result.data
        };
      } else {
        return {
          success: false,
          error: result.error || '更新项目失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新项目失败'
      };
    }
  }

  // 更新项目状态
  static async updateProjectStatus(projectId: string, status: Project['status']): Promise<FileSystemResult> {
    try {
      await this.initialize();
      
      // 使用文件系统服务更新
      const result = await RendererFileSystemService.updateProjectStatus(projectId, status);
      
      if (result.success) {
        return {
          success: true,
          data: { projectId, status }
        };
      } else {
        // 降级到localStorage（需要实现更复杂的逻辑）
        console.warn('⚠️ 文件系统更新失败，暂时跳过localStorage降级');
        return {
          success: false,
          error: '更新项目状态失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新项目状态失败'
      };
    }
  }

  // 启动项目
  static async startProject(project: Project, scriptName: string = 'start'): Promise<FileSystemResult> {
    try {
      // 模拟启动过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 在真实应用中，这里会通过 child_process 启动项目
      console.log(`🚀 启动项目: ${project.name} (${scriptName})`);
      
      // 更新项目状态
      await this.updateProjectStatus(project.id, 'running');
      
      return {
        success: true,
        data: { projectId: project.id, status: 'running' }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '启动项目失败'
      };
    }
  }

  // 停止项目
  static async stopProject(projectId: string): Promise<FileSystemResult> {
    try {
      // 模拟停止过程
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`⏹️ 停止项目: ${projectId}`);
      
      // 更新项目状态
      await this.updateProjectStatus(projectId, 'stopped');
      
      return {
        success: true,
        data: { projectId, status: 'stopped' }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '停止项目失败'
      };
    }
  }

  // 创建新项目
  static async createProject(projectConfig: ProjectCreationConfig, progressCallback?: ProjectCreationProgress): Promise<FileSystemResult> {
    try {
      await this.initialize();
      
      const onProgress = progressCallback?.onProgress || (() => {});
      
      onProgress(`🏗️ 开始创建项目: ${projectConfig.name}`);
      onProgress(`📍 路径: ${projectConfig.path}`);
      onProgress(`🎨 模板: ${projectConfig.template}`);
      
      // 模拟项目创建过程
      onProgress('⏳ 准备项目环境...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onProgress('📁 创建项目目录...', 'info');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 在真实应用中，这里会：
      // 1. 创建项目目录
      // 2. 复制模板文件
      // 3. 替换模板变量
      // 4. 安装依赖（如果启用）
      // 5. 初始化Git仓库（如果启用）
      
      const newProject: Project = {
        id: Date.now().toString(),
        name: projectConfig.name,
        path: projectConfig.path,
        type: this.mapTemplateToProjectType(projectConfig.template),
        status: 'stopped',
        port: projectConfig.port,
        lastOpened: new Date(),
        packageManager: projectConfig.packageManager,
        scripts: this.generateProjectScriptsFromTemplate(projectConfig),
        description: this.getTemplateDescription(projectConfig.template),
        version: '1.0.0',
        template: projectConfig.template,
        frontendFramework: projectConfig.frontendFramework
      };

      // 实际创建项目文件
      await this.createProjectFromTemplate(projectConfig, onProgress);

      // 使用文件系统服务保存
      onProgress('💾 保存项目配置...', 'info');
      const result = await RendererFileSystemService.addProject(newProject);
      
      if (result.success) {
        onProgress(`✅ 成功创建项目: ${newProject.name}`, 'success');
        return {
          success: true,
          data: newProject
        };
      } else {
        // 降级到localStorage
        this.saveProjectToLocalStorage(newProject);
        onProgress(`✅ 项目创建完成 (使用本地存储)`, 'success');
        return {
          success: true,
          data: newProject
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建项目失败';
      progressCallback?.onProgress?.(`❌ 创建失败: ${errorMessage}`, 'error');
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // 映射模板到项目类型
  private static mapTemplateToProjectType(template: ProjectTemplate): Project['type'] {
    switch (template) {
      case 'pure-api':
        return 'node';
      case 'static-app':
        return 'node';
      case 'full-stack':
        return 'node';
      default:
        return 'node';
    }
  }

  // 获取模板描述
  private static getTemplateDescription(template: ProjectTemplate): string {
    switch (template) {
      case 'pure-api':
        return '纯 API 后端服务，适合构建 RESTful API';
      case 'static-app':
        return '静态网站应用，适合构建纯前端页面';
      case 'full-stack':
        return '全栈应用，包含前端和后端完整解决方案';
      default:
        return '新创建的项目';
    }
  }

  // 根据模板生成项目脚本
  private static generateProjectScriptsFromTemplate(config: ProjectCreationConfig): ProjectScript[] {
    const pm = config.packageManager;
    
    switch (config.template) {
      case 'pure-api':
        return [
          { name: 'start', command: `${pm} start`, description: '启动生产服务器' },
          { name: 'dev', command: `${pm} run dev`, description: '启动开发服务器' },
          { name: 'build', command: `${pm} run build`, description: '构建项目' },
          { name: 'test', command: `${pm} test`, description: '运行测试' },
          ...(config.tools.eslint ? [{ name: 'lint', command: `${pm} run lint`, description: '代码检查' }] : []),
          ...(config.tools.prettier ? [{ name: 'format', command: `${pm} run format`, description: '代码格式化' }] : [])
        ];
      
      case 'static-app':
        return [
          { name: 'dev', command: `${pm} run dev`, description: '启动开发服务器' },
          { name: 'build', command: `${pm} run build`, description: '构建项目' },
          { name: 'start', command: `${pm} start`, description: '启动项目' },
          { name: 'test', command: `${pm} test`, description: '运行测试' },
          ...(config.tools.eslint ? [{ name: 'lint', command: `${pm} run lint`, description: '代码检查' }] : []),
          ...(config.tools.prettier ? [{ name: 'format', command: `${pm} run format`, description: '代码格式化' }] : [])
        ];
      
      case 'full-stack':
        return [
          { name: 'dev', command: `${pm} run dev`, description: '启动开发服务器（前后端）' },
          { name: 'dev:frontend', command: `${pm} run dev:frontend`, description: '仅启动前端开发服务器' },
          { name: 'dev:backend', command: `${pm} run dev:backend`, description: '仅启动后端开发服务器' },
          { name: 'build', command: `${pm} run build`, description: '构建前后端项目' },
          { name: 'build:frontend', command: `${pm} run build:frontend`, description: '构建前端项目' },
          { name: 'build:backend', command: `${pm} run build:backend`, description: '构建后端项目' },
          { name: 'start', command: `${pm} start`, description: '启动生产服务器' },
          { name: 'test', command: `${pm} test`, description: '运行测试' },
          ...(config.tools.eslint ? [{ name: 'lint', command: `${pm} run lint`, description: '代码检查' }] : []),
          ...(config.tools.prettier ? [{ name: 'format', command: `${pm} run format`, description: '代码格式化' }] : [])
        ];
      
      default:
        return [
          { name: 'start', command: `${pm} start`, description: '启动项目' },
          { name: 'dev', command: `${pm} run dev`, description: '开发模式启动' },
          { name: 'build', command: `${pm} run build`, description: '构建项目' },
          { name: 'test', command: `${pm} test`, description: '运行测试' }
        ];
    }
  }

  // 从模板创建项目文件
  private static async createProjectFromTemplate(config: ProjectCreationConfig, onProgress: (message: string, level?: 'info' | 'warn' | 'error' | 'success') => void): Promise<void> {
    try {
      onProgress(`📁 创建项目目录: ${config.path}`);
      
      // 调用实际的文件系统服务创建项目模板
      const result = await RendererFileSystemService.createProjectFromTemplate(config);
      
      if (!result.success) {
        throw new Error(result.error || '创建项目模板失败');
      }
      
      onProgress(`📋 复制 ${config.template} 模板文件`, 'success');
      onProgress(`🔧 配置项目设置`, 'success');
      
      if (config.tools.autoInstall) {
        onProgress(`📦 注意: 需要手动安装依赖 (${config.packageManager})`, 'info');
      }
      
      if (config.tools.git) {
        onProgress(`🌱 注意: 需要手动初始化 Git 仓库`, 'info');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建项目文件失败';
      onProgress(`❌ ${errorMessage}`, 'error');
      throw error;
    }
  }

  // 工具方法
  private static extractProjectName(projectPath: string): string {
    const parts = projectPath.split('/');
    return parts[parts.length - 1] || 'Unknown Project';
  }

  private static detectProjectType(projectPath: string): Project['type'] {
    // 在真实应用中，这里会检查 package.json 和其他文件
    // 模拟项目类型检测
    const pathLower = projectPath.toLowerCase();
    if (pathLower.includes('react')) return 'react';
    if (pathLower.includes('vue')) return 'vue';
    if (pathLower.includes('electron')) return 'electron';
    return 'node';
  }

  // 尝试从项目配置中检测端口（未来可以扩展为真正读取package.json）
  private static detectPortFromProject(_projectPath: string, _projectType: Project['type']): number | null {
    // 这里应该：
    // 1. 读取环境变量文件 (.env, .env.local)
    // 2. 检查配置文件 (vite.config.js, webpack.config.js 等)
    // 3. 检查 Docker 配置文件
    // 但由于需要文件系统访问，目前返回 null，表示未检测到
    
    console.log(`⚠️ detectPortFromProject: 暂未实现真实端口检测，返回 null`);
    return null;
  }

  // 获取数据存储信息（调试用）
  static async getStorageInfo(): Promise<{ fileSystem: any; localStorage: any }> {
    try {
      const fileSystemInfo = await RendererFileSystemService.getDataInfo();
      const localStorageData = this.loadProjectsFromLocalStorage();
      
      return {
        fileSystem: fileSystemInfo,
        localStorage: {
          hasData: !!localStorage.getItem('nodeAppManager_projects'),
          projectCount: localStorageData.length
        }
      };
    } catch (error) {
      return {
        fileSystem: { error: String(error) },
        localStorage: { error: 'Failed to access localStorage' }
      };
    }
  }

  // localStorage 辅助方法（降级方案）
  private static loadProjectsFromLocalStorage(): Project[] {
    try {
      const storedData = localStorage.getItem('nodeAppManager_projects');
      if (storedData) {
        const projects = JSON.parse(storedData);
        return projects.map((p: any) => ({
          ...p,
          lastOpened: new Date(p.lastOpened)
        }));
      }
      return MOCK_PROJECTS;
    } catch (error) {
      console.error('加载localStorage数据失败:', error);
      return MOCK_PROJECTS;
    }
  }

  private static saveProjectToLocalStorage(project: Project): void {
    try {
      const existingProjects = this.loadProjectsFromLocalStorage();
      const updatedProjects = [...existingProjects, project];
      localStorage.setItem('nodeAppManager_projects', JSON.stringify(updatedProjects));
    } catch (error) {
      console.error('保存项目到localStorage失败:', error);
    }
  }

  private static removeProjectFromLocalStorage(projectId: string): void {
    try {
      const existingProjects = this.loadProjectsFromLocalStorage();
      const filteredProjects = existingProjects.filter(p => p.id !== projectId);
      localStorage.setItem('nodeAppManager_projects', JSON.stringify(filteredProjects));
    } catch (error) {
      console.error('从localStorage删除项目失败:', error);
    }
  }

  // 为现有项目自动分配端口（如果没有端口）
  static async assignPortsToExistingProjects(): Promise<FileSystemResult> {
    try {
      await this.initialize();
      
      const result = await RendererFileSystemService.loadProjects();
      if (!result.success || !result.data) {
        return { success: false, error: '无法加载项目列表' };
      }
      
      // 不再自动分配端口，直接返回现有数据
      console.log('📝 不再自动分配端口，保持原有状态');
      return {
        success: true,
        data: { updatedCount: 0, projects: result.data }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '自动分配端口失败'
      };
    }
  }

  // 真实分析项目信息
  private static async analyzeProject(projectPath: string): Promise<{
    name: string;
    type: Project['type'];
    port: number | null;
    packageManager: string;
    scripts: ProjectScript[];
    description: string;
  }> {
    console.log(`🔍 开始分析项目: ${projectPath}`);
    
    // 1. 提取项目名称
    const name = this.extractProjectName(projectPath);
    console.log(`📁 项目名称: ${name}`);
    
    // 2. 尝试读取并分析 package.json
    let packageJson: any = null;
    let packageManager = 'npm';
    let scripts: ProjectScript[] = [];
    let description = '导入的项目';
    let detectedType: Project['type'] = 'node';
    let detectedPort: number | null = null;
    
    try {
      // 通过 IPC 调用主进程读取 package.json
      if (typeof window !== 'undefined' && window.electronAPI) {
        console.log('📄 尝试读取 package.json...');
        const result = await window.electronAPI.invoke('project:getPackageInfo', projectPath);
        
        if (result.success && result.data?.packageJson) {
          packageJson = result.data.packageJson;
          console.log('✅ 成功读取 package.json');
          
          // 分析 package.json 内容
          if (packageJson.description) {
            description = packageJson.description;
          }
          
          // 分析项目类型
          detectedType = this.analyzeProjectTypeFromPackageJson(packageJson);
          console.log(`🎯 检测到项目类型: ${detectedType}`);
          
          // 分析端口
          detectedPort = this.analyzePortFromPackageJson(packageJson, detectedType);
          console.log(`🔌 检测到端口: ${detectedPort}`);
          
          // 分析脚本
          scripts = this.analyzeScriptsFromPackageJson(packageJson);
          console.log(`📜 检测到 ${scripts.length} 个脚本`);
          
          // 检测包管理器
          packageManager = await this.detectPackageManager(projectPath);
          console.log(`📦 检测到包管理器: ${packageManager}`);
        } else {
          console.warn('⚠️ 无法读取 package.json，使用默认配置');
          // 如果没有 package.json，尝试其他方式检测类型
          detectedType = this.detectProjectType(projectPath);
          detectedPort = this.detectPortFromProject(projectPath, detectedType);
          scripts = [{ name: 'start', command: `${packageManager} start`, description: '启动项目' }];
        }
      } else {
        console.warn('⚠️ 不在 Electron 环境中，使用简单检测');
        detectedType = this.detectProjectType(projectPath);
        detectedPort = this.detectPortFromProject(projectPath, detectedType);
        scripts = [{ name: 'start', command: `${packageManager} start`, description: '启动项目' }];
      }
    } catch (error) {
      console.error('❌ 项目分析失败，使用默认配置:', error);
      detectedType = this.detectProjectType(projectPath);
      detectedPort = this.detectPortFromProject(projectPath, detectedType);
      scripts = [{ name: 'start', command: `${packageManager} start`, description: '启动项目' }];
    }
    
    return {
      name,
      type: detectedType,
      port: detectedPort,
      packageManager,
      scripts,
      description
    };
  }

  // 从 package.json 分析项目类型
  private static analyzeProjectTypeFromPackageJson(packageJson: any): Project['type'] {
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // 检查关键依赖
    if (dependencies.react) return 'react';
    if (dependencies.vue) return 'vue';
    if (dependencies.electron) return 'electron';
    if (dependencies.express || dependencies.fastify || dependencies.koa) return 'pure-api';
    if (dependencies.vite && (dependencies.react || dependencies.vue)) return 'full-stack';
    if (packageJson.type === 'module' || dependencies.vite) return 'node';
    
    // 检查脚本
    const scripts = packageJson.scripts || {};
    if (scripts.dev && scripts.build) return 'full-stack';
    if (scripts.start && !scripts.build) return 'pure-api';
    
    return 'node';
  }

  // 从 package.json 分析端口
  private static analyzePortFromPackageJson(packageJson: any, _projectType: Project['type']): number | null {
    const scripts = packageJson.scripts || {};
    
    // 从启动脚本中查找端口配置
    for (const [, command] of Object.entries(scripts)) {
      if (typeof command === 'string') {
        // 查找 --port 参数
        const portMatch = command.match(/--port[=\s]+(\d+)/);
        if (portMatch) {
          const port = parseInt(portMatch[1]);
          console.log(`🔌 从启动脚本中检测到端口: ${port}`);
          return port;
        }
        
        // 查找环境变量 PORT
        const envPortMatch = command.match(/PORT[=]\s*(\d+)/);
        if (envPortMatch) {
          const port = parseInt(envPortMatch[1]);
          console.log(`🔌 从环境变量中检测到端口: ${port}`);
          return port;
        }
        
        // 查找 Vite 默认开发端口
        if (command.includes('vite') && !command.includes('--port')) {
          console.log(`🔌 检测到 Vite 项目，使用默认端口: 5173`);
          return 5173;
        }
        
        // 查找 Next.js 默认端口
        if (command.includes('next dev') && !command.includes('--port')) {
          console.log(`🔌 检测到 Next.js 项目，使用默认端口: 3000`);
          return 3000;
        }
      }
    }
    
    // 检查 devDependencies 和 dependencies 中的框架
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps['vite'] || deps['@vitejs/plugin-react'] || deps['@vitejs/plugin-vue']) {
      console.log(`🔌 检测到 Vite 依赖，使用默认端口: 5173`);
      return 5173;
    }
    
    if (deps['next']) {
      console.log(`🔌 检测到 Next.js 依赖，使用默认端口: 3000`);
      return 3000;
    }
    
    // 如果没找到明确的端口配置，返回 null
    console.log(`⚠️ 未检测到明确的端口配置`);
    return null;
  }

  // 从 package.json 分析脚本
  private static analyzeScriptsFromPackageJson(packageJson: any): ProjectScript[] {
    const scripts = packageJson.scripts || {};
    const result: ProjectScript[] = [];
    
    // 常见脚本映射
    const scriptDescriptions: Record<string, string> = {
      start: '启动项目',
      dev: '开发模式',
      build: '构建项目',
      test: '运行测试',
      lint: '代码检查',
      serve: '预览构建',
      preview: '预览构建'
    };
    
    for (const [name, command] of Object.entries(scripts)) {
      if (typeof command === 'string') {
        result.push({
          name,
          command: `npm run ${name}`,
          description: scriptDescriptions[name] || `运行 ${name}`
        });
      }
    }
    
    // 如果没有脚本，添加默认的
    if (result.length === 0) {
      result.push({ name: 'start', command: 'npm start', description: '启动项目' });
    }
    
    return result;
  }

  // 检测包管理器
  private static async detectPackageManager(projectPath: string): Promise<string> {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        // 检查锁文件存在性
        const checks = [
          { file: 'pnpm-lock.yaml', manager: 'pnpm' },
          { file: 'yarn.lock', manager: 'yarn' },
          { file: 'package-lock.json', manager: 'npm' }
        ];
        
        for (const check of checks) {
          try {
            const result = await window.electronAPI.invoke('fs:validateDirectory', `${projectPath}/${check.file}`);
            if (result?.exists) {
              return check.manager;
            }
          } catch (error) {
            // 继续检查下一个
          }
        }
      }
    } catch (error) {
      console.warn('检测包管理器失败:', error);
    }
    
    return 'npm'; // 默认使用 npm
  }
}
