import { useState, useEffect } from 'react';
import { Star, Clock, Download, Crown, Check, X } from 'lucide-react';
import type { EnterpriseTemplate } from '../types';
import { EnterpriseTemplateService } from '../services/EnterpriseTemplateService';

interface EnterpriseTemplateSelectorProps {
  selectedTemplateId?: string;
  onSelect: (template: EnterpriseTemplate) => void;
  onCancel: () => void;
}

export function EnterpriseTemplateSelector({ 
  selectedTemplateId, 
  onSelect, 
  onCancel 
}: EnterpriseTemplateSelectorProps) {
  const [templates, setTemplates] = useState<EnterpriseTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EnterpriseTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all');

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        const allTemplates = EnterpriseTemplateService.getEnterpriseTemplates();
        setTemplates(allTemplates);
        
        if (selectedTemplateId) {
          const template = EnterpriseTemplateService.getTemplateById(selectedTemplateId);
          if (template) setSelectedTemplate(template);
        }
      } catch (error) {
        console.error('Failed to load enterprise templates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [selectedTemplateId]);

  const filteredTemplates = templates.filter(template => {
    if (filter === 'free') return template.tier === 'free';
    if (filter === 'premium') return template.tier !== 'free';
    return true;
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'text-green-600 bg-green-100';
      case 'pro': return 'text-blue-600 bg-blue-100';
      case 'enterprise': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTierIcon = (tier: string) => {
    if (tier !== 'free') return <Crown className="w-4 h-4" />;
    return null;
  };

  const handleSelectTemplate = async (template: EnterpriseTemplate) => {
    // 检查用户权限
    const permission = await EnterpriseTemplateService.checkUserPermissions(template.id);
    
    if (!permission.hasPermission) {
      // 显示升级提示
      alert(`${permission.reason}\n\n请联系销售团队获取企业级许可证。`);
      return;
    }

    setSelectedTemplate(template);
  };

  const handleConfirm = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span>加载企业级模板...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                🚀 企业级模板中心
              </h2>
              <p className="text-gray-600 mt-1">
                选择专业的企业级模板，快速构建高质量应用
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-4 mt-4">
            {['all', 'free', 'premium'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === filterType
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {filterType === 'all' && '全部模板'}
                {filterType === 'free' && '免费模板'}
                {filterType === 'premium' && '付费模板'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Template List */}
          <div className="w-1/2 overflow-y-auto p-6 space-y-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Template Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {template.name}
                      </h3>
                      {getTierIcon(template.tier)}
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(template.tier)}`}>
                        {template.tier.toUpperCase()}
                      </span>
                      {template.price && (
                        <span className="text-green-600 font-semibold">
                          ¥{template.price}
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedTemplate?.id === template.id && (
                    <Check className="w-5 h-5 text-blue-500" />
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {template.description}
                </p>

                {/* Stats */}
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-current text-yellow-400" />
                    <span>{template.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="w-3 h-3" />
                    <span>{template.downloads?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{template.estimatedSetupTime}</span>
                  </div>
                </div>

                {/* Technologies */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {template.technologies?.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tech}
                    </span>
                  ))}
                  {template.technologies && template.technologies.length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{template.technologies.length - 4}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {filteredTemplates.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                暂无符合条件的模板
              </div>
            )}
          </div>

          {/* Template Details */}
          <div className="w-1/2 border-l border-gray-200 overflow-y-auto">
            {selectedTemplate ? (
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {selectedTemplate.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-500">复杂度</span>
                      <div className="font-medium capitalize">
                        {selectedTemplate.complexity}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">搭建时间</span>
                      <div className="font-medium">
                        {selectedTemplate.estimatedSetupTime}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Node.js版本</span>
                      <div className="font-medium">
                        {selectedTemplate.minNodeVersion}+
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">最后更新</span>
                      <div className="font-medium">
                        {selectedTemplate.lastUpdated?.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">功能特性</h4>
                  <div className="space-y-2">
                    {selectedTemplate.features.map((feature) => (
                      <div
                        key={feature.id}
                        className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {feature.included ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <X className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">
                              {feature.name}
                            </span>
                            {feature.premium && (
                              <Crown className="w-3 h-3 text-purple-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technologies */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">技术栈</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.technologies?.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                选择一个模板查看详细信息
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedTemplate}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            确认选择
          </button>
        </div>
      </div>
    </div>
  );
}
