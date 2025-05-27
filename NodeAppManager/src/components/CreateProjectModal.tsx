import React, { useState } from 'react';
import type { ProjectCreationConfig, FrontendFramework, PackageManagerInfo, TemplateInfo } from '../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (projectConfig: ProjectCreationConfig) => void;
}

// 模板信息
const TEMPLATES: TemplateInfo[] = [
  {
    id: 'express',
    name: 'Express (JavaScript + ES6)',
    description: '纯后端 API 服务器，使用 Express.js 和现代 JavaScript',
    features: ['Express.js 服务器', 'ES6+ JavaScript', 'CORS 支持', 'API 路由', '中间件配置', '详细注释'],
    supportsFrontendFramework: false
  },
  {
    id: 'vite-express',
    name: 'Vite + Express (TypeScript + ES6)',
    description: '全栈应用，包含 Vite 前端和 Express 后端',
    features: ['TypeScript 支持', 'Vite 构建工具', 'Express 后端', '热重载', 'API 代理', '现代 UI'],
    supportsFrontendFramework: true
  }
];

// 前端框架选项
const FRONTEND_FRAMEWORKS = [
  { id: 'vanilla-ts' as FrontendFramework, name: 'Vanilla TypeScript', description: '纯 TypeScript，无框架依赖' },
  { id: 'react' as FrontendFramework, name: 'React', description: 'React 18 + TypeScript' },
  { id: 'vue' as FrontendFramework, name: 'Vue', description: 'Vue 3 + TypeScript' }
];

// 包管理器信息
const PACKAGE_MANAGERS: PackageManagerInfo[] = [
  {
    id: 'npm',
    name: 'npm',
    description: 'Node.js 默认包管理器，稳定可靠，广泛使用',
    command: 'npm'
  },
  {
    id: 'yarn',
    name: 'Yarn',
    description: '快速、可靠、安全的依赖管理工具，支持工作区',
    command: 'yarn'
  },
  {
    id: 'pnpm',
    name: 'pnpm',
    description: '高效的包管理器，节省磁盘空间，速度更快',
    command: 'pnpm'
  }
];

export default function CreateProjectModal({ isOpen, onClose, onConfirm }: CreateProjectModalProps) {
  const [formData, setFormData] = useState<ProjectCreationConfig>({
    name: '',
    path: '',
    template: 'express',
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

  if (!isOpen) return null;

  const selectedTemplate = TEMPLATES.find(t => t.id === formData.template);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证表单
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '项目名称不能为空';
    }
    
    if (!formData.path.trim()) {
      newErrors.path = '项目路径不能为空';
    }

    if (formData.port < 1000 || formData.port > 65535) {
      newErrors.port = '端口号必须在 1000-65535 之间';
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
      template: 'express',
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
        handleInputChange('path', path);
      }
    } catch (error) {
      console.error('选择目录失败:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-text-primary mb-4">创建新项目</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 项目基本信息 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-text-primary border-b border-border pb-2">基本信息</h4>
            
            {/* 项目名称 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                项目名称 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 bg-background-card border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                placeholder="my-awesome-project"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* 项目路径 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                项目路径 *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.path}
                  onChange={(e) => handleInputChange('path', e.target.value)}
                  className="flex-1 px-3 py-2 bg-background-card border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                  placeholder="/Users/yourname/projects"
                />
                <button
                  type="button"
                  onClick={selectDirectory}
                  className="px-3 py-2 bg-primary hover:bg-primary-hover text-text-primary rounded-lg transition-all"
                >
                  选择
                </button>
              </div>
              {errors.path && <p className="text-red-400 text-sm mt-1">{errors.path}</p>}
            </div>

            {/* 端口配置 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                端口号
              </label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 8000)}
                className="w-full px-3 py-2 bg-background-card border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                placeholder="8000"
                min="1000"
                max="65535"
              />
              {errors.port && <p className="text-red-400 text-sm mt-1">{errors.port}</p>}
              <p className="text-text-secondary text-xs mt-1">默认从 8000 开始</p>
            </div>
          </div>

          {/* 项目模板 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-text-primary border-b border-border pb-2">项目模板</h4>
            
            <div className="space-y-3">
              {TEMPLATES.map((template) => (
                <div 
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.template === template.id 
                      ? 'border-primary bg-primary bg-opacity-10' 
                      : 'border-border hover:border-border-hover'
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
                      <h5 className="font-medium text-text-primary">{template.name}</h5>
                      <p className="text-sm text-text-secondary mt-1">{template.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {template.features.map((feature, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-background-card text-text-secondary text-xs rounded-md"
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
                <label className="block text-sm font-medium text-text-primary mb-2">
                  前端框架
                </label>
                <div className="space-y-2">
                  {FRONTEND_FRAMEWORKS.map((framework) => (
                    <div 
                      key={framework.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.frontendFramework === framework.id 
                          ? 'border-primary bg-primary bg-opacity-10' 
                          : 'border-border hover:border-border-hover'
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
                          <span className="font-medium text-text-primary">{framework.name}</span>
                          <p className="text-sm text-text-secondary">{framework.description}</p>
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
            <h4 className="text-lg font-medium text-text-primary border-b border-border pb-2">包管理器</h4>
            
            <div className="space-y-2">
              {PACKAGE_MANAGERS.map((pm) => (
                <div 
                  key={pm.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.packageManager === pm.id 
                      ? 'border-primary bg-primary bg-opacity-10' 
                      : 'border-border hover:border-border-hover'
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
                      <span className="font-medium text-text-primary">{pm.name}</span>
                      <p className="text-sm text-text-secondary">{pm.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 可选工具 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-text-primary border-b border-border pb-2">可选工具</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.tools.eslint}
                  onChange={(e) => handleToolChange('eslint', e.target.checked)}
                  className="rounded"
                />
                <div>
                  <span className="text-sm font-medium text-text-primary">ESLint</span>
                  <p className="text-xs text-text-secondary">代码质量检查</p>
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
                  <span className="text-sm font-medium text-text-primary">Prettier</span>
                  <p className="text-xs text-text-secondary">代码格式化</p>
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
                  <span className="text-sm font-medium text-text-primary">Jest</span>
                  <p className="text-xs text-text-secondary">单元测试框架</p>
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
                  <span className="text-sm font-medium text-text-primary">.env 配置</span>
                  <p className="text-xs text-text-secondary">环境变量配置</p>
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
                  <span className="text-sm font-medium text-text-primary">自动安装依赖</span>
                  <p className="text-xs text-text-secondary">创建后自动安装</p>
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
                  <span className="text-sm font-medium text-text-primary">Git 初始化</span>
                  <p className="text-xs text-text-secondary">初始化 Git 仓库</p>
                </div>
              </label>
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-text-secondary border border-border hover:border-border-hover rounded-lg transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-text-primary rounded-lg transition-all"
            >
              创建项目
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 目录选择器函数
async function showDirectoryPicker(): Promise<string | null> {
  try {
    // 在Electron环境中，使用IPC调用主进程的目录选择对话框
    if (window.electron && window.electron.showOpenDialog) {
      const result = await window.electron.showOpenDialog({
        properties: ['openDirectory'],
        title: '选择项目目录',
        defaultPath: '/Users'
      });
      
      if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
      }
      return null;
    }
    
    // 降级方案：检查是否支持 File System Access API（Chrome 86+）
    if ('showDirectoryPicker' in window) {
      const dirHandle = await (window as any).showDirectoryPicker();
      // 在真实环境中，我们需要通过IPC获取完整路径
      // 这里返回一个模拟路径
      return `/Users/example/${dirHandle.name}`;
    }
    
    // 最后的降级方案：使用input元素
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
      input.multiple = true;
      input.style.display = 'none';
      
      input.onchange = (event: any) => {
        const files = event.target.files;
        if (files && files.length > 0) {
          const firstFile = files[0];
          const path = firstFile.webkitRelativePath;
          const folderPath = path.split('/')[0];
          resolve(`/Users/example/${folderPath}`);
        } else {
          resolve(null);
        }
        document.body.removeChild(input);
      };
      
      input.oncancel = () => {
        resolve(null);
        document.body.removeChild(input);
      };
      
      document.body.appendChild(input);
      input.click();
    });
    
  } catch (error) {
    console.error('选择目录失败:', error);
    
    // 最终降级到简单的prompt
    const path = prompt('请输入项目根目录路径:', '/Users/yourname/projects');
    return path;
  }
}
