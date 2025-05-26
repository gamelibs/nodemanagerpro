import React, { useState } from 'react';
import type { Project } from '../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (projectConfig: {
    name: string;
    path: string;
    type: Project['type'];
    packageManager: 'npm' | 'yarn' | 'pnpm';
    includeGit: boolean;
    templateType?: 'basic' | 'typescript' | 'react' | 'vue' | 'electron';
  }) => void;
}

export default function CreateProjectModal({ isOpen, onClose, onConfirm }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    path: '',
    type: 'node' as Project['type'],
    packageManager: 'npm' as 'npm' | 'yarn' | 'pnpm',
    includeGit: true,
    templateType: 'basic' as 'basic' | 'typescript' | 'react' | 'vue' | 'electron'
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

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
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // 构建完整路径
    const fullPath = formData.path.endsWith('/') 
      ? formData.path + formData.name 
      : formData.path + '/' + formData.name;
    
    onConfirm({
      ...formData,
      path: fullPath
    });
    
    // 重置表单
    setFormData({
      name: '',
      path: '',
      type: 'node',
      packageManager: 'npm',
      includeGit: true,
      templateType: 'basic'
    });
    setErrors({});
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
      <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-semibold text-text-primary mb-4">创建新项目</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {/* 项目类型 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              项目类型
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value as Project['type'])}
              className="w-full px-3 py-2 bg-background-card border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="node">Node.js</option>
              <option value="react">React</option>
              <option value="vue">Vue.js</option>
              <option value="electron">Electron</option>
              <option value="other">其他</option>
            </select>
          </div>

          {/* 包管理器 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              包管理器
            </label>
            <select
              value={formData.packageManager}
              onChange={(e) => handleInputChange('packageManager', e.target.value)}
              className="w-full px-3 py-2 bg-background-card border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="npm">npm</option>
              <option value="yarn">yarn</option>
              <option value="pnpm">pnpm</option>
            </select>
          </div>

          {/* 模板类型 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              模板类型
            </label>
            <select
              value={formData.templateType}
              onChange={(e) => handleInputChange('templateType', e.target.value)}
              className="w-full px-3 py-2 bg-background-card border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="basic">基础模板</option>
              <option value="typescript">TypeScript</option>
              <option value="react">React模板</option>
              <option value="vue">Vue模板</option>
              <option value="electron">Electron模板</option>
            </select>
          </div>

          {/* Git初始化 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeGit"
              checked={formData.includeGit}
              onChange={(e) => handleInputChange('includeGit', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="includeGit" className="text-sm text-text-primary">
              初始化Git仓库
            </label>
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
    // 模拟目录选择器
    const path = prompt('请输入项目根目录路径:', '/Users/example/projects');
    return path;
  } catch (error) {
    console.error('选择目录失败:', error);
    return null;
  }
}
