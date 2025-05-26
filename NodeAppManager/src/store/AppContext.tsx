import { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppAction, Project } from '../types';

// 初始状态
const initialState: AppState = {
  projects: [],
  isLoading: false,
  error: null,
  activeProject: null,
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
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider 组件
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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
