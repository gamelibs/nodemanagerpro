/**
 * 项目创建进度管理器
 * 提供多种进度提示交互方案
 */

import { useState, useCallback, useEffect } from 'react';
import type { Project } from '../types';

// 进度步骤定义
export interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number; // 0-100
  duration?: number; // 毫秒
  details?: string[];
  error?: string;
  subSteps?: ProgressStep[];
}

// 进度管理器配置
export interface ProgressManagerConfig {
  displayMode: 'modal' | 'card' | 'toast' | 'inline';
  showDetails: boolean;
  autoClose: boolean;
  autoCloseDelay: number;
  allowCancel: boolean;
  showSubSteps: boolean;
  showEstimatedTime: boolean;
}

// 进度事件回调
export interface ProgressCallbacks {
  onStepStart?: (step: ProgressStep) => void;
  onStepComplete?: (step: ProgressStep) => void;
  onStepError?: (step: ProgressStep, error: string) => void;
  onComplete?: (project: Project) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
}

// 默认进度步骤
export const defaultProjectCreationSteps: ProgressStep[] = [
  {
    id: 'validation',
    title: '验证配置',
    description: '检查项目配置和参数',
    status: 'pending',
    subSteps: [
      { id: 'name-validation', title: '验证项目名称', description: '', status: 'pending' },
      { id: 'path-validation', title: '验证项目路径', description: '', status: 'pending' },
      { id: 'template-validation', title: '验证模板配置', description: '', status: 'pending' }
    ]
  },
  {
    id: 'directory',
    title: '创建目录',
    description: '准备项目目录结构',
    status: 'pending',
    subSteps: [
      { id: 'create-root', title: '创建根目录', description: '', status: 'pending' },
      { id: 'create-subdirs', title: '创建子目录', description: '', status: 'pending' }
    ]
  },
  {
    id: 'template',
    title: '复制模板',
    description: '从模板生成项目文件',
    status: 'pending',
    subSteps: [
      { id: 'copy-files', title: '复制模板文件', description: '', status: 'pending' },
      { id: 'replace-variables', title: '替换模板变量', description: '', status: 'pending' }
    ]
  },
  {
    id: 'tools',
    title: '配置工具',
    description: '设置开发工具和依赖包',
    status: 'pending',
    subSteps: [
      { id: 'generate-config', title: '生成工具配置', description: '', status: 'pending' },
      { id: 'create-config-files', title: '创建配置文件', description: '', status: 'pending' },
      { id: 'update-package-json', title: '更新 package.json', description: '', status: 'pending' }
    ]
  },
  {
    id: 'dependencies',
    title: '安装依赖',
    description: '安装项目依赖包',
    status: 'pending',
    subSteps: [
      { id: 'install-deps', title: '安装生产依赖', description: '', status: 'pending' },
      { id: 'install-dev-deps', title: '安装开发依赖', description: '', status: 'pending' }
    ]
  },
  {
    id: 'git',
    title: '初始化Git',
    description: '设置版本控制',
    status: 'pending',
    subSteps: [
      { id: 'git-init', title: '初始化仓库', description: '', status: 'pending' },
      { id: 'initial-commit', title: '创建初始提交', description: '', status: 'pending' }
    ]
  },
  {
    id: 'finalization',
    title: '完成配置',
    description: '完成项目初始化',
    status: 'pending',
    subSteps: [
      { id: 'env-setup', title: '设置环境变量', description: '', status: 'pending' },
      { id: 'pm2-config', title: '配置PM2', description: '', status: 'pending' }
    ]
  }
];

/**
 * 项目创建进度管理器Hook
 */
export function useProjectCreationProgress(
  config?: Partial<ProgressManagerConfig>,
  callbacks?: ProgressCallbacks
) {
  const [isActive, setIsActive] = useState(false);
  const [steps, setSteps] = useState<ProgressStep[]>(defaultProjectCreationSteps);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
  
  const defaultConfig: ProgressManagerConfig = {
    displayMode: 'modal',
    showDetails: true,
    autoClose: false,
    autoCloseDelay: 3000,
    allowCancel: true,
    showSubSteps: true,
    showEstimatedTime: true
  };
  
  const finalConfig = { ...defaultConfig, ...config };

  // 开始进度
  const startProgress = useCallback(() => {
    setIsActive(true);
    setStartTime(Date.now());
    setCurrentStepIndex(0);
    setOverallProgress(0);
    setSteps(defaultProjectCreationSteps.map(step => ({ ...step, status: 'pending' })));
    callbacks?.onStepStart?.(defaultProjectCreationSteps[0]);
  }, [callbacks]);

  // 更新步骤状态
  const updateStepStatus = useCallback((
    stepId: string,
    status: ProgressStep['status'],
    progress?: number,
    details?: string[],
    error?: string
  ) => {
    setSteps(prevSteps => {
      const newSteps = prevSteps.map(step => {
        if (step.id === stepId) {
          const updatedStep = {
            ...step,
            status,
            progress,
            details,
            error,
            duration: status === 'completed' && startTime ? Date.now() - startTime : step.duration
          };
          
          // 更新子步骤
          if (step.subSteps) {
            updatedStep.subSteps = step.subSteps.map(subStep => ({
              ...subStep,
              status: status === 'completed' ? 'completed' : subStep.status
            }));
          }
          
          return updatedStep;
        }
        return step;
      });
      
      // 计算总体进度
      const completedSteps = newSteps.filter(s => s.status === 'completed').length;
      const runningSteps = newSteps.filter(s => s.status === 'running').length;
      const newOverallProgress = Math.round(
        ((completedSteps + (runningSteps * 0.5)) / newSteps.length) * 100
      );
      setOverallProgress(newOverallProgress);
      
      return newSteps;
    });
  }, [startTime]);

  // 下一步
  const nextStep = useCallback(() => {
    setCurrentStepIndex(prev => {
      const newIndex = Math.min(prev + 1, steps.length - 1);
      if (newIndex < steps.length) {
        callbacks?.onStepStart?.(steps[newIndex]);
      }
      return newIndex;
    });
  }, [steps, callbacks]);

  // 完成进度
  const completeProgress = useCallback((project?: Project) => {
    setSteps(prevSteps => 
      prevSteps.map(step => ({ ...step, status: 'completed' }))
    );
    setOverallProgress(100);
    
    if (finalConfig.autoClose) {
      setTimeout(() => {
        setIsActive(false);
        callbacks?.onComplete?.(project!);
      }, finalConfig.autoCloseDelay);
    } else {
      callbacks?.onComplete?.(project!);
    }
  }, [finalConfig, callbacks]);

  // 取消进度
  const cancelProgress = useCallback(() => {
    setIsActive(false);
    callbacks?.onCancel?.();
  }, [callbacks]);

  // 处理错误
  const handleError = useCallback((stepId: string, error: string) => {
    updateStepStatus(stepId, 'error', undefined, undefined, error);
    callbacks?.onStepError?.(steps.find(s => s.id === stepId)!, error);
    callbacks?.onError?.(error);
  }, [updateStepStatus, steps, callbacks]);

  // 估算剩余时间
  useEffect(() => {
    if (!startTime || !isActive) return;
    
    const completedSteps = steps.filter(s => s.status === 'completed').length;
    if (completedSteps === 0) return;
    
    const elapsed = Date.now() - startTime;
    const avgTimePerStep = elapsed / completedSteps;
    const remainingSteps = steps.length - completedSteps;
    const estimated = remainingSteps * avgTimePerStep;
    
    setEstimatedTimeRemaining(estimated);
  }, [steps, startTime, isActive]);

  return {
    // 状态
    isActive,
    steps,
    currentStepIndex,
    currentStep: steps[currentStepIndex],
    overallProgress,
    estimatedTimeRemaining,
    config: finalConfig,
    
    // 方法
    startProgress,
    updateStepStatus,
    nextStep,
    completeProgress,
    cancelProgress,
    handleError
  };
}

/**
 * 格式化时间显示
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  
  if (minutes > 0) {
    return `${minutes}分${seconds % 60}秒`;
  }
  return `${seconds}秒`;
}

/**
 * 格式化预估时间
 */
export function formatEstimatedTime(milliseconds: number): string {
  const seconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  
  if (minutes > 0) {
    return `约${minutes}分钟`;
  }
  return `约${seconds}秒`;
}
