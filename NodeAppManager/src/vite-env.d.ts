/// <reference types="vite/client" />

// Electron IPC 类型声明
interface ElectronAPI {
  showOpenDialog: (options: {
    properties: string[];
    title?: string;
    defaultPath?: string;
  }) => Promise<{
    canceled: boolean;
    filePaths: string[];
  }>;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
