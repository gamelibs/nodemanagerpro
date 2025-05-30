import { useState, useEffect, useCallback } from 'react';
import { PM2Service } from '../services/PM2Service';
import type { Project } from '../types';

interface PerformanceData {
  cpu: number;
  memory: number;
  uptime: number;
  restarts: number;
}

interface UsePerformanceResult {
  performanceData: Record<string, PerformanceData>;
  isLoading: boolean;
  error: string | null;
  refreshPerformance: (projectId: string) => Promise<void>;
  startMonitoring: (projects: Project[]) => void;
  stopMonitoring: () => void;
}

export function usePerformance(): UsePerformanceResult {
  const [performanceData, setPerformanceData] = useState<Record<string, PerformanceData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monitoringInterval, setMonitoringInterval] = useState<NodeJS.Timeout | null>(null);

  // 获取单个项目的性能数据
  const refreshPerformance = useCallback(async (projectId: string) => {
    try {
      setError(null);
      const result = await PM2Service.getProjectPerformance(projectId);
      
      if (result.success && result.performance) {
        setPerformanceData(prev => ({
          ...prev,
          [projectId]: result.performance!
        }));
      } else {
        setError(result.error || '获取性能数据失败');
        // 移除失败项目的数据
        setPerformanceData(prev => {
          const newData = { ...prev };
          delete newData[projectId];
          return newData;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取性能数据时发生错误');
    }
  }, []);

  // 批量获取多个运行中项目的性能数据
  const refreshMultipleProjects = useCallback(async (projects: Project[]) => {
    setIsLoading(true);
    try {
      const runningProjects = projects.filter(p => p.status === 'running');
      
      // 并行获取所有运行中项目的性能数据
      const promises = runningProjects.map(project => 
        refreshPerformance(project.id)
      );
      
      await Promise.allSettled(promises);
    } finally {
      setIsLoading(false);
    }
  }, [refreshPerformance]);

  // 开始监控性能数据
  const startMonitoring = useCallback((projects: Project[]) => {
    // 清除现有的监控
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
    }

    // 立即获取一次数据
    refreshMultipleProjects(projects);

    // 设置定期更新 (每5秒更新一次)
    const interval = setInterval(() => {
      refreshMultipleProjects(projects);
    }, 5000);

    setMonitoringInterval(interval);
  }, [refreshMultipleProjects]);

  // 停止监控
  const stopMonitoring = useCallback(() => {
    setMonitoringInterval(prev => {
      if (prev) {
        clearInterval(prev);
      }
      return null;
    });
    setPerformanceData({});
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
    };
  }, [monitoringInterval]);

  return {
    performanceData,
    isLoading,
    error,
    refreshPerformance,
    startMonitoring,
    stopMonitoring
  };
}
