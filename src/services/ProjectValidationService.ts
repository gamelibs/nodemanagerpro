import type { Project } from '../types';
import { PM2Service } from './PM2Service';

/**
 * 项目验证和配置获取服务
 * 封装项目配置获取和PM2运行状态检查的通用方法
 */
export class ProjectValidationService {
  
  /**
   * 验证项目配置并获取项目信息
   * @param projectPath 项目路径
   * @param onProgress 进度回调函数
   * @returns 项目配置信息
   */
  static async validateProjectConfiguration(
    projectPath: string,
    onProgress?: (message: string, level?: 'info' | 'warn' | 'error' | 'success') => void
  ): Promise<{
    success: boolean;
    data?: {
      hasPackageJson: boolean;
      packageJson?: any;
      packageManager: string;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      scripts?: Record<string, string>;
    };
    error?: string;
  }> {
    try {
      onProgress?.('🔍 正在获取项目配置...', 'info');
      
      // 检查是否在 Electron 环境中
      if (!window.electronAPI) {
        const error = '不在 Electron 环境中，无法读取项目配置';
        onProgress?.(error, 'error');
        return { success: false, error };
      }

      onProgress?.('📄 正在读取 package.json...', 'info');
      
      // 尝试读取 package.json
      const result = await window.electronAPI.invoke('project:getPackageInfo', projectPath);
      
      if (result.success && result.data?.packageJson) {
        const packageJson = result.data.packageJson;
        onProgress?.('✅ 获取项目配置成功', 'success');
        
        // 检测包管理器
        onProgress?.('📦 正在检测包管理器...', 'info');
        const packageManager = await this.detectPackageManager(projectPath, onProgress);
        onProgress?.(`✅ 检测到包管理器: ${packageManager}`, 'success');
        
        return {
          success: true,
          data: {
            hasPackageJson: true,
            packageJson,
            packageManager,
            dependencies: packageJson.dependencies || {},
            devDependencies: packageJson.devDependencies || {},
            scripts: packageJson.scripts || {}
          }
        };
      } else {
        onProgress?.('⚠️ 未找到 package.json 文件', 'warn');
        
        // 没有 package.json，但仍然检测包管理器
        const packageManager = await this.detectPackageManager(projectPath, onProgress);
        
        return {
          success: true,
          data: {
            hasPackageJson: false,
            packageManager,
            dependencies: {},
            devDependencies: {},
            scripts: {}
          }
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取项目配置失败';
      onProgress?.(`❌ 获取项目配置失败: ${errorMessage}`, 'error');
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * 检查项目的PM2运行状态
   * @param project 项目对象
   * @param onProgress 进度回调函数
   * @returns PM2状态信息
   */
  static async checkPM2Status(
    project: Project,
    onProgress?: (message: string, level?: 'info' | 'warn' | 'error' | 'success') => void
  ): Promise<{
    success: boolean;
    data?: {
      isRunning: boolean;
      status?: any;
      processName?: string;
      performance?: {
        cpu: number;
        memory: number;
        uptime: number;
      };
    };
    error?: string;
  }> {
    try {
      onProgress?.('🔍 正在检查PM2运行状态...', 'info');
      
      // 获取所有PM2进程
      const processListResult = await PM2Service.listAllProcesses();
      
      if (!processListResult.success) {
        onProgress?.('❌ PM2运行状态检查失败', 'error');
        return {
          success: false,
          error: processListResult.error || 'PM2运行状态检查失败'
        };
      }

      const processes = processListResult.processes || [];
      const expectedProcessName = `${project.name}-${project.id}`;
      
      onProgress?.(`🎯 正在查找进程: ${expectedProcessName}`, 'info');
      
      // 查找匹配的进程
      const projectProcess = processes.find(proc => {
        if (proc.name === expectedProcessName) return true;
        if (proc.pm2_env && proc.pm2_env.pm_cwd === project.path) return true;
        if (proc.name && (
          proc.name === project.name || 
          proc.name.includes(project.name) ||
          project.name.includes(proc.name)
        )) return true;
        return false;
      });

      if (projectProcess) {
        onProgress?.('✅ PM2运行状态检查成功 - 进程运行中', 'success');
        
        // 获取性能数据
        let performance;
        try {
          const perfResult = await PM2Service.getProjectPerformance(project);
          if (perfResult.success && perfResult.performance) {
            performance = perfResult.performance;
            onProgress?.(`📊 性能数据: CPU ${performance.cpu}%, 内存 ${performance.memory}MB`, 'info');
          }
        } catch (error) {
          onProgress?.('⚠️ 获取性能数据失败', 'warn');
        }

        return {
          success: true,
          data: {
            isRunning: true,
            status: projectProcess,
            processName: projectProcess.name,
            performance
          }
        };
      } else {
        onProgress?.('✅ PM2运行状态检查成功 - 进程未运行', 'success');
        
        return {
          success: true,
          data: {
            isRunning: false
          }
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'PM2运行状态检查失败';
      onProgress?.(`❌ PM2运行状态检查失败: ${errorMessage}`, 'error');
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * 综合验证项目（配置 + PM2状态）
   * @param project 项目对象
   * @param onProgress 进度回调函数
   * @returns 综合验证结果
   */
  static async validateProject(
    project: Project,
    onProgress?: (message: string, level?: 'info' | 'warn' | 'error' | 'success') => void
  ): Promise<{
    success: boolean;
    data?: {
      configuration: any;
      pm2Status: any;
    };
    error?: string;
  }> {
    try {
      onProgress?.(`🔍 开始验证项目: ${project.name}`, 'info');
      
      // 并行执行配置检查和PM2状态检查
      const [configResult, pm2Result] = await Promise.all([
        this.validateProjectConfiguration(project.path, onProgress),
        this.checkPM2Status(project, onProgress)
      ]);

      const hasErrors = !configResult.success || !pm2Result.success;
      
      if (hasErrors) {
        const errors = [
          configResult.error,
          pm2Result.error
        ].filter(Boolean);
        
        onProgress?.(`❌ 项目验证完成，存在错误: ${errors.join(', ')}`, 'error');
        
        return {
          success: false,
          error: errors.join(', ')
        };
      } else {
        onProgress?.(`✅ 项目验证完成: ${project.name}`, 'success');
        
        return {
          success: true,
          data: {
            configuration: configResult.data,
            pm2Status: pm2Result.data
          }
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '项目验证失败';
      onProgress?.(`❌ 项目验证失败: ${errorMessage}`, 'error');
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * 检测项目的包管理器
   * @param projectPath 项目路径
   * @param onProgress 进度回调函数
   * @returns 包管理器名称
   */
  private static async detectPackageManager(
    projectPath: string,
    onProgress?: (message: string, level?: 'info' | 'warn' | 'error' | 'success') => void
  ): Promise<string> {
    try {
      if (window.electronAPI) {
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
              onProgress?.(`📦 检测到 ${check.manager} 锁文件`, 'info');
              return check.manager;
            }
          } catch (error) {
            // 继续检查下一个
          }
        }
      }
    } catch (error) {
      onProgress?.('⚠️ 检测包管理器失败，使用默认值', 'warn');
    }
    
    return 'npm'; // 默认使用 npm
  }
}
