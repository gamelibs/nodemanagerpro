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
      
      // 模拟文件系统检查
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 在真实应用中，这里会：
      // 1. 检查路径是否存在
      // 2. 读取 package.json
      // 3. 分析项目类型
      // 4. 创建项目配置
      
      const projectType = this.detectProjectType(projectPath);
      const detectedPort = this.detectPortFromProject(projectPath, projectType);
      
      const newProject: Project = {
        id: Date.now().toString(),
        name: this.extractProjectName(projectPath),
        path: projectPath,
        type: projectType,
        status: 'stopped',
        port: detectedPort,
        lastOpened: new Date(),
        packageManager: 'npm',
        scripts: [
          { name: 'start', command: 'npm start', description: '启动项目' },
        ],
        description: '导入的项目'
      };

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
  private static detectPortFromProject(projectPath: string, projectType: Project['type']): number {
    // 在真实应用中，这里会：
    // 1. 读取 package.json 中的 scripts
    // 2. 检查环境变量文件 (.env)
    // 3. 检查配置文件 (vite.config.js, webpack.config.js 等)
    // 4. 根据项目类型和命名推测端口
    
    const pathLower = projectPath.toLowerCase();
    
    // 根据项目名称或路径推测端口
    if (pathLower.includes('api') || pathLower.includes('server') || pathLower.includes('backend')) {
      return 8000;
    }
    
    if (pathLower.includes('frontend') || pathLower.includes('client') || pathLower.includes('web')) {
      return 3000;
    }
    
    if (pathLower.includes('admin')) {
      return 9000;
    }
    
    // 检查端口号是否在路径中
    const portMatch = projectPath.match(/(\d{4,5})/);
    if (portMatch) {
      const detectedPort = parseInt(portMatch[1]);
      if (detectedPort >= 1000 && detectedPort <= 65535) {
        return detectedPort;
      }
    }
    
    // 返回类型默认端口
    return this.getDefaultPortForType(projectType);
  }

  // 根据项目类型获取默认端口
  private static getDefaultPortForType(projectType: Project['type']): number {
    switch (projectType) {
      case 'react':
        return 3000;
      case 'vue':
        return 8080;
      case 'pure-api':
        return 8000;
      case 'static-app':
        return 3000;
      case 'full-stack':
        return 5173;
      case 'node':
        return 5000;
      case 'electron':
        return 3000;
      case 'other':
      default:
        return 8000;
    }
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
      
      let updatedCount = 0;
      const updatedProjects = result.data.map((project: Project) => {
        if (!project.port) {
          updatedCount++;
          return {
            ...project,
            port: this.detectPortFromProject(project.path, project.type)
          };
        }
        return project;
      });
      
      if (updatedCount > 0) {
        const saveResult = await RendererFileSystemService.saveProjects(updatedProjects);
        if (saveResult.success) {
          console.log(`✅ 为 ${updatedCount} 个项目自动分配了端口号`);
          return {
            success: true,
            data: { updatedCount, projects: updatedProjects }
          };
        } else {
          return { success: false, error: '保存更新失败' };
        }
      } else {
        console.log('📝 所有项目都已有端口号，无需更新');
        return {
          success: true,
          data: { updatedCount: 0, projects: result.data }
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '自动分配端口失败'
      };
    }
  }
}
