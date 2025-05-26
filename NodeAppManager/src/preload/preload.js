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
      'fs:getDataInfo'
    ];
    
    if (allowedChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    } else {
      throw new Error(`不允许的IPC频道: ${channel}`);
    }
  },

  // 获取应用信息
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  
  // 平台信息
  platform: process.platform,
  
  // 开发模式标识
  isDev: process.env.NODE_ENV === 'development'
});
