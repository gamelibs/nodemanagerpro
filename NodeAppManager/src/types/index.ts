// 项目模板类型
export type ProjectTemplate = 'express' | 'vite-express';

// 前端框架类型（仅用于 vite-express 模板）
export type FrontendFramework = 'vanilla-ts' | 'react' | 'vue';

// 项目类型定义
export interface Project {
  id: string;
  name: string;
  path: string;
  type: 'node' | 'react' | 'vue' | 'electron' | 'other' | 'express' | 'vite-express';
  status: 'stopped' | 'running' | 'error';
  port?: number;
  lastOpened: Date;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  scripts: ProjectScript[];
  description?: string;
  version?: string;
  template?: ProjectTemplate;
  frontendFramework?: FrontendFramework;
}

export interface ProjectScript {
  name: string;
  command: string;
  description?: string;
}

// 项目日志类型
export interface ProjectLog {
  id: string;
  projectId: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  source?: 'system' | 'stdout' | 'stderr';
}

// 项目日志会话类型
export interface ProjectLogSession {
  projectId: string;
  projectName: string;
  startTime: Date;
  logs: ProjectLog[];
  isActive: boolean;
}

// 应用状态类型
export interface AppState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  activeProject: Project | null;
  logSessions: ProjectLogSession[]; // 添加日志会话
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
  | { type: 'UPDATE_PROJECT_STATUS'; payload: { id: string; status: Project['status'] } }
  | { type: 'START_LOG_SESSION'; payload: { projectId: string; projectName: string } }
  | { type: 'END_LOG_SESSION'; payload: string }
  | { type: 'ADD_LOG'; payload: ProjectLog }
  | { type: 'CLEAR_PROJECT_LOGS'; payload: string };

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

// 项目创建配置接口
export interface ProjectCreationConfig {
  name: string;
  path: string;
  template: ProjectTemplate;
  frontendFramework?: FrontendFramework; // 仅用于 vite-express 模板
  port: number;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  tools: {
    eslint: boolean;
    prettier: boolean;
    jest: boolean;
    envConfig: boolean;
    autoInstall: boolean;
    git: boolean;
  };
}

// 包管理器信息接口
export interface PackageManagerInfo {
  id: 'npm' | 'yarn' | 'pnpm';
  name: string;
  description: string;
  command: string;
}

// 模板信息接口
export interface TemplateInfo {
  id: ProjectTemplate;
  name: string;
  description: string;
  features: string[];
  supportsFrontendFramework: boolean;
}
