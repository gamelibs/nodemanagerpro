import React, { useState, useEffect } from 'react';
import { ProjectConfigAnalysisService } from '../services/ProjectConfigAnalysisService';

interface ProjectImportConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectPath: string;
}

type ProjectConfigAnalysis = {
  success: boolean;
  configStatus: 'complete' | 'incomplete' | 'missing';
  analysis: {
    hasPackageJson: boolean;
    hasStartScript: boolean;
    hasEnvFile: boolean;
    hasPortConfig: boolean;
    hasMainFile: boolean;
    portInfo?: {
      detectedPorts: number[];
      defaultPort?: number;
      sources: string[];
    };
    mainFileInfo?: {
      detected: string[];
      recommended: string;
    };
    missingConfigs: string[];
    recommendations: string[];
  };
  error?: string;
};

const ProjectImportConfigModal: React.FC<ProjectImportConfigModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  projectPath
}) => {
  const [analysis, setAnalysis] = useState<ProjectConfigAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 分析项目配置
  useEffect(() => {
    if (isOpen && projectPath) {
      analyzeProject();
    }
  }, [isOpen, projectPath]);

  const analyzeProject = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await ProjectConfigAnalysisService.analyzeProjectConfiguration(projectPath);
      
      if (result.success) {
        setAnalysis(result);
      } else {
        setError(result.error || '配置分析失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '配置分析过程中发生错误');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return '✅';
      case 'incomplete':
        return '⚠️';
      case 'missing':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete':
        return '配置完整';
      case 'incomplete':
        return '配置不完整';
      case 'missing':
        return '缺少配置';
      default:
        return '未知状态';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'complete':
        return '项目已有完整配置，可以直接导入使用。';
      case 'incomplete':
        return '项目有部分配置，建议手动完善配置文件以获得最佳体验。';
      case 'missing':
        return '项目缺少必要配置，导入后需要手动创建和配置启动文件。';
      default:
        return '配置状态未知。';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">项目配置分析</h3>
          <p className="text-sm text-gray-600 mt-1">
            分析项目配置完整性，为您提供最佳的导入体验
          </p>
        </div>

        {/* 内容区域 */}
        <div className="px-6 py-4 max-h-[calc(90vh-140px)] overflow-y-auto">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">正在分析项目配置...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-red-600 text-xl mr-3">❌</span>
                <div>
                  <h4 className="text-red-800 font-medium">分析失败</h4>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* 配置状态概览 */}
              <div className={`p-4 rounded-lg border-2 ${
                analysis.configStatus === 'complete' 
                  ? 'bg-green-50 border-green-200'
                  : analysis.configStatus === 'incomplete'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">
                    {getStatusIcon(analysis.configStatus)}
                  </span>
                  <div>
                    <h4 className={`font-semibold ${
                      analysis.configStatus === 'complete'
                        ? 'text-green-800'
                        : analysis.configStatus === 'incomplete'
                        ? 'text-yellow-800'
                        : 'text-red-800'
                    }`}>
                      {getStatusText(analysis.configStatus)}
                    </h4>
                    <p className={`text-sm ${
                      analysis.configStatus === 'complete'
                        ? 'text-green-700'
                        : analysis.configStatus === 'incomplete'
                        ? 'text-yellow-700'
                        : 'text-red-700'
                    }`}>
                      {getStatusDescription(analysis.configStatus)}
                    </p>
                  </div>
                </div>
              </div>

              {/* 详细配置检查 */}
              <div className="space-y-4">
                <h5 className="font-medium text-gray-900">配置文件检查结果</h5>
                
                {/* package.json */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="mr-3">
                      {analysis.analysis.hasPackageJson ? '✅' : '❌'}
                    </span>
                    <span className="text-sm font-medium">package.json</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {analysis.analysis.hasPackageJson ? '已存在' : '缺失'}
                  </span>
                </div>

                {/* 启动脚本 */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="mr-3">
                      {analysis.analysis.hasStartScript ? '✅' : '❌'}
                    </span>
                    <span className="text-sm font-medium">启动脚本</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {analysis.analysis.hasStartScript ? '已配置' : '未配置'}
                  </span>
                </div>

                {/* 主入口文件 */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="mr-3">
                      {analysis.analysis.hasMainFile ? '✅' : '❌'}
                    </span>
                    <span className="text-sm font-medium">主入口文件</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {analysis.analysis.hasMainFile ? '已找到' : '未找到'}
                  </span>
                </div>

                {/* 端口配置 */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="mr-3">
                      {analysis.analysis.hasPortConfig ? '✅' : '⚠️'}
                    </span>
                    <span className="text-sm font-medium">端口配置</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {analysis.analysis.hasPortConfig ? 
                      `端口: ${analysis.analysis.portInfo?.detectedPorts.join(', ') || '未知'}` : 
                      '未配置'
                    }
                  </span>
                </div>

                {/* 环境配置文件 */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="mr-3">
                      {analysis.analysis.hasEnvFile ? '✅' : '⚠️'}
                    </span>
                    <span className="text-sm font-medium">.env 环境配置</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {analysis.analysis.hasEnvFile ? '已存在' : '未找到'}
                  </span>
                </div>
              </div>

              {/* 缺失配置列表 */}
              {analysis.analysis.missingConfigs.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h5 className="font-medium text-amber-800 mb-2">需要手动配置的项目</h5>
                  <ul className="text-sm text-amber-700 space-y-1">
                    {analysis.analysis.missingConfigs.map((config: string, index: number) => (
                      <li key={index} className="flex items-center">
                        <span className="mr-2">•</span>
                        {config}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 建议配置 */}
              {analysis.analysis.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-800 mb-2">配置建议</h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {analysis.analysis.recommendations.map((recommendation: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 mt-0.5">💡</span>
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            取消导入
          </button>
          <button
            onClick={handleConfirm}
            disabled={isAnalyzing || !!error}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analysis?.configStatus === 'complete' 
              ? '确认导入' 
              : '了解并导入'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectImportConfigModal;
