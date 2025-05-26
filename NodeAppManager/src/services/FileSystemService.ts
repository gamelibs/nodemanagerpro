import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import type { Project } from '../types';

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
   * 读取项目数据
   */
  static async loadProjects(): Promise<Project[]> {
    try {
      console.log('🔍 开始加载项目数据...');
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
      
      // 转换日期字符串为Date对象
      const parsedProjects = projects.map((p: any) => ({
        ...p,
        lastOpened: p.lastOpened ? new Date(p.lastOpened) : null
      }));

      console.log(`✅ 加载了 ${parsedProjects.length} 个项目`);
      return parsedProjects;
    } catch (error) {
      console.error('❌ 读取项目数据失败:', error);
      
      // 尝试从备份文件恢复
      try {
        const backupPath = this.getBackupFilePath();
        if (fs.existsSync(backupPath)) {
          console.log('🔄 尝试从备份文件恢复...');
          const backupData = fs.readFileSync(backupPath, 'utf-8');
          const projects = JSON.parse(backupData);
          return projects.map((p: any) => ({
            ...p,
            lastOpened: p.lastOpened ? new Date(p.lastOpened) : null
          }));
        }
      } catch (backupError) {
        console.error('❌ 备份文件也损坏:', backupError);
      }
      
      return [];
    }
  }

  /**
   * 保存项目数据
   */
  static async saveProjects(projects: Project[]): Promise<void> {
    try {
      this.ensureDataDir();
      const filePath = this.getProjectsFilePath();
      const backupPath = this.getBackupFilePath();
      
      // 如果文件存在，先创建备份
      if (fs.existsSync(filePath)) {
        fs.copyFileSync(filePath, backupPath);
      }
      
      // 保存新数据
      const data = JSON.stringify(projects, null, 2);
      fs.writeFileSync(filePath, data, 'utf-8');
      
      console.log(`💾 保存了 ${projects.length} 个项目到 ${filePath}`);
    } catch (error) {
      console.error('❌ 保存项目数据失败:', error);
      throw error;
    }
  }

  /**
   * 添加项目
   */
  static async addProject(project: Project): Promise<void> {
    const projects = await this.loadProjects();
    
    // 检查是否已存在相同路径的项目
    const existingIndex = projects.findIndex(p => p.path === project.path);
    if (existingIndex !== -1) {
      // 更新现有项目
      projects[existingIndex] = { ...projects[existingIndex], ...project };
      console.log(`🔄 更新现有项目: ${project.name}`);
    } else {
      // 添加新项目
      projects.push(project);
      console.log(`➕ 添加新项目: ${project.name}`);
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
   * 更新项目状态
   */
  static async updateProjectStatus(projectId: string, status: Project['status']): Promise<void> {
    const projects = await this.loadProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      throw new Error(`项目 ID ${projectId} 不存在`);
    }
    
    projects[projectIndex].status = status;
    projects[projectIndex].lastOpened = new Date();
    
    await this.saveProjects(projects);
    console.log(`📝 更新项目状态: ${projectId} -> ${status}`);
  }

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
}
