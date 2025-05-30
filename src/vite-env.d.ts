/// <reference types="vite/client" />

// Electron IPC 类型声明
interface ElectronAPI {
  invoke: (channel: string, ...args: any[]) => Promise<any>;
  showOpenDialog: (options: {
    properties: string[];
    title?: string;
    defaultPath?: string;
  }) => Promise<{
    canceled: boolean;
    filePaths: string[];
  }>;
  on: (channel: string, callback: (...args: any[]) => void) => void;
  removeListener: (channel: string, callback: (...args: any[]) => void) => void;
  getAppVersion: () => Promise<string>;
  platform: string;
  isDev: boolean; // 开发模式标识
  
  // 端口服务方法
  checkPort: (port: number) => Promise<{ available: boolean; error?: string }>;
  updateProjectPort: (projectId: string, port: number) => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
    electronAPI?: ElectronAPI;
  }
}
