import { useEffect } from 'react';
import { useProjectCreationProgress } from '../hooks/useProjectCreationProgress';
import { ProjectService } from '../services/ProjectService';

interface ProjectCreationProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: any;
  onConfirm?: (config: any) => void;
}

export function ProjectCreationProgressModal({
  isOpen,
  onClose,
  config,
  onConfirm
}: ProjectCreationProgressModalProps) {
  const {
    isActive,
    steps,
    currentStep,
    overallProgress,
    startProgress,
    cancelProgress,
    updateStepStatus,
    completeProgress,
    handleError
  } = useProjectCreationProgress(
    {
      displayMode: 'modal',
      showDetails: true,
      allowCancel: true
    },
    {
      onComplete: () => {
        if (onConfirm && config) {
          onConfirm(config);
        }
        setTimeout(onClose, 2000);
      },
      onError: (error: string) => console.error('Creation error:', error),
      onCancel: onClose
    }
  );

  // 实际执行项目创建的函数
  const executeProjectCreation = async () => {
    try {
      console.log('🚀 开始执行项目创建...', config);
      
      // 更新第一步状态
      updateStepStatus('validation', 'running');
      
      const result = await ProjectService.createProject(config, {
        onProgress: (message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info') => {
          console.log('📝 项目创建进度:', message);
          
          // 根据消息内容更新对应步骤
          if (message.includes('验证') || message.includes('检查')) {
            updateStepStatus('validation', level === 'error' ? 'error' : 'running');
          } else if (message.includes('目录') || message.includes('创建项目目录')) {
            updateStepStatus('validation', 'completed');
            updateStepStatus('directory', 'running');
          } else if (message.includes('模板') || message.includes('复制')) {
            updateStepStatus('directory', 'completed');
            updateStepStatus('template', 'running');
          } else if (message.includes('工具') || message.includes('配置')) {
            updateStepStatus('template', 'completed');
            updateStepStatus('tools', 'running');
          } else if (message.includes('依赖') || message.includes('安装')) {
            updateStepStatus('tools', 'completed');
            updateStepStatus('dependencies', 'running');
          } else if (message.includes('Git') || message.includes('仓库')) {
            updateStepStatus('dependencies', 'completed');
            updateStepStatus('git', 'running');
          } else if (message.includes('完成') || message.includes('成功')) {
            updateStepStatus('git', 'completed');
            updateStepStatus('finalization', 'running');
          }
          
          if (level === 'error') {
            handleError('validation', message);
          }
        }
      });

      if (result.success) {
        // 完成所有步骤
        updateStepStatus('finalization', 'completed');
        completeProgress(result.data);
        console.log('✅ 项目创建成功', result.data);
      } else {
        handleError('validation', result.error || '项目创建失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '项目创建过程中发生未知错误';
      handleError('validation', errorMessage);
      console.error('❌ 项目创建异常:', error);
    }
  };

  useEffect(() => {
    if (isOpen && !isActive && config) {
      console.log('🎬 启动项目创建进度...', config);
      startProgress();
      // 启动实际的项目创建过程
      setTimeout(() => {
        executeProjectCreation();
      }, 1000); // 给进度界面一点时间来显示
    }
  }, [isOpen, isActive, config, startProgress]);

  if (!isOpen) return null;

  const isComplete = overallProgress >= 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">创建项目中...</h3>
            <div className="text-sm text-gray-500">
              {Math.round(overallProgress)}%
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          <div className="space-y-3">
            {steps.map((step, stepIndex) => (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  step.status === 'completed' ? 'bg-green-50' :
                  step.status === 'running' ? 'bg-blue-50' :
                  step.status === 'error' ? 'bg-red-50' :
                  'bg-gray-50'
                }`}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  step.status === 'completed' ? 'bg-green-500 text-white' :
                  step.status === 'running' ? 'bg-blue-500 text-white' :
                  step.status === 'error' ? 'bg-red-500 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  {step.status === 'completed' ? '✓' :
                   step.status === 'running' ? '⟳' :
                   step.status === 'error' ? '✗' :
                   (stepIndex + 1)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{step.title}</div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
              </div>
            ))}
          </div>

          {currentStep?.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-800 text-sm font-medium">创建失败</div>
              <div className="text-red-600 text-sm">{currentStep.error}</div>
            </div>
          )}

          {isComplete && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-green-800 text-sm font-medium">项目创建成功！</div>
              <div className="text-green-600 text-sm">正在为您打开项目...</div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={isComplete ? onClose : cancelProgress}
              className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              {isComplete ? '关闭' : '取消'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
