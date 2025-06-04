/// <reference types="node" />
/// <reference types="electron" />

import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';

// 在运行时动态导入，避免编译时的模块解析问题
const setupFileSystemIPC = require('./src/ipc/fileSystemIPC.cjs').setupFileSystemIPC;
const setupPM2IPC = require('./src/ipc/pm2IPC.cjs').setupPM2IPC;
const setupPortIPC = require('./src/ipc/portIPC.cjs').setupPortIPC;
const setupSettingsIPC = require('./src/ipc/settingsIPC.cjs').setupSettingsIPC;
const setupLoggerIPC = require('./src/ipc/loggerIPC.cjs').setupLoggerIPC;

// 导入日志服务
const LoggerService = require('./src/services/LoggerService.cjs').LoggerService;

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
            // 暂时直接在开发模式下打开开发者工具
            console.log('🔧 开发模式：打开开发者工具');
            mainWindow.webContents.openDevTools({ mode: 'detach' });
            LoggerService.info('开发模式自动打开开发者工具');
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
  
  // 设置设置IPC处理器
  setupSettingsIPC();
  LoggerService.info('设置 IPC 处理器已设置');
  
  // 设置日志IPC处理器
  setupLoggerIPC();
  LoggerService.info('日志 IPC 处理器已设置');
  
  // 设置PM2 IPC处理器
  setupPM2IPC();
  LoggerService.info('PM2 IPC 处理器已设置');
  
  // 设置端口检测IPC处理器
  setupPortIPC();
  LoggerService.info('端口检测 IPC 处理器已设置');
  
  LoggerService.info('Shell IPC 处理器将在文件末尾设置');
  
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

// 文件对话框IPC处理器
ipcMain.handle('dialog:showOpenDialog', async (event: any, options: any) => {
  try {
    LoggerService.info('显示文件对话框', { options });
    const result = await dialog.showOpenDialog(mainWindow, options);
    LoggerService.info('文件对话框结果', { result });
    return result;
  } catch (error) {
    LoggerService.error('文件对话框错误', error);
    return { 
      canceled: true, 
      error: error instanceof Error ? error.message : '打开文件对话框失败' 
    };
  }
});

// Shell操作IPC处理器
ipcMain.handle('shell:openExternal', async (event: any, url: string) => {
  try {
    LoggerService.info('使用外部应用打开URL', { url });
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    LoggerService.error('打开外部URL失败', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '打开外部链接失败' 
    };
  }
});

ipcMain.handle('shell:openPath', async (event: any, path: string) => {
  try {
    LoggerService.info('在文件管理器中打开路径', { path });
    const result = await shell.openPath(path);
    if (result) {
      LoggerService.warn('打开路径时出现问题', { path, result });
      return { success: false, error: result };
    }
    return { success: true };
  } catch (error) {
    LoggerService.error('打开路径失败', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '打开路径失败' 
    };
  }
});

ipcMain.handle('shell:openInEditor', async (event: any, path: string) => {
  try {
    LoggerService.info('在编辑器中打开路径', { path });
    
    const { spawn, exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    // 在macOS上的处理策略
    if (process.platform === 'darwin') {
      try {
        // 方法1：直接使用 open 命令打开 VS Code（最可靠）
        const openProcess = spawn('open', ['-a', 'Visual Studio Code', path], { 
          detached: true, 
          stdio: 'ignore' 
        });
        
        // 等待一小段时间确保命令执行
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            resolve(null);
          }, 1000);
          
          openProcess.on('error', (error: any) => {
            clearTimeout(timeout);
            reject(error);
          });
          
          openProcess.on('exit', (code: any) => {
            clearTimeout(timeout);
            if (code === 0) {
              resolve(null);
            } else {
              reject(new Error(`open命令退出代码: ${code}`));
            }
          });
        });
        
        LoggerService.info('使用open命令打开VS Code成功');
        return { success: true };
        
      } catch (openError: any) {
        LoggerService.warn('open命令失败，尝试其他方法', { error: openError?.message || String(openError) });
        
        // 方法2：检查是否安装了code命令行工具
        try {
          await execAsync('which code');
          // 如果code命令存在，使用它
          const codeProcess = spawn('code', [path], { detached: true, stdio: 'ignore' });
          
          // 等待一小段时间确保命令执行
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              resolve(null);
            }, 1000);
            
            codeProcess.on('error', (error: any) => {
              clearTimeout(timeout);
              reject(error);
            });
            
            codeProcess.on('exit', (code: any) => {
              clearTimeout(timeout);
              resolve(null);
            });
          });
          
          LoggerService.info('使用code命令打开成功');
          return { success: true };
        } catch (whichError: any) {
          LoggerService.warn('code命令不可用', { error: whichError?.message || String(whichError) });
        }
        
        // 方法3：尝试其他常见编辑器
        const editors = [
          { app: 'Sublime Text', name: 'sublime' },
          { app: 'Atom', name: 'atom' },
          { app: 'TextMate', name: 'textmate' },
          { app: 'MacVim', name: 'macvim' }
        ];
        
        for (const editor of editors) {
          try {
            const editorProcess = spawn('open', ['-a', editor.app, path], { 
              detached: true, 
              stdio: 'ignore' 
            });
            
            // 等待一小段时间确保命令执行
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                resolve(null);
              }, 500);
              
              editorProcess.on('error', (error: any) => {
                clearTimeout(timeout);
                reject(error);
              });
              
              editorProcess.on('exit', (code: any) => {
                clearTimeout(timeout);
                if (code === 0) {
                  resolve(null);
                } else {
                  reject(new Error(`${editor.app}退出代码: ${code}`));
                }
              });
            });
            
            LoggerService.info(`使用${editor.app}打开成功`);
            return { success: true };
          } catch (editorError: any) {
            LoggerService.warn(`${editor.app}不可用`, { error: editorError?.message || String(editorError) });
          }
        }
      }
    } else {
      // Windows/Linux 处理
      const editors = ['code', 'subl', 'atom', 'notepad++'];
      
      for (const editor of editors) {
        try {
          await execAsync(`which ${editor} || where ${editor}`);
          const editorProcess = spawn(editor, [path], { detached: true, stdio: 'ignore' });
          
          // 等待一小段时间确保命令执行
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              resolve(null);
            }, 1000);
            
            editorProcess.on('error', (error: any) => {
              clearTimeout(timeout);
              reject(error);
            });
            
            editorProcess.on('exit', (code: any) => {
              clearTimeout(timeout);
              resolve(null);
            });
          });
          
          LoggerService.info(`使用${editor}打开成功`);
          return { success: true };
        } catch (error: any) {
          LoggerService.warn(`${editor}不可用`, { error: error?.message || String(error) });
        }
      }
    }
    
    // 最后的后备方案：使用系统默认编辑器
    try {
      const result = await shell.openPath(path);
      if (result === '') {
        LoggerService.info('使用系统默认应用打开成功');
        return { success: true };
      } else {
        LoggerService.warn('系统默认应用打开失败', { error: result });
        return { 
          success: false, 
          error: `无法找到合适的编辑器打开项目。请确保已安装VS Code或其他代码编辑器。\n\n建议：\n1. 安装VS Code并确保可以通过Finder打开\n2. 或安装VS Code命令行工具 (code命令)\n3. 错误详情: ${result}` 
        };
      }
    } catch (fallbackError: any) {
      LoggerService.error('所有编辑器尝试都失败了', fallbackError);
      return { 
        success: false, 
        error: `无法打开编辑器。请确保已安装代码编辑器（如VS Code）。\n\n错误详情: ${fallbackError?.message || String(fallbackError)}` 
      };
    }
    
  } catch (error) {
    LoggerService.error('在编辑器中打开失败', error);
    return { 
      success: false, 
      error: `打开编辑器时发生错误: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
});