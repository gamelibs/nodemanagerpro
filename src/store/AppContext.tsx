import { createContext, useContext, useReducer, useRef, type ReactNode, useEffect, useState } from 'react';
import type { AppState, AppAction, AppSettings } from '../types';
import { SettingsService } from '../services/SettingsService';
import { I18nService } from '../services/i18n';

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

    case 'UPDATE_PROJECT_PARTIAL':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
        activeProject: state.activeProject?.id === action.payload.id
          ? { ...state.activeProject, ...action.payload.updates }
          : state.activeProject
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_ACTIVE_PROJECT':
      return { ...state, activeProject: action.payload };

    case 'UPDATE_PROJECT_STATUS':
      console.log(`🔄 [Reducer] 更新项目状态:`, {
        projectId: action.payload.id,
        newStatus: action.payload.status,
        timestamp: new Date().toISOString()
      });

      const updatedProjects = state.projects.map(p => {
        if (p.id === action.payload.id) {
          console.log(`📝 [Reducer] 项目 "${p.name}" 状态更新: ${p.status} -> ${action.payload.status}`);
          return { ...p, status: action.payload.status };
        }
        return p;
      });

      return {
        ...state,
        projects: updatedProjects
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
  // 添加设置和国际化
  settings: {
    current: AppSettings;
    updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
    resetSettings: () => void;
  };
  i18n: {
    t: (key: string) => string;
    language: 'zh' | 'en';
  };
}

export const AppContext = createContext<AppContextValue | undefined>(undefined);

// Provider 组件
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [activeTab, setActiveTab] = useState<'settings' | 'projects'>('projects');
  const [currentSettings, setCurrentSettings] = useState<AppSettings | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<'zh' | 'en'>('zh');

  // 使用 useRef 追踪初始化状态 - 防止严格模式重复执行
  const initializationRef = useRef({
    settingsLoaded: false,
    projectsInitialized: false
  });

  // 应用初始化
  useEffect(() => {
    console.log('🔧 [AppContext] useEffect 执行，当前状态:', {
      settingsLoaded: initializationRef.current.settingsLoaded,
      projectsInitialized: initializationRef.current.projectsInitialized
    });

    // 防止设置重复初始化
    if (initializationRef.current.settingsLoaded) {
      console.log('⚠️ [AppContext] 设置已加载，跳过重复初始化');
      return;
    }

    // 标记开始初始化（立即标记，防止异步竞态）
    initializationRef.current.settingsLoaded = true;

    // 初始化项目状态（只在第一次执行）
    if (!initializationRef.current.projectsInitialized) {
      console.log('🔧 [AppContext] 初始化项目状态');
      dispatch({ type: 'SET_PROJECTS', payload: [] });
      initializationRef.current.projectsInitialized = true;
    }

    // 初始化设置
    const initializeSettings = async () => {
      try {
        console.log('🔧 [AppContext] 开始加载设置...');

        const settings = await SettingsService.loadSettings();
        console.log('✅ [AppContext] 设置加载完成:', settings);

        setCurrentSettings(settings);

        // 应用主题
        applyTheme(settings.theme);

        // 初始化国际化
        I18nService.setLanguage(settings.language);
        setCurrentLanguage(settings.language);

        console.log('✅ [AppContext] 设置初始化完成');
      } catch (error) {
        console.error('❌ [AppContext] 设置初始化失败:', error);

        // 使用默认设置
        const defaultSettings = SettingsService.getDefaultSettings();
        setCurrentSettings(defaultSettings);
        applyTheme(defaultSettings.theme);
        I18nService.setLanguage(defaultSettings.language);
        setCurrentLanguage(defaultSettings.language);
      }
    };

    // 执行异步初始化
    initializeSettings();
  }, []); // 空依赖数组

  // 应用主题
  const applyTheme = (theme: 'dark' | 'light') => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
  };

  // 更新设置
  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    if (!currentSettings) return;

    try {
      const newSettings = { ...currentSettings, [key]: value };
      await SettingsService.updateSetting(key, value);
      setCurrentSettings(newSettings);

      // 特殊处理主题和语言
      if (key === 'theme') {
        applyTheme(value as 'dark' | 'light');
      }
      if (key === 'language') {
        const newLang = value as 'zh' | 'en';
        I18nService.setLanguage(newLang);
        setCurrentLanguage(newLang);
      }
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  };

  // 重置设置
  const resetSettings = async () => {
    try {
      await SettingsService.resetToDefaults();
      const defaultSettings = SettingsService.getDefaultSettings();
      setCurrentSettings(defaultSettings);
      applyTheme(defaultSettings.theme);
      I18nService.setLanguage(defaultSettings.language);
      setCurrentLanguage(defaultSettings.language);
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  };

  const contextValue: AppContextValue = {
    state,
    dispatch,
    navigation: {
      activeTab,
      setActiveTab
    },
    settings: {
      current: currentSettings || SettingsService.getDefaultSettings(),
      updateSetting,
      resetSettings
    },
    i18n: {
      t: (key: string) => I18nService.t(key as any),
      language: currentLanguage
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
