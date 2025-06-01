import React, { useState, useEffect } from 'react';
import type { ProjectCreationConfig, FrontendFramework, PackageManagerInfo, TemplateInfo } from '../types';
import { t, tArray } from '../services/i18n';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (projectConfig: ProjectCreationConfig) => void;
}

// 获取模板信息的函数
const getTemplates = (): TemplateInfo[] => [
  {
    id: 'pure-api',
    name: t('projects.createModal.templates.pureApi.name'),
    description: t('projects.createModal.templates.pureApi.description'),
    features: tArray('projects.createModal.templates.pureApi.features'),
    supportsFrontendFramework: false
  },
  {
    id: 'static-app',
    name: t('projects.createModal.templates.staticApp.name'),
    description: t('projects.createModal.templates.staticApp.description'),
    features: tArray('projects.createModal.templates.staticApp.features'),
    supportsFrontendFramework: false
  },
  {
    id: 'full-stack',
    name: t('projects.createModal.templates.fullStack.name'),
    description: t('projects.createModal.templates.fullStack.description'),
    features: tArray('projects.createModal.templates.fullStack.features'),
    supportsFrontendFramework: true
  }
];

// 获取前端框架选项的函数
const getFrontendFrameworks = () => [
  { 
    id: 'vanilla-ts' as FrontendFramework, 
    name: t('projects.createModal.frameworks.vanillaTs.name'), 
    description: t('projects.createModal.frameworks.vanillaTs.description') 
  },
  { 
    id: 'react' as FrontendFramework, 
    name: t('projects.createModal.frameworks.react.name'), 
    description: t('projects.createModal.frameworks.react.description') 
  },
  { 
    id: 'vue' as FrontendFramework, 
    name: t('projects.createModal.frameworks.vue.name'), 
    description: t('projects.createModal.frameworks.vue.description') 
  }
];

// 获取包管理器信息的函数
const getPackageManagers = (): PackageManagerInfo[] => [
  {
    id: 'npm',
    name: t('projects.createModal.packageManagers.npm.name'),
    description: t('projects.createModal.packageManagers.npm.description'),
    command: 'npm'
  },
  {
    id: 'yarn',
    name: t('projects.createModal.packageManagers.yarn.name'),
    description: t('projects.createModal.packageManagers.yarn.description'),
    command: 'yarn'
  },
  {
    id: 'pnpm',
    name: t('projects.createModal.packageManagers.pnpm.name'),
    description: t('projects.createModal.packageManagers.pnpm.description'),
    command: 'pnpm'
  }
];

export default function CreateProjectModal({ isOpen, onClose, onConfirm }: CreateProjectModalProps) {
  const [formData, setFormData] = useState<ProjectCreationConfig>({
    name: '',
    path: '',
    template: 'pure-api',
    frontendFramework: 'vanilla-ts',
    port: 8000,
    packageManager: 'npm',
    tools: {
      eslint: false,
      prettier: false,
      jest: false,
      envConfig: false,
      autoInstall: false,
      git: false
    }
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 添加 ESC 键监听
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const templates = getTemplates();
  const frontendFrameworks = getFrontendFrameworks();
  const packageManagers = getPackageManagers();
  const selectedTemplate = templates.find(template => template.id === formData.template);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证表单
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('projects.createModal.validation.nameRequired');
    }
    
    if (!formData.path.trim()) {
      newErrors.path = t('projects.createModal.validation.pathRequired');
    }

    if (formData.port < 1000 || formData.port > 65535) {
      newErrors.port = t('projects.createModal.validation.portRange');
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // 构建完整路径
    const fullPath = formData.path.endsWith('/') 
      ? formData.path + formData.name 
      : formData.path + '/' + formData.name;
    
    const finalConfig: ProjectCreationConfig = {
      ...formData,
      path: fullPath,
      // 如果不支持前端框架，则移除该属性
      ...(selectedTemplate?.supportsFrontendFramework ? {} : { frontendFramework: undefined })
    };
    
    onConfirm(finalConfig);
    
    // 重置表单
    setFormData({
      name: '',
      path: '',
      template: 'pure-api',
      frontendFramework: 'vanilla-ts',
      port: 8000,
      packageManager: 'npm',
      tools: {
        eslint: false,
        prettier: false,
        jest: false,
        envConfig: false,
        autoInstall: false,
        git: false
      }
    });
    setErrors({});
  };

  const handleInputChange = (field: keyof ProjectCreationConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleToolChange = (tool: keyof ProjectCreationConfig['tools'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      tools: { ...prev.tools, [tool]: value }
    }));
  };

  const selectDirectory = async () => {
    try {
      const path = await showDirectoryPicker();
      if (path) {
        // 验证目录是否存在且可访问
        const isValid = await validateDirectory(path);
        if (isValid) {
          handleInputChange('path', path);
        } else {
          console.error('所选目录无效或不可访问:', path);
          // TODO: 显示错误提示给用户
        }
      }
      // 如果 path 为 null，说明用户取消了选择，这是正常行为，不需要错误处理
    } catch (error) {
      // 只有在真正的错误情况下才记录错误
      const err = error as Error;
      // DOMException 的名称通常是 "AbortError"，错误消息包含 "aborted"
      if (err.name !== 'AbortError' && 
          !err.message.includes('aborted') && 
          !err.message.includes('user aborted') &&
          !err.message.includes('The user aborted')) {
        console.error('选择目录时发生错误:', error);
        // TODO: 显示错误提示给用户
      }
      // 用户取消选择是正常行为，不显示错误
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="theme-bg-secondary border theme-border rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
        <h3 className="text-xl font-semibold theme-text-primary mb-4">{t('projects.createModal.title')}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 项目基本信息 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium theme-text-primary border-b theme-border pb-2">{t('projects.createModal.basicInfo')}</h4>
            
            {/* 项目名称 */}
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-1">
                {t('projects.createModal.projectName')} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 theme-bg-tertiary border theme-border rounded-lg theme-text-primary focus:outline-none focus:border-blue-500"
                placeholder={t('projects.createModal.projectNamePlaceholder')}
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* 项目路径 */}
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-1">
                {t('projects.createModal.projectPath')} *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.path}
                  onChange={(e) => handleInputChange('path', e.target.value)}
                  className="flex-1 px-3 py-2 theme-bg-tertiary border theme-border rounded-lg theme-text-primary focus:outline-none focus:border-blue-500"
                  placeholder={t('projects.createModal.projectPathPlaceholder')}
                />
                <button
                  type="button"
                  onClick={selectDirectory}
                  className="px-3 py-2 bg-primary hover:bg-primary-hover theme-text-primary rounded-lg transition-all"
                >
                  {t('projects.createModal.selectButton')}
                </button>
              </div>
              {errors.path && <p className="text-red-400 text-sm mt-1">{errors.path}</p>}
            </div>

            {/* 端口配置 */}
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-1">
                {t('projects.createModal.portNumber')}
              </label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 8000)}
                className="w-full px-3 py-2 theme-bg-tertiary border theme-border rounded-lg theme-text-primary focus:outline-none focus:border-blue-500"
                placeholder={t('projects.createModal.portPlaceholder')}
                min="1000"
                max="65535"
              />
              {errors.port && <p className="text-red-400 text-sm mt-1">{errors.port}</p>}
              <p className="theme-text-secondary text-xs mt-1">{t('projects.createModal.portDesc')}</p>
            </div>
          </div>

          {/* 项目模板 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium theme-text-primary border-b theme-border pb-2">{t('projects.createModal.projectTemplate')}</h4>
            
            <div className="space-y-3">
              {templates.map((template) => (
                <div 
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.template === template.id 
                      ? 'border-blue-500 theme-bg-accent' 
                      : 'theme-border hover:theme-border-hover'
                  }`}
                  onClick={() => handleInputChange('template', template.id)}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="template"
                      value={template.id}
                      checked={formData.template === template.id}
                      onChange={() => handleInputChange('template', template.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h5 className="font-medium theme-text-primary">{template.name}</h5>
                      <p className="text-sm theme-text-secondary mt-1">{template.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {template.features.map((feature, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 theme-bg-tertiary theme-text-secondary text-xs rounded-md"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 前端框架选择（仅当模板支持时显示） */}
            {selectedTemplate?.supportsFrontendFramework && (
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  {t('projects.createModal.frontendFramework')}
                </label>
                <div className="space-y-2">
                  {frontendFrameworks.map((framework) => (
                    <div 
                      key={framework.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.frontendFramework === framework.id 
                          ? 'border-blue-500 theme-bg-accent' 
                          : 'theme-border hover:theme-border-hover'
                      }`}
                      onClick={() => handleInputChange('frontendFramework', framework.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="frontendFramework"
                          value={framework.id}
                          checked={formData.frontendFramework === framework.id}
                          onChange={() => handleInputChange('frontendFramework', framework.id)}
                        />
                        <div>
                          <span className="font-medium theme-text-primary">{framework.name}</span>
                          <p className="text-sm theme-text-secondary">{framework.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 包管理器 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium theme-text-primary border-b theme-border pb-2">{t('projects.createModal.packageManager')}</h4>
            
            <div className="space-y-2">
              {packageManagers.map((pm) => (
                <div 
                  key={pm.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.packageManager === pm.id 
                      ? 'border-blue-500 theme-bg-accent' 
                      : 'theme-border hover:theme-border-hover'
                  }`}
                  onClick={() => handleInputChange('packageManager', pm.id)}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="packageManager"
                      value={pm.id}
                      checked={formData.packageManager === pm.id}
                      onChange={() => handleInputChange('packageManager', pm.id)}
                    />
                    <div>
                      <span className="font-medium theme-text-primary">{pm.name}</span>
                      <p className="text-sm theme-text-secondary">{pm.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 可选工具 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium theme-text-primary border-b theme-border pb-2">{t('projects.createModal.optionalTools')}</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.tools.eslint}
                  onChange={(e) => handleToolChange('eslint', e.target.checked)}
                  className="rounded"
                />
                <div>
                  <span className="text-sm font-medium theme-text-primary">{t('projects.createModal.tools.eslint.name')}</span>
                  <p className="text-xs theme-text-secondary">{t('projects.createModal.tools.eslint.description')}</p>
                </div>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.tools.prettier}
                  onChange={(e) => handleToolChange('prettier', e.target.checked)}
                  className="rounded"
                />
                <div>
                  <span className="text-sm font-medium theme-text-primary">{t('projects.createModal.tools.prettier.name')}</span>
                  <p className="text-xs theme-text-secondary">{t('projects.createModal.tools.prettier.description')}</p>
                </div>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.tools.jest}
                  onChange={(e) => handleToolChange('jest', e.target.checked)}
                  className="rounded"
                />
                <div>
                  <span className="text-sm font-medium theme-text-primary">{t('projects.createModal.tools.jest.name')}</span>
                  <p className="text-xs theme-text-secondary">{t('projects.createModal.tools.jest.description')}</p>
                </div>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.tools.envConfig}
                  onChange={(e) => handleToolChange('envConfig', e.target.checked)}
                  className="rounded"
                />
                <div>
                  <span className="text-sm font-medium theme-text-primary">{t('projects.createModal.tools.envConfig.name')}</span>
                  <p className="text-xs theme-text-secondary">{t('projects.createModal.tools.envConfig.description')}</p>
                </div>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.tools.autoInstall}
                  onChange={(e) => handleToolChange('autoInstall', e.target.checked)}
                  className="rounded"
                />
                <div>
                  <span className="text-sm font-medium theme-text-primary">{t('projects.createModal.tools.autoInstall.name')}</span>
                  <p className="text-xs theme-text-secondary">{t('projects.createModal.tools.autoInstall.description')}</p>
                </div>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.tools.git}
                  onChange={(e) => handleToolChange('git', e.target.checked)}
                  className="rounded"
                />
                <div>
                  <span className="text-sm font-medium theme-text-primary">{t('projects.createModal.tools.git.name')}</span>
                  <p className="text-xs theme-text-secondary">{t('projects.createModal.tools.git.description')}</p>
                </div>
              </label>
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 theme-text-secondary border theme-border hover:theme-border-hover rounded-lg transition-all"
            >
              {t('projects.createModal.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover theme-text-primary rounded-lg transition-all"
            >
              {t('projects.createModal.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 目录验证函数
async function validateDirectory(path: string): Promise<boolean> {
  try {
    // 在 Electron 环境中，使用 IPC 验证目录
    if ((window as any).electronAPI?.invoke) {
      const result = await (window as any).electronAPI.invoke('fs:validateDirectory', path);
      console.log('目录验证结果:', result);
      return result.success && result.exists;
    }
    
    // Web 环境的降级验证（有限）
    // 检查基本格式，排除明显的假路径
    if (!path || path.length === 0) {
      return false;
    }
    
    // 排除明显的示例路径
    if (path.includes('/example/') || path.includes('\\example\\') || 
        path.includes('/Users/example/') || path.includes('C:\\Users\\example\\')) {
      console.warn('检测到示例路径，这可能不是真实路径:', path);
      return false;
    }
    
    return true; // 在 Web 环境中，我们只能做基本验证
  } catch (error) {
    console.error('验证目录失败:', error);
    return false;
  }
}

// 目录选择器函数
async function showDirectoryPicker(): Promise<string | null> {
  try {
    // 在Electron环境中，使用IPC调用主进程的目录选择对话框
    if ((window as any).electronAPI?.invoke) {
      const result = await (window as any).electronAPI.invoke('dialog:showOpenDialog', {
        properties: ['openDirectory'],
        title: '选择项目目录'
        // 不设置 defaultPath，让系统使用默认位置
      });
      
      if (!result.canceled && result.filePaths.length > 0) {
        const selectedPath = result.filePaths[0];
        console.log('用户选择的目录:', selectedPath);
        return selectedPath;
      }
      
      console.log('用户取消了目录选择');
      return null;
    }
    
    // 降级方案：检查是否支持 File System Access API（Chrome 86+）
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        if (dirHandle && dirHandle.name) {
          // 在浏览器环境中，我们无法获取真实路径，只能返回相对路径
          // 这里应该提示用户在 Electron 环境中使用
          console.warn('浏览器环境下无法获取完整路径，请在 Electron 应用中使用');
          return null;
        }
      } catch (error) {
        // 用户取消选择，这是正常行为
        const err = error as Error;
        if (err.name === 'AbortError' || 
            err.message.includes('aborted') || 
            err.message.includes('The user aborted')) {
          console.log('用户取消了目录选择 (File System Access API)');
          return null;
        }
        throw error;
      }
    }
    
    // 最后的降级方案：提示用户手动输入
    console.warn('当前环境不支持目录选择器，请手动输入路径');
    return null;
    
  } catch (error) {
    const err = error as Error;
    
    // 如果是用户取消，不抛出错误
    if (err.name === 'AbortError' || 
        err.message.includes('aborted') || 
        err.message.includes('user aborted') ||
        err.message.includes('The user aborted')) {
      console.log('用户取消了目录选择');
      return null;
    }
    
    // 其他错误需要抛出
    console.error('选择目录失败:', err);
    throw error;
  }
}
