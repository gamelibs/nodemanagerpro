/// <reference types="node" />
/// <reference types="electron" />

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');

// 导入IPC设置
const { setupFileSystemIPC } = require('./src/ipc/fileSystemIPC.cjs');
const { setupPM2IPC } = require('./src/ipc/pm2IPC.cjs');
const { setupSettingsIPC } = require('./src/ipc/settingsIPC.cjs');
const { setupLoggerIPC } = require('./src/ipc/loggerIPC.cjs');
const { setupPortIPC } = require('./src/ipc/portIPC.cjs');

// 导入日志服务
const { LoggerService } = require('./src/services/LoggerService.cjs');

// 开发模式标识
const isDev = process.env.NODE_ENV === 'development';
const VITE_DEV_SERVER_URL = 'http://localhost:9966';

// 全局主窗口引用
let mainWindow: any;

// 初始化日志服务
LoggerService.initialize();

console.log('🚀 启动 Electron...');
LoggerService.info('Electron 应用启动', { isDev, url: isDev ? VITE_DEV_SERVER_URL : '本地文件' });
console.log('📊 开发模式:', isDev);
console.log('🌐 服务器地址:', isDev ? VITE_DEV_SERVER_URL : '本地文件');

function createWindow(): void {
  LoggerService.info('开始创建主窗口');
  
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1400,     // 增加宽度，更适合项目管理界面
    height: 900,     // 增加高度，提供更好的显示空间
    minWidth: 1000,  // 提高最小宽度
    minHeight: 700,  // 提高最小高度
    webPreferences: {
      nodeIntegration: false, // 关闭node集成以提高安全性
      contextIsolation: true, // 启用上下文隔离
      webSecurity: !isDev, // 开发模式下关闭 web 安全性检查
      preload: path.join(__dirname, '../src/preload/preload.js'), // 设置preload脚本
    },
    backgroundColor: '#0F172A',
    titleBarStyle: 'default',
    title: 'NodeHub Pro',
    show: false, // 先不显示，等加载完成后再显示
    center: true, // 窗口居中显示
  });

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', async () => {
    mainWindow.show();
    console.log('✅ Electron 窗口已显示');
    LoggerService.info('Electron 窗口显示完成');
    
    // 在开发模式下，根据设置决定是否打开开发者工具
    if (isDev) {
      try {
        // 延迟一点时间确保所有初始化完成
        setTimeout(async () => {
          try {
            const { loadSettingsFromMain } = require('./src/ipc/settingsIPC.cjs');
            const result = await loadSettingsFromMain();
            
            if (result.success && result.data && result.data.devTools) {
              console.log('🔧 根据设置打开开发者工具');
              mainWindow.webContents.openDevTools({ mode: 'detach' });
              LoggerService.info('根据设置自动打开开发者工具');
            } else {
              console.log('🔧 根据设置不打开开发者工具');
              LoggerService.info('根据设置不自动打开开发者工具');
            }
          } catch (error) {
            console.warn('⚠️ 无法加载开发者工具设置，使用默认行为:', error);
            LoggerService.warn('无法加载开发者工具设置', error);
          }
        }, 1000);
      } catch (error) {
        console.warn('⚠️ 设置模块加载失败，跳过开发者工具自动打开:', error);
      }
    }
  });

  // 根据环境加载不同的内容
  if (isDev) {
    // 开发模式：从本地开发服务器加载
    console.log('🔗 正在连接 Vite 开发服务器...');
    LoggerService.info('连接 Vite 开发服务器', { url: VITE_DEV_SERVER_URL });
    mainWindow.loadURL(VITE_DEV_SERVER_URL).catch((err: Error) => {
      console.error('❌ 无法连接到 Vite 开发服务器:', err.message);
      LoggerService.error('无法连接到 Vite 开发服务器', err);
      console.log('💡 请确保 Vite 开发服务器正在运行 (npm run dev)');
    });
    
    // 不再默认打开开发者工具，改为通过设置控制
    
    // 开发模式下启用实时重载
    mainWindow.webContents.on('did-frame-finish-load', () => {
      if (isDev) {
        mainWindow.webContents.executeJavaScript(`
          console.log('🚀 Electron + Vite 开发模式启动成功');
        `);
      }
    });
  } else {
    // 生产模式：从本地文件加载
    const indexPath = path.join(__dirname, 'index.html');
    console.log('📁 加载本地文件:', indexPath);
    LoggerService.info('加载本地文件', { path: indexPath });
    mainWindow.loadFile(indexPath);
  }

  // 在开发模式下，监听页面刷新
  if (isDev) {
    mainWindow.webContents.on('before-input-event', (event: any, input: any) => {
      // Cmd+R 或 Ctrl+R 刷新页面
      if ((input.meta || input.control) && input.key === 'r') {
        console.log('🔄 手动刷新页面');
        mainWindow.reload();
      }
    });
  }

  // 错误处理
  mainWindow.webContents.on('did-fail-load', (event: any, errorCode: number, errorDescription: string) => {
    console.error('❌ 页面加载失败:', errorCode, errorDescription);
  });

  return mainWindow;
}

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  console.log('⚡ Electron 应用已准备就绪');
  LoggerService.info('Electron 应用已准备就绪');
  
  // 设置文件系统IPC处理器
  setupFileSystemIPC();
  LoggerService.info('文件系统 IPC 处理器已设置');
  
  // 设置PM2 IPC处理器
  setupPM2IPC();
  LoggerService.info('PM2 IPC 处理器已设置');
  
  // 设置端口检测IPC处理器
  setupPortIPC();
  LoggerService.info('端口检测 IPC 处理器已设置');
  
  // 设置设置IPC处理器
  setupSettingsIPC();
  LoggerService.info('设置 IPC 处理器已设置');
  
  // 设置日志IPC处理器
  setupLoggerIPC();
  LoggerService.info('日志 IPC 处理器已设置');
  
  // 设置 Shell IPC 处理器
  ipcMain.handle('shell:openExternal', async (_: any, url: string) => {
    try {
      await shell.openExternal(url);
      return { success: true };
    } catch (error) {
      console.error('打开外部链接失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '打开链接失败' 
      };
    }
  });

  // 在文件夹中打开项目
  ipcMain.handle('shell:openPath', async (_: any, path: string) => {
    try {
      await shell.openPath(path);
      return { success: true };
    } catch (error) {
      console.error('打开文件夹失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '打开文件夹失败' 
      };
    }
  });

  // 在默认编辑器中打开项目
  ipcMain.handle('shell:openInEditor', async (_: any, path: string) => {
    try {
      const { spawn } = require('child_process');
      const process = require('process');
      
      // 加载设置获取默认编辑器
      let defaultEditor = 'vscode';
      let customCommand = '';
      
      try {
        const { loadSettingsFromMain } = require('./src/ipc/settingsIPC.cjs');
        const settingsResult = await loadSettingsFromMain();
        if (settingsResult.success && settingsResult.settings?.projects?.editor) {
          defaultEditor = settingsResult.settings.projects.editor.defaultEditor || 'vscode';
          customCommand = settingsResult.settings.projects.editor.customEditorCommand || '';
        }
      } catch (error) {
        console.warn('读取编辑器设置失败，使用默认设置:', error);
      }
      
      let command: string;
      let args: string[];
      
      // 如果有自定义命令，优先使用
      if (defaultEditor === 'custom' && customCommand) {
        // 解析自定义命令
        const parts = customCommand.split(' ');
        command = parts[0];
        args = [...parts.slice(1), path];
      } else {
        // 根据编辑器类型和平台设置命令
        switch (defaultEditor) {
          case 'webstorm':
            if (process.platform === 'darwin') {
              // macOS: 使用 -n 参数确保新建窗口
              command = 'open';
              args = ['-n', '-a', 'WebStorm', path];
            } else {
              // Windows/Linux: WebStorm 默认会在新窗口打开不同项目
              command = 'webstorm';
              args = [path];
            }
            break;
          case 'sublime':
            if (process.platform === 'darwin') {
              // macOS: 使用 -n 参数确保新建窗口
              command = 'open';
              args = ['-n', '-a', 'Sublime Text', path];
            } else {
              // Windows/Linux: 使用 --new-window 参数
              command = 'subl';
              args = ['--new-window', path];
            }
            break;
          case 'atom':
            // Atom: 使用 --new-window 参数
            command = 'atom';
            args = ['--new-window', path];
            break;
          case 'vim':
            // Vim: 在终端中打开新实例
            if (process.platform === 'darwin') {
              command = 'open';
              args = ['-a', 'Terminal', path];
            } else {
              command = 'vim';
              args = [path];
            }
            break;
          case 'vscode':
          default:
            if (process.platform === 'darwin') {
              // macOS: 使用 -n 参数确保新建窗口
              command = 'open';
              args = ['-n', '-a', 'Visual Studio Code', path];
            } else {
              // Windows/Linux: 使用 --new-window 参数确保新建窗口
              command = 'code';
              args = ['--new-window', path];
            }
            break;
        }
      }
      
      spawn(command, args, { 
        detached: true,
        stdio: 'ignore' 
      }).unref();
      
      return { success: true };
    } catch (error) {
      console.error('打开编辑器失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '打开编辑器失败' 
      };
    }
  });

  LoggerService.info('Shell IPC 处理器已设置');
  
  createWindow();

  app.on('activate', () => {
    // 在 macOS 上，当单击 dock 图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) {
      LoggerService.info('重新创建窗口 (macOS activate)');
      createWindow();
    }
  });
});

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 在 macOS 上，
// 通常用户在明确地按下 Cmd + Q 之前，应用会保持活动状态，
// 因此我们不应该关闭所有窗口后就退出程序。
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    console.log('👋 退出 Electron 应用');
    LoggerService.info('Electron 应用退出', { platform: process.platform });
    app.quit();
  }
});

// 在这个文件中，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。
if (isDev) {
  app.on('web-contents-created', (event: any, contents: any) => {
    contents.on('crashed', () => {
      console.error('💥 渲染进程崩溃');
    });
  });
}

// 设置调试工具控制IPC处理器
ipcMain.handle('dev-tools:toggle', async () => {
  try {
    if (mainWindow && mainWindow.webContents) {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
        console.log('🔧 关闭开发者工具');
        return { success: true, isOpen: false };
      } else {
        // 以独立窗口方式打开开发者工具
        mainWindow.webContents.openDevTools({ mode: 'detach' });
        console.log('🔧 打开开发者工具（独立窗口）');
        return { success: true, isOpen: true };
      }
    }
    return { success: false, error: '主窗口不可用' };
  } catch (error) {
    console.error('🔧 切换开发者工具失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '切换开发者工具失败' 
    };
  }
});

ipcMain.handle('dev-tools:status', async () => {
  try {
    if (mainWindow && mainWindow.webContents) {
      const isOpen = mainWindow.webContents.isDevToolsOpened();
      return { success: true, isOpen };
    }
    return { success: false, error: '主窗口不可用' };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '获取开发者工具状态失败' 
    };
  }
});