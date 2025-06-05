/**
 * 企业级模板安装服务
 * 处理企业级模板的安装、初始化和配置流程
 */

import path from 'path';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import type { ProjectCreationConfig, EnterpriseTemplate } from '../types';
import { TemplateVariableService, type TemplateVariables } from './TemplateVariableService';

export interface InstallationOptions {
  skipDependencies?: boolean;
  skipGitInit?: boolean;
  skipEnvSetup?: boolean;
  verbose?: boolean;
  timeoutMs?: number;
}

export interface InstallationProgress {
  step: string;
  progress: number; // 0-100
  message: string;
  isError?: boolean;
}

export type ProgressCallback = (progress: InstallationProgress) => void;

export class EnterpriseTemplateInstaller {
  private static readonly TEMPLATES_DIR = path.join(process.cwd(), 'templates');
  private static readonly DEFAULT_TIMEOUT = 300000; // 5 minutes

  /**
   * 安装企业级模板
   */
  static async installTemplate(
    config: ProjectCreationConfig,
    template: EnterpriseTemplate,
    options: InstallationOptions = {},
    onProgress?: ProgressCallback
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      // 步骤1: 验证配置和许可证
      this.reportProgress(onProgress, {
        step: 'validation',
        progress: 5,
        message: '验证配置和许可证...'
      });

      await this.validateInstallation(config, template);

      // 步骤2: 准备项目目录
      this.reportProgress(onProgress, {
        step: 'preparation',
        progress: 15,
        message: '准备项目目录...'
      });

      const projectPath = path.join(config.path, config.name);
      await this.prepareProjectDirectory(projectPath);

      // 步骤3: 生成模板变量
      this.reportProgress(onProgress, {
        step: 'variables',
        progress: 25,
        message: '生成模板变量...'
      });

      const variables = TemplateVariableService.generateVariables(config);
      const { isValid, errors } = TemplateVariableService.validateVariables(variables);
      
      if (!isValid) {
        throw new Error(`Template variables validation failed: ${errors.join(', ')}`);
      }

      // 步骤4: 复制和处理模板文件
      this.reportProgress(onProgress, {
        step: 'template',
        progress: 40,
        message: '处理模板文件...'
      });

      const templateDir = path.join(this.TEMPLATES_DIR, template.id);
      await this.copyAndProcessTemplate(templateDir, projectPath, variables);

      // 步骤5: 安装依赖
      if (!options.skipDependencies) {
        this.reportProgress(onProgress, {
          step: 'dependencies',
          progress: 60,
          message: '安装项目依赖...'
        });

        await this.installDependencies(projectPath, config.packageManager, options.timeoutMs);
      }

      // 步骤6: 初始化Git仓库
      if (!options.skipGitInit) {
        this.reportProgress(onProgress, {
          step: 'git',
          progress: 80,
          message: '初始化Git仓库...'
        });

        await this.initializeGit(projectPath);
      }

      // 步骤7: 设置环境配置
      if (!options.skipEnvSetup) {
        this.reportProgress(onProgress, {
          step: 'environment',
          progress: 90,
          message: '配置开发环境...'
        });

        await this.setupEnvironment(projectPath, config, template);
      }

      // 步骤8: 完成安装
      this.reportProgress(onProgress, {
        step: 'completion',
        progress: 100,
        message: '安装完成！'
      });

      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);
      
      if (options.verbose) {
        console.log(`✅ 企业级模板安装完成，耗时 ${duration} 秒`);
        console.log(`📂 项目路径: ${projectPath}`);
        console.log(`🚀 运行命令开始开发:`);
        console.log(`   cd ${config.name}`);
        console.log(`   ${config.packageManager} dev`);
      }

    } catch (error) {
      this.reportProgress(onProgress, {
        step: 'error',
        progress: -1,
        message: `安装失败: ${error instanceof Error ? error.message : '未知错误'}`,
        isError: true
      });
      throw error;
    }
  }

  /**
   * 验证安装条件
   */
  private static async validateInstallation(
    config: ProjectCreationConfig,
    template: EnterpriseTemplate
  ): Promise<void> {
    // 验证模板是否存在
    const templateDir = path.join(this.TEMPLATES_DIR, template.id);
    const templateExists = await fs.access(templateDir).then(() => true).catch(() => false);
    
    if (!templateExists) {
      throw new Error(`模板目录不存在: ${templateDir}`);
    }

    // 验证模板元数据
    const metadataPath = path.join(templateDir, 'template.json');
    const metadataExists = await fs.access(metadataPath).then(() => true).catch(() => false);
    
    if (!metadataExists) {
      throw new Error(`模板元数据文件不存在: ${metadataPath}`);
    }

    // 验证项目路径
    const projectPath = path.join(config.path, config.name);
    const exists = await fs.access(projectPath).then(() => true).catch(() => false);
    
    if (exists) {
      const files = await fs.readdir(projectPath);
      if (files.length > 0) {
        throw new Error(`目标目录不为空: ${projectPath}`);
      }
    }
  }

  /**
   * 准备项目目录
   */
  private static async prepareProjectDirectory(projectPath: string): Promise<void> {
    try {
      await fs.mkdir(projectPath, { recursive: true });
      
      // 验证目录权限
      await fs.access(projectPath, fs.constants.W_OK);
    } catch (error) {
      throw new Error(`无法创建或访问项目目录: ${projectPath}`);
    }
  }

  /**
   * 复制和处理模板文件
   */
  private static async copyAndProcessTemplate(
    templateDir: string,
    projectPath: string,
    variables: TemplateVariables
  ): Promise<void> {
    // 跳过模板元数据文件和其他不需要复制的文件
    const skipFiles = ['template.json', 'README.template.md', '.git'];
    
    const items = await fs.readdir(templateDir, { withFileTypes: true });
    
    for (const item of items) {
      if (skipFiles.includes(item.name)) {
        continue;
      }

      const sourcePath = path.join(templateDir, item.name);
      const targetPath = path.join(projectPath, item.name);

      if (item.isDirectory()) {
        await fs.mkdir(targetPath, { recursive: true });
        await TemplateVariableService.processTemplateDirectory(sourcePath, targetPath, variables);
      } else {
        await TemplateVariableService.processTemplateFile(sourcePath, targetPath, variables);
      }
    }
  }

  /**
   * 安装项目依赖
   */
  private static async installDependencies(
    projectPath: string,
    packageManager: string,
    timeoutMs?: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = timeoutMs || this.DEFAULT_TIMEOUT;
      const command = packageManager === 'yarn' ? 'yarn' : packageManager === 'pnpm' ? 'pnpm' : 'npm';
      const args = packageManager === 'yarn' ? ['install'] : ['install'];

      const child = spawn(command, args, {
        cwd: projectPath,
        stdio: 'pipe',
        shell: true
      });

      let output = '';
      let errorOutput = '';

      child.stdout?.on('data', (data) => {
        output += data.toString();
      });

      child.stderr?.on('data', (data) => {
        errorOutput += data.toString();
      });

      const timer = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`依赖安装超时 (${timeout}ms)`));
      }, timeout);

      child.on('close', (code) => {
        clearTimeout(timer);
        
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`依赖安装失败 (退出代码: ${code})\n${errorOutput}`));
        }
      });

      child.on('error', (error) => {
        clearTimeout(timer);
        reject(new Error(`依赖安装进程错误: ${error.message}`));
      });
    });
  }

  /**
   * 初始化Git仓库
   */
  private static async initializeGit(projectPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn('git', ['init'], {
        cwd: projectPath,
        stdio: 'pipe',
        shell: true
      });

      child.on('close', (code) => {
        if (code === 0) {
          // 添加初始提交
          this.createInitialCommit(projectPath)
            .then(() => resolve())
            .catch(reject);
        } else {
          reject(new Error(`Git初始化失败 (退出代码: ${code})`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Git初始化进程错误: ${error.message}`));
      });
    });
  }

  /**
   * 创建初始Git提交
   */
  private static async createInitialCommit(projectPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 添加所有文件
      const addChild = spawn('git', ['add', '.'], {
        cwd: projectPath,
        stdio: 'pipe',
        shell: true
      });

      addChild.on('close', (code) => {
        if (code === 0) {
          // 创建初始提交
          const commitChild = spawn('git', ['commit', '-m', 'Initial commit from enterprise template'], {
            cwd: projectPath,
            stdio: 'pipe',
            shell: true
          });

          commitChild.on('close', (commitCode) => {
            if (commitCode === 0) {
              resolve();
            } else {
              reject(new Error(`Git初始提交失败 (退出代码: ${commitCode})`));
            }
          });

          commitChild.on('error', (error) => {
            reject(new Error(`Git提交进程错误: ${error.message}`));
          });
        } else {
          reject(new Error(`Git添加文件失败 (退出代码: ${code})`));
        }
      });

      addChild.on('error', (error) => {
        reject(new Error(`Git添加文件进程错误: ${error.message}`));
      });
    });
  }

  /**
   * 设置开发环境
   */
  private static async setupEnvironment(
    projectPath: string,
    config: ProjectCreationConfig,
    template: EnterpriseTemplate
  ): Promise<void> {
    // 创建或更新 .env.local 文件
    const envPath = path.join(projectPath, '.env.local');
    const envContent = this.generateEnvContent(config, template);
    
    await fs.writeFile(envPath, envContent, 'utf-8');

    // 设置VS Code配置（如果需要）
    await this.setupVSCodeConfig(projectPath, template);

    // 设置项目特定的配置
    await this.setupProjectSpecificConfig(projectPath, config, template);
  }

  /**
   * 生成环境变量配置
   */
  private static generateEnvContent(
    config: ProjectCreationConfig,
    template: EnterpriseTemplate
  ): string {
    const envVars = [
      `# ${config.name} - 环境配置`,
      `# 由 NodeAppManager 企业级模板生成`,
      '',
      `# 应用配置`,
      `NEXT_PUBLIC_APP_NAME="${config.name}"`,
      `NEXT_PUBLIC_APP_VERSION="1.0.0"`,
      `PORT=${config.port || 3000}`,
      '',
      `# 开发配置`,
      `NODE_ENV=development`,
      `NEXT_PUBLIC_API_URL=http://localhost:${config.port || 3000}/api`,
      '',
      `# 数据库配置 (如需要)`,
      `# DATABASE_URL="postgresql://username:password@localhost:5432/dbname"`,
      '',
      `# 外部服务配置 (如需要)`,
      `# NEXT_PUBLIC_ANALYTICS_ID=""`,
      `# NEXT_PUBLIC_SENTRY_DSN=""`,
      '',
      `# 安全配置`,
      `NEXTAUTH_SECRET="${this.generateRandomSecret()}"`,
      `NEXTAUTH_URL=http://localhost:${config.port || 3000}`,
      ''
    ];

    return envVars.join('\n');
  }

  /**
   * 设置VS Code配置
   */
  private static async setupVSCodeConfig(projectPath: string, template: EnterpriseTemplate): Promise<void> {
    const vscodeDir = path.join(projectPath, '.vscode');
    await fs.mkdir(vscodeDir, { recursive: true });

    // 推荐扩展
    const extensions = {
      recommendations: [
        'bradlc.vscode-tailwindcss',
        'esbenp.prettier-vscode',
        'dbaeumer.vscode-eslint',
        'ms-vscode.vscode-typescript-next',
        'formulahendry.auto-rename-tag',
        'christian-kohler.path-intellisense'
      ]
    };

    await fs.writeFile(
      path.join(vscodeDir, 'extensions.json'),
      JSON.stringify(extensions, null, 2),
      'utf-8'
    );

    // 设置文件
    const settings = {
      'editor.formatOnSave': true,
      'editor.defaultFormatter': 'esbenp.prettier-vscode',
      'tailwindCSS.includeLanguages': {
        'typescript': 'javascript',
        'typescriptreact': 'javascript'
      },
      'typescript.preferences.importModuleSpecifier': 'relative'
    };

    await fs.writeFile(
      path.join(vscodeDir, 'settings.json'),
      JSON.stringify(settings, null, 2),
      'utf-8'
    );
  }

  /**
   * 设置项目特定配置
   */
  private static async setupProjectSpecificConfig(
    projectPath: string,
    config: ProjectCreationConfig,
    template: EnterpriseTemplate
  ): Promise<void> {
    // 根据模板类型设置特定配置
    if (template.id === 'enterprise-nextjs') {
      await this.setupNextjsConfig(projectPath, config);
    } else if (template.id === 'enterprise-react-spa') {
      await this.setupReactSpaConfig(projectPath, config);
    } else if (template.id === 'enterprise-vue-app') {
      await this.setupVueAppConfig(projectPath, config);
    }
  }

  /**
   * 设置Next.js特定配置
   */
  private static async setupNextjsConfig(projectPath: string, config: ProjectCreationConfig): Promise<void> {
    // 更新next.config.js中的端口配置
    const nextConfigPath = path.join(projectPath, 'next.config.js');
    try {
      let content = await fs.readFile(nextConfigPath, 'utf-8');
      
      // 如果配置了自定义端口，更新配置
      if (config.port && config.port !== 3000) {
        content = content.replace(
          /port:\s*\d+/,
          `port: ${config.port}`
        );
      }
      
      await fs.writeFile(nextConfigPath, content, 'utf-8');
    } catch (error) {
      console.warn('无法更新 next.config.js 文件:', error);
    }
  }

  /**
   * 设置React SPA特定配置
   */
  private static async setupReactSpaConfig(projectPath: string, config: ProjectCreationConfig): Promise<void> {
    // 可以在这里添加React SPA特定的配置逻辑
  }

  /**
   * 设置Vue应用特定配置
   */
  private static async setupVueAppConfig(projectPath: string, config: ProjectCreationConfig): Promise<void> {
    // 可以在这里添加Vue应用特定的配置逻辑
  }

  /**
   * 生成随机密钥
   */
  private static generateRandomSecret(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  /**
   * 报告安装进度
   */
  private static reportProgress(
    onProgress: ProgressCallback | undefined,
    progress: InstallationProgress
  ): void {
    if (onProgress) {
      onProgress(progress);
    }
  }

  /**
   * 获取模板安装信息
   */
  static async getInstallationInfo(templateId: string): Promise<{
    requiredSpace: number;
    estimatedTime: number;
    dependencies: string[];
  }> {
    const templateDir = path.join(this.TEMPLATES_DIR, templateId);
    
    try {
      const metadataPath = path.join(templateDir, 'template.json');
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
      
      return {
        requiredSpace: metadata.requiredSpace || 100, // MB
        estimatedTime: metadata.estimatedTime || 180, // seconds
        dependencies: metadata.dependencies || []
      };
    } catch (error) {
      throw new Error(`无法获取模板信息: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 清理失败的安装
   */
  static async cleanupFailedInstallation(projectPath: string): Promise<void> {
    try {
      const exists = await fs.access(projectPath).then(() => true).catch(() => false);
      if (exists) {
        await fs.rm(projectPath, { recursive: true, force: true });
      }
    } catch (error) {
      console.warn('清理失败安装时出错:', error);
    }
  }
}

export default EnterpriseTemplateInstaller;
