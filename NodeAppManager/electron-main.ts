/// <reference types="node" />
/// <reference types="electron" />

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

// 导入IPC设置
const { setupFileSystemIPC } = require('./src/ipc/fileSystemIPC.cjs');
const { setupPM2IPC } = require('./src/ipc/pm2IPC.cjs');

// 开发模式标识
const isDev = process.env.NODE_ENV === 'development';
const VITE_DEV_SERVER_URL = 'http://localhost:9966';

console.log('🚀 启动 Electron...');
console.log('📊 开发模式:', isDev);
console.log('🌐 服务器地址:', isDev ? VITE_DEV_SERVER_URL : '本地文件');

function createWindow(): void {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false, // 关闭node集成以提高安全性
      contextIsolation: true, // 启用上下文隔离
      webSecurity: !isDev, // 开发模式下关闭 web 安全性检查
      preload: path.join(__dirname, '../src/preload/preload.js'), // 设置preload脚本
    },
    backgroundColor: '#0F172A',
    titleBarStyle: 'default',
    show: false, // 先不显示，等加载完成后再显示
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
    
    // 打开开发者工具
    mainWindow.webContents.openDevTools();
    
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