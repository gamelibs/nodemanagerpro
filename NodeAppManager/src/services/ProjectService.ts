import type { Project, ProjectScript, FileSystemResult } from '../types';
import { RendererFileSystemService } from './RendererFileSystemService';

// 模拟项目数据（作为初始数据和fallback）
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'My React App',
    path: '/Users/example/my-react-app',
    type: 'react',
    status: 'stopped',
    port: 3000,
    lastOpened: new Date('2024-05-20'),
    packageManager: 'npm',
    scripts: [
      { name: 'start', command: 'npm start', description: '启动开发服务器' },
      { name: 'build', command: 'npm run build', description: '构建生产版本' },
      { name: 'test', command: 'npm test', description: '运行测试' },
    ],
    description: 'A modern React application with TypeScript',
    version: '1.0.0'
  },
  {
    id: '2',
    name: 'Node API Server',
    path: '/Users/example/node-api',
    type: 'node',
    status: 'running',
    port: 5000,
    lastOpened: new Date('2024-05-25'),
    packageManager: 'npm',
    scripts: [
      { name: 'start', command: 'npm start', description: '启动服务器' },
      { name: 'dev', command: 'npm run dev', description: '开发模式启动' },
      { name: 'test', command: 'npm test', description: '运行测试' },
    ],
    description: 'RESTful API server with Express.js',
    version: '2.1.0'
  },
  {
    id: '3',
    name: 'Vue Dashboard',
    path: '/Users/example/vue-dashboard',
    type: 'vue',
    status: 'stopped',
    port: 8080,
    lastOpened: new Date('2024-05-18'),
    packageManager: 'yarn',
    scripts: [
      { name: 'serve', command: 'yarn serve', description: '启动开发服务器' },
      { name: 'build', command: 'yarn build', description: '构建生产版本' },
      { name: 'lint', command: 'yarn lint', description: '代码检查' },
    ],
    description: 'Admin dashboard built with Vue 3',
    version: '0.5.2'
  }
];

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
        // 如果都没有数据，保存初始的模拟数据
        console.log('📝 没有发现现有数据，保存初始示例项目');
        await RendererFileSystemService.saveProjects(MOCK_PROJECTS);
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
      
      const newProject: Project = {
        id: Date.now().toString(),
        name: this.extractProjectName(projectPath),
        path: projectPath,
        type: this.detectProjectType(projectPath),
        status: 'stopped',
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
  static async createProject(projectConfig: {
    name: string;
    path: string;
    type: Project['type'];
    packageManager: 'npm' | 'yarn' | 'pnpm';
    includeGit: boolean;
    templateType?: 'basic' | 'typescript' | 'react' | 'vue' | 'electron';
  }): Promise<FileSystemResult> {
    try {
      await this.initialize();
      
      // 模拟项目创建过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 在真实应用中，这里会：
      // 1. 创建项目目录
      // 2. 初始化package.json
      // 3. 安装依赖
      // 4. 创建基础文件结构
      // 5. 如果需要，初始化git仓库
      
      const newProject: Project = {
        id: Date.now().toString(),
        name: projectConfig.name,
        path: projectConfig.path,
        type: projectConfig.type,
        status: 'stopped',
        lastOpened: new Date(),
        packageManager: projectConfig.packageManager,
        scripts: this.generateProjectScripts(projectConfig.type, projectConfig.packageManager),
        description: `新创建的${projectConfig.type}项目`,
        version: '1.0.0'
      };

      // 使用文件系统服务保存
      const result = await RendererFileSystemService.addProject(newProject);
      
      if (result.success) {
        console.log(`✅ 成功创建项目: ${newProject.name}`);
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
        error: error instanceof Error ? error.message : '创建项目失败'
      };
    }
  }

  // 根据项目类型生成默认脚本
  private static generateProjectScripts(projectType: Project['type'], packageManager: string): ProjectScript[] {
    const pm = packageManager;
    
    const commonScripts = [
      { name: 'start', command: `${pm} start`, description: '启动项目' },
      { name: 'build', command: `${pm} run build`, description: '构建项目' },
      { name: 'test', command: `${pm} test`, description: '运行测试' }
    ];

    switch (projectType) {
      case 'react':
        return [
          { name: 'dev', command: `${pm} run dev`, description: '开发模式启动' },
          ...commonScripts,
          { name: 'lint', command: `${pm} run lint`, description: '代码检查' }
        ];
      
      case 'vue':
        return [
          { name: 'serve', command: `${pm} run serve`, description: '开发服务器' },
          ...commonScripts,
          { name: 'lint', command: `${pm} run lint`, description: '代码检查' }
        ];
      
      case 'electron':
        return [
          { name: 'electron', command: `${pm} run electron`, description: '启动Electron应用' },
          { name: 'dev', command: `${pm} run dev`, description: '开发模式' },
          ...commonScripts
        ];
      
      case 'node':
      default:
        return [
          { name: 'dev', command: `${pm} run dev`, description: '开发模式启动' },
          ...commonScripts
        ];
    }
  }

  // localStorage 降级方案
  private static loadProjectsFromLocalStorage(): Project[] {
    try {
      const stored = localStorage.getItem('nodeAppManager_projects');
      if (stored) {
        const projects = JSON.parse(stored);
        // 转换日期字符串为 Date 对象
        return projects.map((p: any) => ({
          ...p,
          lastOpened: new Date(p.lastOpened)
        }));
      }
      return MOCK_PROJECTS;
    } catch (error) {
      console.error('localStorage读取失败:', error);
      return MOCK_PROJECTS;
    }
  }

  private static saveProjectsToLocalStorage(projects: Project[]): void {
    try {
      localStorage.setItem('nodeAppManager_projects', JSON.stringify(projects));
    } catch (error) {
      console.error('localStorage保存失败:', error);
    }
  }

  private static saveProjectToLocalStorage(project: Project): void {
    const projects = this.loadProjectsFromLocalStorage();
    projects.push(project);
    this.saveProjectsToLocalStorage(projects);
  }

  private static removeProjectFromLocalStorage(projectId: string): void {
    const projects = this.loadProjectsFromLocalStorage();
    const filtered = projects.filter(p => p.id !== projectId);
    this.saveProjectsToLocalStorage(filtered);
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
}
