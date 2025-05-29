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
    ipcMain.removeHandler('fs:updateProjectStatus');
    ipcMain.removeHandler('fs:getDataInfo');
    ipcMain.removeHandler('fs:validateDirectory');
    ipcMain.removeHandler('dialog:showOpenDialog');
    ipcMain.removeHandler('fs:createProjectFromTemplate');
    ipcMain.removeHandler('project:getPackageInfo');
    ipcMain.removeHandler('project:installDependencies');
    ipcMain.removeHandler('project:installSpecificPackages');
    ipcMain.removeHandler('project:createPackageJson');
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

  // 更新项目状态
  ipcMain.handle('fs:updateProjectStatus', async (_, projectId: string, status: Project['status']) => {
    try {
      await FileSystemService.updateProjectStatus(projectId, status);
      return { success: true, data: { projectId, status } };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '更新项目状态失败' 
      };
    }
  });

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
  ipcMain.handle('project:createPackageJson', async (_, projectPath: string, projectName?: string) => {
    try {
      console.log('📡 收到 project:createPackageJson IPC调用:', projectPath, projectName);
      const packageJsonPath = path.join(projectPath, 'package.json');
      
      if (fs.existsSync(packageJsonPath)) {
        return { 
          success: false, 
          error: 'package.json 文件已存在' 
        };
      }

      // 创建基础的 package.json
      const folderName = projectName || path.basename(projectPath);
      const packageJson = {
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

  isSetup = true;
  console.log('🔗 文件系统IPC处理器已设置');
}
