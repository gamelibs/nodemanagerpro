/**
 * 模板变量替换服务
 * 处理企业级模板文件中的变量替换逻辑
 */

import path from 'path';
import { promises as fs } from 'fs';
import type { ProjectCreationConfig } from '../types';

export interface TemplateVariables {
  PROJECT_NAME: string;
  PROJECT_NAME_PASCAL: string;
  PROJECT_NAME_CAMEL: string;
  PROJECT_NAME_KEBAB: string;
  PROJECT_NAME_SNAKE: string;
  PROJECT_DESCRIPTION: string;
  AUTHOR_NAME: string;
  AUTHOR_EMAIL: string;
  CURRENT_YEAR: string;
  CURRENT_DATE: string;
  PORT: string;
  PACKAGE_MANAGER: string;
  PACKAGE_MANAGER_VERSION: string;
  NODE_VERSION: string;
  LICENSE: string;
  TEMPLATE_VERSION: string;
  REPOSITORY_URL: string;
  PROJECT_PATH: string;
}

export class TemplateVariableService {
  /**
   * 从项目配置生成模板变量
   */
  static generateVariables(config: ProjectCreationConfig): TemplateVariables {
    const projectName = config.name;
    const currentDate = new Date();
    const packageManager = config.packageManager || 'pnpm';
    
    return {
      PROJECT_NAME: projectName,
      PROJECT_NAME_PASCAL: this.toPascalCase(projectName),
      PROJECT_NAME_CAMEL: this.toCamelCase(projectName),
      PROJECT_NAME_KEBAB: this.toKebabCase(projectName),
      PROJECT_NAME_SNAKE: this.toSnakeCase(projectName),
      PROJECT_DESCRIPTION: `A professional ${config.template} application`,
      AUTHOR_NAME: process.env.GIT_AUTHOR_NAME || process.env.USER || 'Developer',
      AUTHOR_EMAIL: process.env.GIT_AUTHOR_EMAIL || 'developer@example.com',
      CURRENT_YEAR: currentDate.getFullYear().toString(),
      CURRENT_DATE: currentDate.toISOString().split('T')[0],
      PORT: config.port?.toString() || '3000',
      PACKAGE_MANAGER: packageManager,
      PACKAGE_MANAGER_VERSION: this.getPackageManagerVersion(packageManager),
      NODE_VERSION: process.version.replace('v', ''),
      LICENSE: 'MIT',
      TEMPLATE_VERSION: '1.0.0',
      REPOSITORY_URL: `https://github.com/${this.toKebabCase(projectName)}`,
      PROJECT_PATH: config.path
    };
  }

  /**
   * 替换文件内容中的变量
   */
  static replaceVariables(content: string, variables: TemplateVariables): string {
    let result = content;
    
    // 替换 {{VARIABLE}} 格式的变量
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, value);
    });

    // 替换条件块 {{#if CONDITION}}...{{/if}}
    result = this.replaceConditionalBlocks(result, variables);

    // 替换循环块 {{#each ARRAY}}...{{/each}}
    result = this.replaceLoopBlocks(result, variables);

    return result;
  }

  /**
   * 处理条件块替换
   */
  private static replaceConditionalBlocks(content: string, variables: TemplateVariables): string {
    const ifRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    
    return content.replace(ifRegex, (_match, condition, block) => {
      // 检查条件是否为真
      const value = variables[condition as keyof TemplateVariables];
      if (value && value !== 'false' && value !== '0') {
        return block;
      }
      return '';
    });
  }

  /**
   * 处理循环块替换
   */
  private static replaceLoopBlocks(content: string, _variables: TemplateVariables): string {
    const eachRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    
    return content.replace(eachRegex, (_match, _arrayName, _block) => {
      // 这里可以扩展支持数组数据
      // 暂时返回空字符串，因为当前模板主要使用简单变量替换
      return '';
    });
  }

  /**
   * 处理文件和目录中的变量替换
   */
  static async processTemplateDirectory(
    templateDir: string,
    outputDir: string,
    variables: TemplateVariables
  ): Promise<void> {
    const items = await fs.readdir(templateDir, { withFileTypes: true });

    for (const item of items) {
      const sourcePath = path.join(templateDir, item.name);
      
      // 替换文件/目录名中的变量
      const processedName = this.replaceVariables(item.name, variables);
      const targetPath = path.join(outputDir, processedName);

      if (item.isDirectory()) {
        // 创建目录
        await fs.mkdir(targetPath, { recursive: true });
        // 递归处理子目录
        await this.processTemplateDirectory(sourcePath, targetPath, variables);
      } else {
        // 处理文件
        await this.processTemplateFile(sourcePath, targetPath, variables);
      }
    }
  }

  /**
   * 处理单个模板文件
   */
  static async processTemplateFile(
    sourcePath: string,
    targetPath: string,
    variables: TemplateVariables
  ): Promise<void> {
    try {
      const content = await fs.readFile(sourcePath, 'utf-8');
      
      // 检查是否是二进制文件（简单检测）
      if (this.isBinaryFile(sourcePath)) {
        // 直接复制二进制文件
        await fs.copyFile(sourcePath, targetPath);
        return;
      }

      // 替换文件内容中的变量
      const processedContent = this.replaceVariables(content, variables);
      
      // 创建目标目录
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      
      // 写入处理后的文件
      await fs.writeFile(targetPath, processedContent, 'utf-8');
    } catch (error) {
      console.error(`Error processing template file ${sourcePath}:`, error);
      throw error;
    }
  }

  /**
   * 检查是否是二进制文件
   */
  private static isBinaryFile(filePath: string): boolean {
    const binaryExtensions = [
      '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
      '.woff', '.woff2', '.ttf', '.eot',
      '.mp4', '.mp3', '.wav',
      '.zip', '.tar', '.gz',
      '.exe', '.dll', '.so'
    ];
    
    const ext = path.extname(filePath).toLowerCase();
    return binaryExtensions.includes(ext);
  }

  /**
   * 字符串转换工具方法
   */
  private static toPascalCase(str: string): string {
    return str
      .replace(/[\s-_]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
      .replace(/^(.)/, (_, char) => char.toUpperCase());
  }

  private static toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  private static toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  private static toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  /**
   * 获取包管理器的版本字符串（用于 packageManager 字段）
   */
  private static getPackageManagerVersion(packageManager: string): string {
    // 根据包管理器返回合适的版本号
    switch (packageManager) {
      case 'npm':
        return 'npm@9.8.1';
      case 'yarn':
        return 'yarn@3.6.4';
      case 'pnpm':
        return 'pnpm@8.10.0';
      default:
        return 'pnpm@8.10.0';
    }
  }

  /**
   * 验证模板变量
   */
  static validateVariables(variables: TemplateVariables): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!variables.PROJECT_NAME || variables.PROJECT_NAME.trim() === '') {
      errors.push('Project name is required');
    }

    if (!variables.PROJECT_PATH || variables.PROJECT_PATH.trim() === '') {
      errors.push('Project path is required');
    }

    // 验证项目名称格式
    if (variables.PROJECT_NAME && !/^[a-zA-Z0-9][a-zA-Z0-9-_]*$/.test(variables.PROJECT_NAME)) {
      errors.push('Project name must start with alphanumeric character and contain only letters, numbers, hyphens, and underscores');
    }

    // 验证端口号
    if (variables.PORT) {
      const port = parseInt(variables.PORT);
      if (isNaN(port) || port < 1000 || port > 65535) {
        errors.push('Port must be a number between 1000 and 65535');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 获取模板预览变量（用于模板预览）
   */
  static getPreviewVariables(): TemplateVariables {
    const currentDate = new Date();
    
    return {
      PROJECT_NAME: 'my-awesome-project',
      PROJECT_NAME_PASCAL: 'MyAwesomeProject',
      PROJECT_NAME_CAMEL: 'myAwesomeProject',
      PROJECT_NAME_KEBAB: 'my-awesome-project',
      PROJECT_NAME_SNAKE: 'my_awesome_project',
      PROJECT_DESCRIPTION: 'A professional enterprise application',
      AUTHOR_NAME: 'John Doe',
      AUTHOR_EMAIL: 'john.doe@example.com',
      CURRENT_YEAR: currentDate.getFullYear().toString(),
      CURRENT_DATE: currentDate.toISOString().split('T')[0],
      PORT: '3000',
      PACKAGE_MANAGER: 'pnpm',
      PACKAGE_MANAGER_VERSION: this.getPackageManagerVersion('pnpm'),
      NODE_VERSION: process.version.replace('v', ''),
      LICENSE: 'MIT',
      TEMPLATE_VERSION: '1.0.0',
      REPOSITORY_URL: 'https://github.com/my-awesome-project',
      PROJECT_PATH: '/path/to/my-awesome-project'
    };
  }
}

export default TemplateVariableService;
