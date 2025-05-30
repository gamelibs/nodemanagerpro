import { useCallback } from 'react';
import { useApp } from '../store/AppContext';
import type { ProjectLog } from '../types';

export function useLogs() {
  const { state, dispatch } = useApp();

  const startLogSession = useCallback((projectId: string, projectName: string) => {
    console.log('🚀 启动日志会话:', projectId, projectName);
    dispatch({
      type: 'START_LOG_SESSION',
      payload: { projectId, projectName }
    });
  }, [dispatch]);

  const endLogSession = useCallback((projectId: string) => {
    console.log('🔚 结束日志会话:', projectId);
    dispatch({
      type: 'END_LOG_SESSION',
      payload: projectId
    });
  }, [dispatch]);

  const addLog = useCallback((log: Omit<ProjectLog, 'id' | 'timestamp'>) => {
    const newLog: ProjectLog = {
      ...log,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    
    console.log('📝 添加日志:', newLog);
    
    dispatch({
      type: 'ADD_LOG',
      payload: newLog
    });
  }, [dispatch]);

  const clearProjectLogs = useCallback((projectId: string) => {
    dispatch({
      type: 'CLEAR_PROJECT_LOGS',
      payload: projectId
    });
  }, [dispatch]);

  const getProjectLogs = useCallback((projectId: string) => {
    const session = state.logSessions.find(s => s.projectId === projectId);
    return session?.logs || [];
  }, [state.logSessions]);

  const getActiveLogSessions = useCallback(() => {
    return state.logSessions.filter(s => s.isActive);
  }, [state.logSessions]);

  return {
    logSessions: state.logSessions,
    startLogSession,
    endLogSession,
    addLog,
    clearProjectLogs,
    getProjectLogs,
    getActiveLogSessions
  };
}
