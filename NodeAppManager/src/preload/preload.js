// Electron preload脚本 - 在渲染进程中提供安全的IPC接口
const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // IPC invoke方法
  invoke: (channel, ...args) => {
    // 只允许特定的频道
    const allowedChannels = [
      'fs:loadProjects',
      'fs:saveProjects', 
      'fs:addProject',
      'fs:removeProject',
      'fs:updateProjectStatus',
      'fs:getDataInfo',
      'fs:validateDirectory', // 添加目录验证频道
      'fs:createProjectFromTemplate', // 添加创建项目模板频道
      'dialog:showOpenDialog', // 添加文件对话框频道
      'shell:openExternal', // 添加使用系统默认浏览器打开URL频道
      // 设置相关频道
      'settings:load',
      'settings:save',
      // 开发者工具控制频道
      'dev-tools:toggle',
      'dev-tools:status',
      // PM2 相关频道
      'pm2:check-installation',
      'pm2:install',
      'pm2:version',
      'pm2:connect',
      'pm2:start',
      'pm2:stop',
      'pm2:restart',
      'pm2:delete',
      'pm2:list',
      'pm2:describe',
      'pm2:logs',
      'pm2:start-log-stream',
      'pm2:stop-log-stream',
      // 日志相关频道
      'logger:getLogDirectory',
      'logger:getRecentLogFiles',
      'logger:readLogFile',
      'logger:log',
      // 项目管理相关频道
      'project:getPackageInfo',
      'project:installDependencies',
      'project:installSpecificPackages',
      'project:createPackageJson',
    ];
    
    if (allowedChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    } else {
      throw new Error(`不允许的IPC频道: ${channel}`);
    }
  },

  // 文件对话框
  showOpenDialog: (options) => ipcRenderer.invoke('dialog:showOpenDialog', options),

  // 事件监听器
  on: (channel, callback) => {
    const allowedChannels = ['pm2:log-data'];
    if (allowedChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },

  // 移除事件监听器
  removeListener: (channel, callback) => {
    const allowedChannels = ['pm2:log-data'];
    if (allowedChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, callback);
    }
  },

  // 获取应用信息
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  
  // 平台信息
  platform: process.platform,
  
  // 开发模式标识
  isDev: process.env.NODE_ENV === 'development'
});
