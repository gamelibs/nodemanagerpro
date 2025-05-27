import { createContext, useContext, useReducer, type ReactNode, useEffect, useState } from 'react';
import type { AppState, AppAction } from '../types';

// 初始状态
const initialState: AppState = {
  projects: [],
  isLoading: false,
  error: null,
  activeProject: null,
  logSessions: [], // 初始化日志会话
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload, isLoading: false };
    
    case 'ADD_PROJECT':
      return { 
        ...state, 
        projects: [...state.projects, action.payload],
        error: null 
      };
    
    case 'REMOVE_PROJECT':
      return { 
        ...state, 
        projects: state.projects.filter(p => p.id !== action.payload),
        activeProject: state.activeProject?.id === action.payload ? null : state.activeProject
      };
    
    case 'UPDATE_PROJECT':
      return { 
        ...state, 
        projects: state.projects.map(p => 
          p.id === action.payload.id ? action.payload : p
        ),
        activeProject: state.activeProject?.id === action.payload.id ? action.payload : state.activeProject
      };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_ACTIVE_PROJECT':
      return { ...state, activeProject: action.payload };
    
    case 'UPDATE_PROJECT_STATUS':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.id 
            ? { ...p, status: action.payload.status }
            : p
        )
      };
    
    case 'START_LOG_SESSION':
      const existingSession = state.logSessions.find(s => s.projectId === action.payload.projectId);
      if (existingSession) {
        return {
          ...state,
          logSessions: state.logSessions.map(s =>
            s.projectId === action.payload.projectId
              ? { ...s, isActive: true }
              : s
          )
        };
      }
      return {
        ...state,
        logSessions: [...state.logSessions, {
          projectId: action.payload.projectId,
          projectName: action.payload.projectName,
          startTime: new Date(),
          logs: [],
          isActive: true
        }]
      };
    
    case 'END_LOG_SESSION':
      return {
        ...state,
        logSessions: state.logSessions.map(s =>
          s.projectId === action.payload
            ? { ...s, isActive: false }
            : s
        )
      };
    
    case 'ADD_LOG':
      return {
        ...state,
        logSessions: state.logSessions.map(s =>
          s.projectId === action.payload.projectId
            ? { ...s, logs: [...s.logs, action.payload] }
            : s
        )
      };
    
    case 'CLEAR_PROJECT_LOGS':
      return {
        ...state,
        logSessions: state.logSessions.map(s =>
          s.projectId === action.payload
            ? { ...s, logs: [] }
            : s
        )
      };
    
    default:
      return state;
  }
}

// 扩展 AppContextValue 类型
export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // 添加导航状态
  navigation: {
    activeTab: 'settings' | 'projects';
    setActiveTab: (tab: 'settings' | 'projects') => void;
  };
}

export const AppContext = createContext<AppContextValue | undefined>(undefined);

// Provider 组件
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [activeTab, setActiveTab] = useState<'settings' | 'projects'>('projects');

  // 应用初始化
  useEffect(() => {
    // 启动时初始化为空数组，实际的项目加载会通过 ProjectService 进行
    dispatch({ type: 'SET_PROJECTS', payload: [] });
  }, []);
  
  // 项目状态变化不再自动保存到localStorage
  // 保存操作由 ProjectService 统一处理

  const contextValue: AppContextValue = {
    state,
    dispatch,
    navigation: {
      activeTab,
      setActiveTab
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
