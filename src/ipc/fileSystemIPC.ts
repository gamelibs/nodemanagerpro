// Electron主进程的IPC处理器
import { ipcMain, dialog } from 'electron';
import { FileSystemService } from '../services/FileSystemService';
import type { Project } from '../types';
import * as fs from 'fs';
import * as path from 'path';

let isSetup = false;

export function setupFileSystemIPC() {
  if (isSetup) {
    console.log('🔗 文件系统IPC处理器已存在，跳过重复设置');
    return;
  }

  // 清除可能存在的旧处理器（安全调用）
  try {
    ipcMain.removeHandler('fs:loadProjects');
    ipcMain.removeHandler('fs:saveProjects');
    ipcMain.removeHandler('fs:addProject');
    ipcMain.removeHandler('fs:removeProject');
    ipcMain.removeHandler('fs:updateProject');
    ipcMain.removeHandler('fs:updateProjectStatus');
    ipcMain.removeHandler('fs:getDataInfo');
    ipcMain.removeHandler('fs:validateDirectory');
    ipcMain.removeHandler('dialog:showOpenDialog');
    ipcMain.removeHandler('fs:createProjectFromTemplate');
    ipcMain.removeHandler('project:getPackageInfo');
    ipcMain.removeHandler('project:installDependencies');
    ipcMain.removeHandler('project:installSpecificPackages');
    ipcMain.removeHandler('project:createPackageJson');
    ipcMain.removeHandler('project:updateStartupConfig');
    ipcMain.removeHandler('fs:readFile');
    ipcMain.removeHandler('fs:writeFile');
    ipcMain.removeHandler('fs:exists');
    ipcMain.removeHandler('project:detectConfig');
    ipcMain.removeHandler('project:detectMultipleConfigs');
  } catch (error) {
    // 忽略移除不存在处理器的错误
  }

  // 加载项目列表
  ipcMain.handle('fs:loadProjects', async () => {
    console.log('📡 收到 fs:loadProjects IPC调用');
    try {
      const projects = await FileSystemService.loadProjects();
      console.log('📡 fs:loadProjects 成功返回:', projects.length, '个项目');
      return { success: true, data: projects };
    } catch (error) {
      console.error('📡 fs:loadProjects 失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '加载项目失败' 
      };
    }
  });

  // 保存项目列表
  ipcMain.handle('fs:saveProjects', async (_, projects: Project[]) => {
    try {
      await FileSystemService.saveProjects(projects);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '保存项目失败' 
      };
    }
  });

  // 添加项目
  ipcMain.handle('fs:addProject', async (_, project: Project) => {
    try {
      await FileSystemService.addProject(project);
      return { success: true, data: project };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '添加项目失败' 
      };
    }
  });

  // 移除项目
  ipcMain.handle('fs:removeProject', async (_, projectId: string) => {
    try {
      await FileSystemService.removeProject(projectId);
      return { success: true, data: projectId };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '移除项目失败' 
      };
    }
  });

  // 导入项目JSON文件
  ipcMain.handle('fs:importProjectsFromJson', async (_, jsonData: any[]) => {
    try {
      const importedProjects = [];
      const errors = [];
      
      for (const projectData of jsonData) {
        try {
          // 验证必需字段
          if (!projectData.id || !projectData.name || !projectData.path) {
            errors.push(`项目数据缺少必需字段: ${JSON.stringify(projectData)}`);
            continue;
          }
          
          // 设置默认的lastOpened
          const project = {
            ...projectData,
            lastOpened: projectData.lastOpened || new Date().toISOString()
          };
          
          // 添加项目（FileSystemService会处理重复检查）
          await FileSystemService.addProject(project);
          importedProjects.push(project);
        } catch (error) {
          errors.push(`导入项目 "${projectData.name}" 失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      }
      
      return { 
        success: true, 
        data: { 
          imported: importedProjects, 
          errors 
        } 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '导入项目JSON失败' 
      };
    }
  });

  // 更新项目信息（仅核心字段）
  ipcMain.handle('fs:updateProject', async (_, projectId: string, updates: Partial<Project>) => {
    try {
      // 过滤只允许更新核心字段
      const coreUpdates = {
        ...(updates.name && { name: updates.name }),
        ...(updates.path && { path: updates.path }),
        ...(updates.lastOpened && { lastOpened: updates.lastOpened })
      };
      
      await FileSystemService.updateProject(projectId, coreUpdates);
      return { success: true, data: { projectId, updates: coreUpdates } };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '更新项目失败' 
      };
    }
  });

  // 项目状态更新已不再需要，因为状态通过PM2实时获取

  // 获取数据目录信息（调试用）
  ipcMain.handle('fs:getDataInfo', async () => {
    console.log('📡 收到 fs:getDataInfo IPC调用');
    try {
      const info = FileSystemService.getDataInfo();
      console.log('📡 fs:getDataInfo 成功返回:', info);
      return { success: true, data: info };
    } catch (error) {
      console.error('📡 fs:getDataInfo 失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '获取数据信息失败' 
      };
    }
  });

  // 目录验证处理器
  ipcMain.handle('fs:validateDirectory', async (_, dirPath: string) => {
    try {
      // 检查路径是否存在
      const exists = fs.existsSync(dirPath);
      
      if (!exists) {
        return { success: false, exists: false, message: '目录不存在' };
      }

      // 检查是否是目录
      const stats = fs.statSync(dirPath);
      if (!stats.isDirectory()) {
        return { success: false, exists: true, message: '路径不是目录' };
      }

      // 检查是否可读写
      try {
        fs.accessSync(dirPath, fs.constants.R_OK | fs.constants.W_OK);
      } catch (accessError) {
        return { success: false, exists: true, message: '目录不可读写' };
      }

      // 获取绝对路径
      const absolutePath = path.resolve(dirPath);
      
      return { 
        success: true, 
        exists: true, 
        path: absolutePath,
        message: '目录有效' 
      };
    } catch (error) {
      console.error('验证目录失败:', error);
      return { 
        success: false, 
        exists: false, 
        error: error instanceof Error ? error.message : '验证目录失败' 
      };
    }
  });

  // 文件对话框处理器
  ipcMain.handle('dialog:showOpenDialog', async (_, options) => {
    try {
      // 设置默认路径到用户主目录
      const defaultOptions = {
        ...options,
        defaultPath: options.defaultPath || (
          process.platform === 'darwin' ? process.env.HOME :
          process.platform === 'win32' ? process.env.USERPROFILE :
          process.env.HOME || '/home'
        )
      };
      
      const result = await dialog.showOpenDialog(defaultOptions);
      console.log('文件对话框结果:', result);
      return result;
    } catch (error) {
      console.error('显示文件对话框失败:', error);
      return { 
        canceled: true, 
        filePaths: [],
        error: error instanceof Error ? error.message : '显示对话框失败'
      };
    }
  });

  // 从模板创建项目
  ipcMain.handle('fs:createProjectFromTemplate', async (_, projectConfig: any) => {
    try {
      console.log('📡 收到 fs:createProjectFromTemplate IPC调用:', projectConfig);
      // 调用服务层创建项目
      await FileSystemService.createProjectFromTemplate(projectConfig);
      return { success: true };
    } catch (error) {
      console.error('📡 fs:createProjectFromTemplate 失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '创建项目失败' 
      };
    }
  });

  // 获取项目包信息
  ipcMain.handle('project:getPackageInfo', async (_, projectPath: string) => {
    try {
      console.log('📡 收到 project:getPackageInfo IPC调用:', projectPath);
      const packageJsonPath = path.join(projectPath, 'package.json');
      
      if (!fs.existsSync(packageJsonPath)) {
        return { 
          success: false, 
          error: 'package.json 文件不存在',
          errorType: 'MISSING_PACKAGE_JSON',
          data: {
            packageJsonPath,
            nodeModulesExists: fs.existsSync(path.join(projectPath, 'node_modules'))
          }
        };
      }

      const packageContent = fs.readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageContent);
      
      // 获取安装的依赖
      const nodeModulesPath = path.join(projectPath, 'node_modules');
      const nodeModulesExists = fs.existsSync(nodeModulesPath);
      
      let installedDependencies: string[] = [];
      if (nodeModulesExists) {
        try {
          const nodeModulesContents = fs.readdirSync(nodeModulesPath);
          installedDependencies = nodeModulesContents.filter(item => 
            !item.startsWith('.') && fs.statSync(path.join(nodeModulesPath, item)).isDirectory()
          );
        } catch (error) {
          console.warn('读取 node_modules 失败:', error);
        }
      }

      return { 
        success: true, 
        data: {
          packageJson,
          installedDependencies,
          nodeModulesExists
        }
      };
    } catch (error) {
      console.error('📡 project:getPackageInfo 失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '获取包信息失败' 
      };
    }
  });

  // 安装项目依赖
  ipcMain.handle('project:installDependencies', async (_, projectPath: string) => {
    try {
      console.log('📡 收到 project:installDependencies IPC调用:', projectPath);
      
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      // 在项目目录中运行 npm install
      const { stdout, stderr } = await execAsync('npm install', { 
        cwd: projectPath,
        timeout: 60000 // 60秒超时
      });

      console.log('npm install 输出:', stdout);
      if (stderr) {
        console.warn('npm install 警告:', stderr);
      }

      return { 
        success: true, 
        data: { stdout, stderr }
      };
    } catch (error) {
      console.error('📡 project:installDependencies 失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '安装依赖失败' 
      };
    }
  });

  // 安装特定的项目依赖包
  ipcMain.handle('project:installSpecificPackages', async (_, projectPath: string, packages: string[]) => {
    try {
      console.log('📡 收到 project:installSpecificPackages IPC调用:', projectPath, packages);
      
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      // 读取 package.json 获取版本信息
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageContent = fs.readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageContent);
      
      // 构建具体的包安装命令，包含版本号
      const packagesWithVersions = packages.map(pkg => {
        // 从 dependencies 或 devDependencies 中获取版本
        const version = packageJson.dependencies?.[pkg] || packageJson.devDependencies?.[pkg];
        return version ? `${pkg}@${version}` : pkg;
      });
      
      const packageList = packagesWithVersions.join(' ');
      // 使用 --no-package-lock --no-save 避免安装其他依赖
      const command = `npm install ${packageList} --no-package-lock --no-save`;
      
      console.log('执行命令:', command);
      
      const { stdout, stderr } = await execAsync(command, { 
        cwd: projectPath,
        timeout: 120000 // 2分钟超时
      });

      console.log('npm install 特定包输出:', stdout);
      if (stderr) {
        console.warn('npm install 特定包警告:', stderr);
      }

      return { 
        success: true, 
        data: { stdout, stderr, installedPackages: packages }
      };
    } catch (error) {
      console.error('📡 project:installSpecificPackages 失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '安装特定依赖包失败' 
      };
    }
  });

  // 创建基础的 package.json 文件
  ipcMain.handle('project:createPackageJson', async (_, projectPath: string, packageJsonConfig?: any) => {
    try {
      console.log('📡 收到 project:createPackageJson IPC调用:', projectPath, packageJsonConfig);
      const packageJsonPath = path.join(projectPath, 'package.json');
      
      if (fs.existsSync(packageJsonPath)) {
        return { 
          success: false, 
          error: 'package.json 文件已存在' 
        };
      }

      let packageJson;
      
      if (packageJsonConfig && typeof packageJsonConfig === 'object') {
        // 使用传入的完整配置
        packageJson = packageJsonConfig;
      } else {
        // 创建基础的 package.json（向后兼容）
        const folderName = (typeof packageJsonConfig === 'string' ? packageJsonConfig : null) || path.basename(projectPath);
        packageJson = {
          name: folderName,
          version: "1.0.0",
          description: "",
          main: "index.js",
          scripts: {
            test: "echo \"Error: no test specified\" && exit 1"
          },
          keywords: [],
          author: "",
          license: "ISC",
          dependencies: {},
          devDependencies: {}
        };
      }

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
      
      return { 
        success: true, 
        data: { packageJson, created: true }
      };
    } catch (error) {
      console.error('📡 project:createPackageJson 失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '创建 package.json 失败' 
      };
    }
  });

  // 读取文件内容
  ipcMain.handle('fs:readFile', async (_, filePath: string) => {
    console.log('📡 收到 fs:readFile IPC调用:', filePath);
    try {
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        return { 
          success: false, 
          error: '文件不存在' 
        };
      }

      // 读取文件内容
      const content = fs.readFileSync(filePath, 'utf-8');
      console.log('📡 fs:readFile 成功读取文件:', filePath);
      
      return { 
        success: true, 
        content: content 
      };
    } catch (error) {
      console.error('📡 fs:readFile 失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '读取文件失败' 
      };
    }
  });

  // 写入文件内容
  ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string) => {
    console.log('📡 收到 fs:writeFile IPC调用:', filePath);
    try {
      // 确保目录存在
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // 写入文件内容
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('📡 fs:writeFile 成功写入文件:', filePath);
      
      return { 
        success: true 
      };
    } catch (error) {
      console.error('📡 fs:writeFile 失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '写入文件失败' 
      };
    }
  });

  // 项目配置检测 - 单个项目
  ipcMain.handle('project:detectConfig', async (_, coreProject) => {
    try {
      console.log(`📡 收到 project:detectConfig IPC调用: ${coreProject.name}`);
      
      // 调试信息：打印当前目录
      console.log('当前 __dirname:', __dirname);
      
      // 尝试不同的路径解析方式
      try {
        // 尝试 require.resolve 来找到正确的路径
        const modulePath = require.resolve('../services/ProjectConfigService.cjs');
        console.log('找到模块路径:', modulePath);
        const { ProjectConfigService } = require(modulePath);
        const fullProject = await ProjectConfigService.detectProjectConfig(coreProject);
        
        console.log(`📡 project:detectConfig 成功返回: ${coreProject.name}`);
        return { success: true, data: fullProject };
      } catch (resolveError: any) {
        console.warn('无法通过 require.resolve 找到模块，尝试替代方案:', resolveError.message);
        
        // 备用方案：使用绝对路径从 dist 目录
        const path = require('path');
        const distPath = path.join(process.cwd(), 'dist', 'src', 'services', 'ProjectConfigService.cjs');
        console.log('尝试绝对路径:', distPath);
        
        const { ProjectConfigService } = require(distPath);
        const fullProject = await ProjectConfigService.detectProjectConfig(coreProject);
        
        console.log(`📡 project:detectConfig 成功返回: ${coreProject.name}`);
        return { success: true, data: fullProject };
      }
    } catch (error) {
      console.error('📡 project:detectConfig 失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '检测项目配置失败' 
      };
    }
  });

  // 项目配置检测 - 批量
  ipcMain.handle('project:detectMultipleConfigs', async (_, coreProjects) => {
    try {
      console.log(`📡 收到 project:detectMultipleConfigs IPC调用: ${coreProjects.length} 个项目`);
      
      // 尝试不同的路径解析方式
      try {
        // 尝试 require.resolve 来找到正确的路径
        const modulePath = require.resolve('../services/ProjectConfigService.cjs');
        console.log('找到模块路径:', modulePath);
        const { ProjectConfigService } = require(modulePath);
        const fullProjects = await ProjectConfigService.detectMultipleProjectConfigs(coreProjects);
        
        console.log(`📡 project:detectMultipleConfigs 成功返回: ${fullProjects.length} 个项目`);
        return { success: true, data: fullProjects };
      } catch (resolveError: any) {
        console.warn('无法通过 require.resolve 找到模块，尝试替代方案:', resolveError.message);
        
        // 备用方案：使用绝对路径从 dist 目录
        const path = require('path');
        const distPath = path.join(process.cwd(), 'dist', 'src', 'services', 'ProjectConfigService.cjs');
        console.log('尝试绝对路径:', distPath);
        
        const { ProjectConfigService } = require(distPath);
        const fullProjects = await ProjectConfigService.detectMultipleProjectConfigs(coreProjects);
        
        console.log(`📡 project:detectMultipleConfigs 成功返回: ${fullProjects.length} 个项目`);
        return { success: true, data: fullProjects };
      }
    } catch (error) {
      console.error('📡 project:detectMultipleConfigs 失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '批量检测项目配置失败' 
      };
    }
  });

  // 检查文件是否存在
  ipcMain.handle('fs:exists', async (_, filePath: string) => {
    console.log('📡 收到 fs:exists IPC调用，检查文件:', filePath);
    try {
      const exists = fs.existsSync(filePath);
      console.log('📡 fs:exists 检查结果:', filePath, '存在:', exists);
      return { success: true, data: exists };
    } catch (error) {
      console.error('📡 fs:exists 失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '检查文件存在失败' 
      };
    }
  });

  // 端口更新处理器 - 同时更新项目数据和.env文件
  ipcMain.handle('project:update-port', async (_, { projectPath, projectId, newPort }: { 
    projectPath: string; 
    projectId: string; 
    newPort: number; 
  }) => {
    console.log(`🔧 收到 project:update-port IPC调用: ${projectId} → ${newPort}`);
    
    try {
      let success = true;
      const results = [];

      // 1. 更新项目数据文件
      try {
        const projects = await FileSystemService.loadProjects();
        const projectIndex = projects.findIndex((p) => p.id === projectId);

        if (projectIndex !== -1) {
          // 更新端口
          const updatedProject = {
            ...projects[projectIndex],
            port: newPort,
          } as Project;

          projects[projectIndex] = updatedProject;
          await FileSystemService.saveProjects(projects);
          results.push('✅ 更新项目数据成功');
          console.log(`✅ 项目数据更新成功: ${projectId} → ${newPort}`);
        } else {
          results.push('❌ 未找到项目数据');
          success = false;
        }
      } catch (dataError) {
        console.error('❌ 更新项目数据失败:', dataError);
        results.push('❌ 更新项目数据失败');
        success = false;
      }

      // 2. 更新.env文件
      if (projectPath) {
        try {
          const envPath = path.join(projectPath, '.env');

          if (fs.existsSync(envPath)) {
            let envContent = fs.readFileSync(envPath, 'utf-8');

            // 替换或添加 PORT 配置
            if (envContent.includes('PORT=')) {
              envContent = envContent.replace(/PORT=\d+/g, `PORT=${newPort}`);
            } else {
              envContent += `\nPORT=${newPort}\n`;
            }

            fs.writeFileSync(envPath, envContent, 'utf-8');
            results.push('✅ 更新 .env 文件成功');
            console.log(`✅ .env 文件更新成功: PORT=${newPort}`);
          } else {
            // 创建新的 .env 文件
            fs.writeFileSync(envPath, `PORT=${newPort}\n`, 'utf-8');
            results.push('✅ 创建 .env 文件成功');
            console.log(`✅ 创建 .env 文件成功: PORT=${newPort}`);
          }
        } catch (envError) {
          console.error('❌ 更新 .env 文件失败:', envError);
          results.push('❌ 更新 .env 文件失败');
          success = false;
        }
      }

      return {
        success,
        data: {
          projectId,
          newPort,
          results,
        },
        message: results.join(', '),
      };
    } catch (error) {
      console.error(`❌ 端口更新失败:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新端口时发生错误',
      };
    }
  });

  // 更新项目启动配置
  ipcMain.handle('project:updateStartupConfig', async (_, projectPath: string, config: { startFile: string; startCommand: string }) => {
    try {
      console.log('📡 收到 project:updateStartupConfig IPC调用:', projectPath, config);
      
      const packageJsonPath = path.join(projectPath, 'package.json');
      
      if (!fs.existsSync(packageJsonPath)) {
        return {
          success: false,
          error: 'package.json 文件不存在'
        };
      }

      // 读取现有的 package.json
      const packageContent = fs.readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageContent);

      // 更新配置
      let updated = false;

      if (config.startFile) {
        packageJson.main = config.startFile;
        updated = true;
      }

      if (config.startCommand) {
        if (!packageJson.scripts) {
          packageJson.scripts = {};
        }
        packageJson.scripts.start = config.startCommand;
        updated = true;
      }

      if (updated) {
        // 写回 package.json，保持格式化
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
        console.log('✅ 启动配置已保存到 package.json');
        
        return {
          success: true,
          data: {
            main: packageJson.main,
            startScript: packageJson.scripts?.start
          }
        };
      }

      return {
        success: false,
        error: '没有提供有效的配置信息'
      };
    } catch (error) {
      console.error('📡 project:updateStartupConfig 失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '保存启动配置失败'
      };
    }
  });

  isSetup = true;
  console.log('🔗 文件系统IPC处理器已设置');
}
