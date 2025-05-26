// 项目类型定义
export interface Project {
  id: string;
  name: string;
  path: string;
  type: 'node' | 'react' | 'vue' | 'electron' | 'other';
  status: 'stopped' | 'running' | 'error';
  port?: number;
  lastOpened: Date;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  scripts: ProjectScript[];
  description?: string;
  version?: string;
}

export interface ProjectScript {
  name: string;
  command: string;
  description?: string;
}

// 应用状态类型
export interface AppState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  activeProject: Project | null;
}

// 操作类型
export type AppAction = 
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'REMOVE_PROJECT'; payload: string }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ACTIVE_PROJECT'; payload: Project | null }
  | { type: 'UPDATE_PROJECT_STATUS'; payload: { id: string; status: Project['status'] } };

// 文件系统相关类型
export interface FileSystemResult {
  success: boolean;
  data?: any;
  error?: string;
}

// IPC 通信类型
export interface IPCResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
