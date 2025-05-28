/// <reference types="node" />
/// <reference types="electron" />

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

// 导入IPC设置
const { setupFileSystemIPC } = require('./src/ipc/fileSystemIPC.cjs');
const { setupPM2IPC } = require('./src/ipc/pm2IPC.cjs');
const { setupSettingsIPC } = require('./src/ipc/settingsIPC.cjs');

// 开发模式标识
const isDev = process.env.NODE_ENV === 'development';
const VITE_DEV_SERVER_URL = 'http://localhost:9966';

// 全局主窗口引用
let mainWindow: any;

console.log('🚀 启动 Electron...');
console.log('📊 开发模式:', isDev);
console.log('🌐 服务器地址:', isDev ? VITE_DEV_SERVER_URL : '本地文件');

function createWindow(): void {
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
    show: false, // 先不显示，等加载完成后再显示
    center: true, // 窗口居中显示
  });

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('✅ Electron 窗口已显示');
  });

  // 根据环境加载不同的内容
  if (isDev) {
    // 开发模式：从本地开发服务器加载
    console.log('🔗 正在连接 Vite 开发服务器...');
    mainWindow.loadURL(VITE_DEV_SERVER_URL).catch((err: Error) => {
      console.error('❌ 无法连接到 Vite 开发服务器:', err.message);
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
  
  // 设置文件系统IPC处理器
  setupFileSystemIPC();
  
  // 设置PM2 IPC处理器
  setupPM2IPC();
  
  // 设置设置IPC处理器
  setupSettingsIPC();
  
  createWindow();

  app.on('activate', () => {
    // 在 macOS 上，当单击 dock 图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) {
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