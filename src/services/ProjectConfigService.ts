import type { Project, CoreProject, ProjectScript } from '../types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 项目配置动态检测服务
 * 负责在打开项目时实时检测项目的配置信息
 */
export class ProjectConfigService {
  
  /**
   * 从核心项目信息动态检测完整项目配置
   */
  static async detectProjectConfig(coreProject: CoreProject): Promise<Project> {
    console.log(`🔍 开始检测项目配置: ${coreProject.name}`);

    try {
      const projectPath = coreProject.path;
      
      // 检测项目类型和包管理器
      const { type, packageManager } = await this.detectProjectTypeAndPackageManager(projectPath);
      
      // 检测脚本
      const scripts = await this.detectScripts(projectPath, packageManager);
      
      // 检测端口
      const port = await this.detectPort(projectPath);
      
      // 检测项目描述和版本
      const { description, version } = await this.detectProjectInfo(projectPath);
      
      // 构建完整项目对象
      const fullProject: Project = {
        ...coreProject,
        type,
        packageManager,
        scripts,
        port,
        description,
        version,
        // 状态将通过PM2服务动态获取，这里不设置
      };

      console.log(`✅ 项目配置检测完成: ${coreProject.name}`, {
        type,
        packageManager,
        scriptsCount: scripts.length,
        port,
        description
      });

      return fullProject;
    } catch (error) {
      console.error(`❌ 检测项目配置失败: ${coreProject.name}`, error);
      
      // 返回最小配置的项目对象
      return {
        ...coreProject,
        type: 'other',
        packageManager: 'npm',
        scripts: []
      };
    }
  }

  /**
   * 检测项目类型和包管理器
   */
  private static async detectProjectTypeAndPackageManager(projectPath: string): Promise<{
    type: Project['type'];
    packageManager: Project['packageManager'];
  }> {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    // 检测包管理器
    let packageManager: Project['packageManager'] = 'npm';
    if (fs.existsSync(path.join(projectPath, 'yarn.lock'))) {
      packageManager = 'yarn';
    } else if (fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml'))) {
      packageManager = 'pnpm';
    }

    // 检测项目类型
    let type: Project['type'] = 'other';
    
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        if (dependencies.react || dependencies['@types/react']) {
          type = 'react';
        } else if (dependencies.vue || dependencies['@vue/cli-service']) {
          type = 'vue';
        } else if (dependencies.electron) {
          type = 'electron';
        } else if (dependencies.express || dependencies.koa || dependencies.fastify) {
          type = 'node';
        }
      } catch (error) {
        console.warn(`⚠️ 解析 package.json 失败: ${projectPath}`, error);
      }
    }

    return { type, packageManager };
  }

  /**
   * 检测项目脚本
   */
  private static async detectScripts(projectPath: string, packageManager: Project['packageManager']): Promise<ProjectScript[]> {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const scripts: ProjectScript[] = [];

    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const npmScripts = packageJson.scripts || {};

        // 转换npm脚本为ProjectScript格式
        for (const [name, command] of Object.entries(npmScripts)) {
          scripts.push({
            name,
            command: `${packageManager} run ${name}`,
            description: `运行 ${name} 脚本`
          });
        }
      } catch (error) {
        console.warn(`⚠️ 解析脚本失败: ${projectPath}`, error);
      }
    }

    return scripts;
  }

  /**
   * 检测项目端口
   */
  private static async detectPort(projectPath: string): Promise<number | undefined> {
    try {
      // 首先尝试从 package.json 检测
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        
        // 检查 scripts 中的端口信息
        const scripts = packageJson.scripts || {};
        for (const script of Object.values(scripts) as string[]) {
          const portMatch = script.match(/--port[=\s]+(\d+)|--p[=\s]+(\d+)|-p[=\s]+(\d+)/);
          if (portMatch) {
            const port = parseInt(portMatch[1] || portMatch[2] || portMatch[3]);
            if (port && port > 0 && port < 65536) {
              return port;
            }
          }
        }
      }

      // 尝试从常见配置文件检测端口
      const configFiles = [
        'vite.config.js',
        'vite.config.ts',
        'vue.config.js',
        'next.config.js',
        'webpack.config.js',
        '.env',
        '.env.local'
      ];

      for (const configFile of configFiles) {
        const configPath = path.join(projectPath, configFile);
        if (fs.existsSync(configPath)) {
          const content = fs.readFileSync(configPath, 'utf-8');
          const portMatch = content.match(/port[:\s]*(\d+)|PORT[:\s=]*(\d+)/i);
          if (portMatch) {
            const port = parseInt(portMatch[1] || portMatch[2]);
            if (port && port > 0 && port < 65536) {
              return port;
            }
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ 检测端口失败: ${projectPath}`, error);
    }

    return undefined;
  }

  /**
   * 检测项目信息（描述、版本等）
   */
  private static async detectProjectInfo(projectPath: string): Promise<{
    description?: string;
    version?: string;
  }> {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        return {
          description: packageJson.description,
          version: packageJson.version
        };
      } catch (error) {
        console.warn(`⚠️ 解析项目信息失败: ${projectPath}`, error);
      }
    }

    return {};
  }

  /**
   * 批量检测多个项目的配置
   */
  static async detectMultipleProjectConfigs(coreProjects: CoreProject[]): Promise<Project[]> {
    console.log(`🔍 开始批量检测 ${coreProjects.length} 个项目的配置`);
    
    const results = await Promise.all(
      coreProjects.map(coreProject => this.detectProjectConfig(coreProject))
    );

    console.log(`✅ 批量配置检测完成，成功检测 ${results.length} 个项目`);
    return results;
  }
}
