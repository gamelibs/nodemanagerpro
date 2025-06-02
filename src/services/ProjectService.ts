import type { Project, ProjectScript, FileSystemResult, ProjectCreationConfig, ProjectTemplate, ProjectCreationProgress, CoreProject } from '../types';
import { RendererFileSystemService } from './RendererFileSystemService';
import { ProjectValidationService } from './ProjectValidationService';
import { PM2Service } from './PM2Service';

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

  // 获取所有项目（带动态配置检测）
  static async getAllProjects(): Promise<FileSystemResult> {
    try {
      await this.initialize();
      
      // 首先加载核心项目信息
      const coreResult = await RendererFileSystemService.loadProjects();
      
      if (coreResult.success && coreResult.data) {
        console.log(`📂 加载了 ${coreResult.data.length} 个核心项目信息`);
        
        // 如果在渲染进程中，不能直接使用文件系统操作，需要通过IPC
        // 这里我们返回核心项目信息，配置检测将在需要时进行
        return {
          success: true,
          data: coreResult.data
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

  // 导入项目 - 现在包含完整验证和PM2状态同步
  static async importProject(
    projectPath: string, 
    onProgress?: (message: string, level?: 'info' | 'warn' | 'error' | 'success') => void
  ): Promise<FileSystemResult> {
    try {
      await this.initialize();
      
      console.log(`📥 开始导入项目: ${projectPath}`);
      onProgress?.(`📥 开始导入项目: ${projectPath}`, 'info');
      
      // 首先分析项目信息以获得项目名称
      onProgress?.('📋 正在分析项目结构...', 'info');
      const projectAnalysis = await this.analyzeProject(projectPath);
      
      // 生成稳定的项目ID
      const stableId = PM2Service.generateStableProjectId(projectAnalysis.name, projectPath);
      console.log(`🆔 生成稳定项目ID: ${stableId} (基于: ${projectAnalysis.name} + ${projectPath})`);
      
      // 检查PM2中是否存在该项目的进程
      onProgress?.('🔍 检查是否存在PM2进程...', 'info');
      const pm2SyncResult = await PM2Service.checkAndSyncPM2Status(projectAnalysis.name, projectPath);
      
      // 根据PM2检查结果显示通知
      if (pm2SyncResult.exists) {
        onProgress?.(`🔄 ${pm2SyncResult.message}`, pm2SyncResult.status === 'running' ? 'success' : 'warn');
        console.log(`🔄 PM2同步: ${pm2SyncResult.message}`, pm2SyncResult);
      } else {
        onProgress?.('ℹ️ 未发现现有PM2进程，项目将作为新项目导入', 'info');
        console.log('ℹ️ 未发现现有PM2进程');
      }
      
      // 使用 ProjectValidationService 进行综合验证
      onProgress?.('🔍 正在验证项目配置...', 'info');
      
      // 创建项目对象，使用稳定ID
      const newProject: Project = {
        id: stableId, // 使用稳定ID替代随机ID
        name: projectAnalysis.name,
        path: projectPath,
        lastOpened: new Date(),
        // 根据PM2同步结果设置初始状态
        status: pm2SyncResult.exists ? pm2SyncResult.status || 'stopped' : 'stopped',
        port: projectAnalysis.port || undefined, // 保存检测到的端口
        // 动态检测的信息
        type: projectAnalysis.type,
        packageManager: projectAnalysis.packageManager as 'npm' | 'yarn' | 'pnpm',
        scripts: projectAnalysis.scripts,
        description: projectAnalysis.description
      };

      // 执行综合验证
      const validationResult = await ProjectValidationService.validateProject(newProject, onProgress);
      
      if (!validationResult.success) {
        onProgress?.(`❌ 项目验证失败: ${validationResult.error}`, 'error');
        // 即使验证失败，仍然尝试导入项目，但记录警告
        console.warn('⚠️ 项目验证失败，但继续导入:', validationResult.error);
      }

      // 记录检测到的项目信息
      if (projectAnalysis.port !== null) {
        onProgress?.(`✅ 检测到项目端口: ${projectAnalysis.port}`, 'success');
        console.log(`✅ 检测到项目端口: ${projectAnalysis.port} (不保存，仅用于显示)`);
      } else {
        onProgress?.('⚠️ 未检测到端口配置', 'warn');
        console.log(`⚠️ 未检测到端口配置`);
      }

      // 记录PM2同步结果和验证结果
      if (validationResult.success && validationResult.data) {
        onProgress?.('✅ 项目验证通过', 'success');
        
        // 优先显示PM2同步状态（更准确）
        if (pm2SyncResult.exists) {
          console.log(`📊 PM2状态同步: ${pm2SyncResult.status} (来源: PM2进程检测)`);
          // 已在前面显示过PM2同步消息，这里不重复显示
        } else if (validationResult.data.pm2Status?.isRunning) {
          onProgress?.('ℹ️ 检测到其他运行状态（非PM2）', 'info');
          console.log('📊 非PM2状态检测: 运行中');
        } else {
          console.log('📊 项目状态: 已停止');
        }
        
        // 记录完整的检测结果
        console.log('📊 导入总结:', {
          stableId: newProject.id,
          hasPackageJson: validationResult.data.configuration?.hasPackageJson,
          pm2Sync: pm2SyncResult,
          detectedType: newProject.type,
          detectedPort: projectAnalysis.port,
          note: '状态信息不保存，每次打开时重新检测'
        });
      } else {
        // 验证失败时记录但不影响导入
        onProgress?.('⚠️ 项目验证失败，运行时将重新检测状态', 'warn');
        console.log('📊 验证失败，运行时将重新检测所有状态信息');
        console.log('📊 导入总结 (验证失败):', {
          stableId: newProject.id,
          pm2Sync: pm2SyncResult,
          note: '验证失败，状态信息需要后续重新检测'
        });
      }

      // 使用文件系统服务保存（只保存核心信息）
      onProgress?.('💾 正在保存项目配置...', 'info');
      const coreProject = {
        id: newProject.id,
        name: newProject.name,
        path: newProject.path,
        lastOpened: newProject.lastOpened
      };
      const result = await RendererFileSystemService.addProject(coreProject);
      
      if (result.success) {
        onProgress?.(`✅ 项目导入成功: ${newProject.name}`, 'success');
        return {
          success: true,
          data: newProject
        };
      } else {
        // 降级到localStorage
        this.saveProjectToLocalStorage(newProject);
        onProgress?.(`✅ 项目导入成功 (使用本地存储): ${newProject.name}`, 'success');
        return {
          success: true,
          data: newProject
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '导入项目失败';
      onProgress?.(`❌ 导入失败: ${errorMessage}`, 'error');
      return {
        success: false,
        error: errorMessage
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

  // 创建新项目 - 现在使用稳定ID
  static async createProject(projectConfig: ProjectCreationConfig, progressCallback?: ProjectCreationProgress): Promise<FileSystemResult> {
    try {
      await this.initialize();
      
      const onProgress = progressCallback?.onProgress || (() => {});
      
      onProgress(`🏗️ 开始创建项目: ${projectConfig.name}`);
      onProgress(`📍 路径: ${projectConfig.path}`);
      onProgress(`🎨 模板: ${projectConfig.template}`);
      
      // 生成稳定的项目ID
      const stableId = PM2Service.generateStableProjectId(projectConfig.name, projectConfig.path);
      console.log(`🆔 生成稳定项目ID: ${stableId} (基于: ${projectConfig.name} + ${projectConfig.path})`);
      onProgress(`🆔 生成项目ID: ${stableId}`, 'info');
      
      // 检查PM2中是否存在该项目的进程
      onProgress('🔍 检查现有PM2进程...', 'info');
      const pm2SyncResult = await PM2Service.checkAndSyncPM2Status(projectConfig.name, projectConfig.path);
      
      // 根据PM2检查结果显示通知
      if (pm2SyncResult.exists) {
        onProgress(`🔄 ${pm2SyncResult.message}`, pm2SyncResult.status === 'running' ? 'warn' : 'info');
        console.log(`🔄 PM2同步 (创建项目): ${pm2SyncResult.message}`, pm2SyncResult);
      } else {
        onProgress('ℹ️ 未发现现有PM2进程，将创建新项目', 'info');
        console.log('ℹ️ 创建项目时未发现现有PM2进程');
      }
      
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
        id: stableId, // 使用稳定ID替代随机ID
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

      // 使用文件系统服务保存（只保存核心信息）
      onProgress('💾 保存项目配置...', 'info');
      const coreProject: CoreProject = {
        id: newProject.id,
        name: newProject.name,
        path: newProject.path,
        lastOpened: newProject.lastOpened
      };
      const result = await RendererFileSystemService.addProject(coreProject);
      
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

  // 尝试从项目配置文件中检测端口
  private static async detectPortFromProject(projectPath: string, _projectType: Project['type']): Promise<number | null> {
    try {
      // 1. 检查 .env 文件
      const envFiles = ['.env', '.env.local', '.env.development', '.env.dev'];
      for (const envFile of envFiles) {
        try {
          const envPath = `${projectPath}/${envFile}`;
          const envResult = await window.electronAPI?.invoke('fs:readFile', envPath);
          if (envResult?.success && envResult.content) {
            const portMatch = envResult.content.match(/PORT\s*=\s*(\d+)/);
            if (portMatch) {
              const port = parseInt(portMatch[1]);
              console.log(`🔌 从 ${envFile} 中检测到端口: ${port}`);
              return port;
            }
          }
        } catch (e) {
          // 文件不存在，继续检查下一个
        }
      }

      // 2. 检查 vite.config.js/ts
      const viteConfigs = ['vite.config.js', 'vite.config.ts'];
      for (const configFile of viteConfigs) {
        try {
          const configPath = `${projectPath}/${configFile}`;
          const configResult = await window.electronAPI?.invoke('fs:readFile', configPath);
          if (configResult?.success && configResult.content) {
            // 查找 server.port 配置
            const portMatch = configResult.content.match(/port:\s*(\d+)/);
            if (portMatch) {
              const port = parseInt(portMatch[1]);
              console.log(`🔌 从 ${configFile} 中检测到端口: ${port}`);
              return port;
            }
          }
        } catch (e) {
          // 文件不存在，继续检查下一个
        }
      }

      // 3. 检查 next.config.js 
      try {
        const nextConfigPath = `${projectPath}/next.config.js`;
        const nextConfigResult = await window.electronAPI?.invoke('fs:readFile', nextConfigPath);
        if (nextConfigResult?.success && nextConfigResult.content) {
          // Next.js 端口通常在启动命令中指定，配置文件中较少
          console.log(`🔌 检测到 Next.js 配置文件，但未找到端口配置`);
        }
      } catch (e) {
        // 文件不存在
      }

      console.log(`⚠️ 未在项目配置文件中找到端口配置`);
      return null;
    } catch (error) {
      console.error('❌ 检测项目端口配置时发生错误:', error);
      return null;
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
          
          // 分析端口 - 先从 package.json 检测，然后再检查配置文件
          detectedPort = this.analyzePortFromPackageJson(packageJson, detectedType);
          if (detectedPort === null) {
            // 如果 package.json 中没有找到端口，尝试从配置文件中检测
            detectedPort = await this.detectPortFromProject(projectPath, detectedType);
          }
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
          detectedPort = await this.detectPortFromProject(projectPath, detectedType);
          scripts = [{ name: 'start', command: `${packageManager} start`, description: '启动项目' }];
        }
      } else {
        console.warn('⚠️ 不在 Electron 环境中，使用简单检测');
        detectedType = this.detectProjectType(projectPath);
        detectedPort = await this.detectPortFromProject(projectPath, detectedType);
        scripts = [{ name: 'start', command: `${packageManager} start`, description: '启动项目' }];
      }
    } catch (error) {
      console.error('❌ 项目分析失败，使用默认配置:', error);
      detectedType = this.detectProjectType(projectPath);
      detectedPort = await this.detectPortFromProject(projectPath, detectedType);
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
          console.log(`🔌 从启动脚本中检测到明确的端口配置: ${port}`);
          return port;
        }
        
        // 查找环境变量 PORT
        const envPortMatch = command.match(/PORT[=]\s*(\d+)/);
        if (envPortMatch) {
          const port = parseInt(envPortMatch[1]);
          console.log(`🔌 从环境变量中检测到明确的端口配置: ${port}`);
          return port;
        }
        
        // 查找其他端口配置模式 (如 -p, --port)
        const portShortMatch = command.match(/-p\s+(\d+)/);
        if (portShortMatch) {
          const port = parseInt(portShortMatch[1]);
          console.log(`🔌 从启动脚本中检测到端口配置(-p): ${port}`);
          return port;
        }
      }
    }
    
    // 不再基于框架推断默认端口，只返回明确配置的端口
    console.log(`⚠️ 未在项目配置中检测到明确的端口设置，端口信息留空`);
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

  // 获取带完整配置的项目（通过IPC调用配置检测）
  static async getProjectWithConfig(coreProject: CoreProject): Promise<Project | null> {
    try {
      // 通过IPC调用主进程的配置检测服务
      if (typeof window !== 'undefined' && window.electronAPI) {
        const result = await window.electronAPI.invoke('project:detectConfig', coreProject);
        if (result.success && result.data) {
          return result.data;
        }
      }
      
      // 如果IPC失败，返回基本的项目对象
      console.warn('⚠️ 配置检测失败，返回基本项目信息');
      return {
        ...coreProject,
        type: 'other',
        packageManager: 'npm',
        scripts: []
      };
    } catch (error) {
      console.error('❌ 获取项目配置失败:', error);
      return null;
    }
  }

  // 批量获取带完整配置的项目
  static async getAllProjectsWithConfig(): Promise<FileSystemResult> {
    try {
      // 首先获取核心项目信息
      const coreResult = await this.getAllProjects();
      
      if (!coreResult.success || !coreResult.data) {
        return coreResult;
      }

      console.log(`🔍 开始为 ${coreResult.data.length} 个项目检测配置...`);
      
      // 通过IPC批量检测配置
      if (typeof window !== 'undefined' && window.electronAPI) {
        const result = await window.electronAPI.invoke('project:detectMultipleConfigs', coreResult.data);
        if (result.success && result.data) {
          console.log(`✅ 成功检测了 ${result.data.length} 个项目的配置`);
          return {
            success: true,
            data: result.data
          };
        }
      }

      // IPC失败时的降级方案
      console.warn('⚠️ 批量配置检测失败，返回基本项目信息');
      const basicProjects = coreResult.data.map((coreProject: CoreProject): Project => ({
        ...coreProject,
        type: 'other',
        packageManager: 'npm',
        scripts: []
        // 不再强制设置默认 status，让UI层处理
      }));

      return {
        success: true,
        data: basicProjects
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取项目配置失败'
      };
    }
  }
}
