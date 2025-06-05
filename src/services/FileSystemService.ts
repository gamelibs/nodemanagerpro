import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import type { CoreProject } from '../types';
import { TemplateVariableService } from './TemplateVariableService';

export class FileSystemService {
  private static readonly DATA_DIR = 'temp';
  private static readonly PROJECTS_FILE = 'projects.json';
  private static readonly BACKUP_FILE = 'projects.backup.json';

  /**
   * 获取数据目录路径
   */
  private static getDataDir(): string {
    // 在开发模式下，使用项目根目录下的temp文件夹
    if (process.env.NODE_ENV === 'development') {
      return path.join(process.cwd(), this.DATA_DIR);
    }
    
    // 在生产模式下，使用应用数据目录
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, this.DATA_DIR);
  }

  /**
   * 获取项目数据文件路径
   */
  private static getProjectsFilePath(): string {
    return path.join(this.getDataDir(), this.PROJECTS_FILE);
  }

  /**
   * 获取备份文件路径
   */
  private static getBackupFilePath(): string {
    return path.join(this.getDataDir(), this.BACKUP_FILE);
  }

  /**
   * 确保数据目录存在
   */
  private static ensureDataDir(): void {
    const dataDir = this.getDataDir();
    console.log(`🔍 检查数据目录: ${dataDir}`);
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log(`📁 创建数据目录: ${dataDir}`);
    } else {
      console.log(`✅ 数据目录已存在: ${dataDir}`);
    }
  }

  /**
   * 读取项目数据（仅返回核心信息）
   */
  static async loadProjects(): Promise<CoreProject[]> {
    try {
      console.log('🔍 开始加载项目核心数据...');
      console.log('📁 数据目录:', this.getDataDir());
      
      this.ensureDataDir();
      const filePath = this.getProjectsFilePath();
      console.log('📄 项目文件路径:', filePath);
      
      if (!fs.existsSync(filePath)) {
        console.log('📄 项目数据文件不存在，返回空数组');
        return [];
      }

      const data = fs.readFileSync(filePath, 'utf-8');
      const projects = JSON.parse(data);
      
      // 转换日期字符串为Date对象，并确保只返回核心字段
      const coreProjects = projects.map((p: any): CoreProject => ({
        id: p.id,
        name: p.name,
        path: p.path,
        lastOpened: p.lastOpened ? new Date(p.lastOpened) : new Date()
      }));

      console.log(`✅ 加载了 ${coreProjects.length} 个项目的核心信息`);
      return coreProjects;
    } catch (error) {
      console.error('❌ 读取项目数据失败:', error);
      
      // 尝试从备份文件恢复
      try {
        const backupPath = this.getBackupFilePath();
        if (fs.existsSync(backupPath)) {
          console.log('🔄 尝试从备份文件恢复...');
          const backupData = fs.readFileSync(backupPath, 'utf-8');
          const projects = JSON.parse(backupData);
          return projects.map((p: any): CoreProject => ({
            id: p.id,
            name: p.name,
            path: p.path,
            lastOpened: p.lastOpened ? new Date(p.lastOpened) : new Date()
          }));
        }
      } catch (backupError) {
        console.error('❌ 备份文件也损坏:', backupError);
      }
      
      return [];
    }
  }

  /**
   * 保存项目数据（仅保存核心信息）
   */
  static async saveProjects(projects: CoreProject[]): Promise<void> {
    try {
      this.ensureDataDir();
      const filePath = this.getProjectsFilePath();
      const backupPath = this.getBackupFilePath();
      
      // 如果文件存在，先创建备份
      if (fs.existsSync(filePath)) {
        fs.copyFileSync(filePath, backupPath);
      }
      
      // 保存新数据（只保存核心信息）
      const data = JSON.stringify(projects, null, 2);
      fs.writeFileSync(filePath, data, 'utf-8');
      
      console.log(`💾 保存了 ${projects.length} 个项目的核心信息到 ${filePath}`);
    } catch (error) {
      console.error('❌ 保存项目数据失败:', error);
      throw error;
    }
  }

  /**
   * 添加项目（仅保存核心信息）
   */
  static async addProject(project: CoreProject): Promise<void> {
    const projects = await this.loadProjects();
    
    // 检查是否已存在相同路径的项目
    const existingIndex = projects.findIndex(p => p.path === project.path);
    if (existingIndex !== -1) {
      // 更新现有项目的核心信息
      projects[existingIndex] = { 
        ...projects[existingIndex], 
        name: project.name,
        lastOpened: project.lastOpened 
      };
      console.log(`🔄 更新现有项目的核心信息: ${project.name}`);
    } else {
      // 添加新项目（只保存核心信息）
      const coreProject: CoreProject = {
        id: project.id,
        name: project.name,
        path: project.path,
        lastOpened: project.lastOpened
      };
      projects.push(coreProject);
      console.log(`➕ 添加新项目的核心信息: ${project.name}`);
    }
    
    await this.saveProjects(projects);
  }

  /**
   * 移除项目
   */
  static async removeProject(projectId: string): Promise<void> {
    const projects = await this.loadProjects();
    const filteredProjects = projects.filter(p => p.id !== projectId);
    
    if (filteredProjects.length === projects.length) {
      throw new Error(`项目 ID ${projectId} 不存在`);
    }
    
    await this.saveProjects(filteredProjects);
    console.log(`🗑️ 移除项目: ${projectId}`);
  }

  /**
   * 更新项目信息（仅更新核心字段）
   */
  static async updateProject(projectId: string, updates: Partial<CoreProject>): Promise<void> {
    const projects = await this.loadProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      throw new Error(`项目 ID ${projectId} 不存在`);
    }
    
    // 只更新允许的核心字段
    const allowedFields: (keyof CoreProject)[] = ['name', 'path', 'lastOpened'];
    const coreUpdates: Partial<CoreProject> = {};
    
    for (const field of allowedFields) {
      if (field in updates && updates[field] !== undefined) {
        (coreUpdates as any)[field] = updates[field];
      }
    }
    
    // 应用更新
    projects[projectIndex] = { ...projects[projectIndex], ...coreUpdates };
    
    await this.saveProjects(projects);
    console.log(`📝 更新项目核心信息: ${projectId}`, coreUpdates);
  }

  /**
   * 更新项目最后打开时间
   */
  static async updateProjectLastOpened(projectId: string): Promise<void> {
    const projects = await this.loadProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      throw new Error(`项目 ID ${projectId} 不存在`);
    }
    
    // 只更新最后打开时间
    projects[projectIndex].lastOpened = new Date();
    
    await this.saveProjects(projects);
    console.log(`📝 更新项目最后打开时间: ${projectId}`);
  }

  // 项目状态更新已不再需要，因为状态通过PM2实时获取

  /**
   * 获取数据目录信息（用于调试）
   */
  static getDataInfo(): any {
    const dataDir = this.getDataDir();
    const projectsFile = this.getProjectsFilePath();
    
    return {
      dataDir,
      projectsFile,
      exists: fs.existsSync(projectsFile),
      cwd: process.cwd(),
      isDev: process.env.NODE_ENV === 'development'
    };
  }

  /**
   * 从模板创建项目文件
   */
  static async createProjectFromTemplate(projectConfig: any): Promise<void> {
    const { template, path: projectPath, name: projectName, packageManager = 'npm', tools = {} } = projectConfig;
    
    // 确定模板源目录
    const templateSrcDir = path.join(process.cwd(), 'templates', template);
    
    console.log(`📁 从模板创建项目:`, { templateSrcDir, projectPath, projectName });
    
    // 检查模板目录是否存在
    if (!fs.existsSync(templateSrcDir)) {
      throw new Error(`模板目录不存在: ${templateSrcDir}`);
    }
    
    // 确保目标目录存在
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
      console.log(`📂 创建项目目录: ${projectPath}`);
    }
    
    // 递归复制模板文件
    await this.copyDirectory(templateSrcDir, projectPath, projectConfig);
    
    console.log(`✅ 项目模板复制完成: ${projectName}`);

    // 安装依赖包（如果启用了自动安装）
    if (tools.autoInstall !== false) { // 默认启用自动安装
      console.log(`📦 开始安装依赖包 (${packageManager})...`);
      try {
        await this.installProjectDependencies(projectPath, packageManager);
        console.log(`✅ 依赖包安装完成: ${projectName}`);
      } catch (error) {
        console.error(`❌ 依赖包安装失败:`, error);
        throw new Error(`依赖包安装失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    } else {
      console.log(`⏭️ 跳过依赖包安装 (autoInstall: false)`);
    }
  }

  /**
   * 递归复制目录
   */
  private static async copyDirectory(srcDir: string, destDir: string, projectConfig: any): Promise<void> {
    const items = fs.readdirSync(srcDir);
    
    for (const item of items) {
      const srcPath = path.join(srcDir, item);
      const destPath = path.join(destDir, item);
      const stat = fs.statSync(srcPath);
      
      if (stat.isDirectory()) {
        // 递归复制子目录
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        await this.copyDirectory(srcPath, destPath, projectConfig);
      } else {
        // 复制文件并替换模板变量
        await this.copyFileWithTemplateReplacement(srcPath, destPath, projectConfig);
      }
    }
  }

  /**
   * 复制文件并替换模板变量
   */
  private static async copyFileWithTemplateReplacement(srcPath: string, destPath: string, projectConfig: any): Promise<void> {
    let content = fs.readFileSync(srcPath, 'utf8');
    
    // 使用 TemplateVariableService 生成变量并替换
    const variables = TemplateVariableService.generateVariables(projectConfig);
    content = TemplateVariableService.replaceVariables(content, variables);
    
    // 写入目标文件
    fs.writeFileSync(destPath, content, 'utf8');
    console.log(`📄 复制文件: ${path.relative(process.cwd(), destPath)}`);
  }

  /**
   * 安装项目依赖包
   */
  private static async installProjectDependencies(projectPath: string, packageManager: string = 'npm'): Promise<void> {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    // 检查 package.json 是否存在
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json 文件不存在，无法安装依赖');
    }

    console.log(`📦 使用 ${packageManager} 安装依赖...`);
    
    // 执行安装命令
    const installCommand = packageManager === 'yarn' ? 'yarn install' : 
                          packageManager === 'pnpm' ? 'pnpm install' : 
                          'npm install';

    try {
      const { stdout, stderr } = await execAsync(installCommand, { 
        cwd: projectPath,
        timeout: 300000 // 5分钟超时
      });

      if (stdout) {
        console.log('依赖安装输出:', stdout);
      }
      if (stderr) {
        console.warn('依赖安装警告:', stderr);
      }

      // 验证 node_modules 是否创建成功
      const nodeModulesPath = path.join(projectPath, 'node_modules');
      if (!fs.existsSync(nodeModulesPath)) {
        throw new Error('依赖安装完成但 node_modules 目录未创建');
      }

      console.log(`✅ 依赖安装成功，node_modules 目录已创建`);
    } catch (error) {
      console.error('依赖安装失败:', error);
      throw error;
    }
  }
}
