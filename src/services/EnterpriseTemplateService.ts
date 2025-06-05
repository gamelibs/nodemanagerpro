import type { EnterpriseTemplate, EnterpriseProjectConfig } from '../types';

export class EnterpriseTemplateService {
  /**
   * 获取所有企业级模板
   */
  static getEnterpriseTemplates(): EnterpriseTemplate[] {
    return [
      {
        id: 'enterprise-nextjs',
        name: 'Enterprise Next.js Website',
        description: '企业级Next.js网站模板，包含完整的国际化、主题系统、响应式设计等功能',
        category: 'frontend',
        tier: 'pro',
        price: 299,
        features: [
          {
            id: 'nextjs-14',
            name: 'Next.js 14',
            description: '最新版本的Next.js框架',
            included: true
          },
          {
            id: 'typescript',
            name: 'TypeScript',
            description: '完整的类型安全支持',
            included: true
          },
          {
            id: 'tailwind',
            name: 'Tailwind CSS',
            description: '现代化的CSS框架',
            included: true
          },
          {
            id: 'i18n',
            name: '国际化',
            description: '多语言支持 (中文/英文/日文)',
            included: true
          },
          {
            id: 'themes',
            name: '主题系统',
            description: '明暗主题切换',
            included: true
          },
          {
            id: 'responsive',
            name: '响应式设计',
            description: '移动端优先的响应式布局',
            included: true
          },
          {
            id: 'components',
            name: '组件库',
            description: '丰富的UI组件库',
            included: true
          },
          {
            id: 'seo',
            name: 'SEO优化',
            description: '搜索引擎优化配置',
            included: true
          },
          {
            id: 'performance',
            name: '性能优化',
            description: '代码分割和懒加载',
            included: true
          },
          {
            id: 'testing',
            name: '测试套件',
            description: 'Jest + Testing Library',
            included: true
          },
          {
            id: 'storybook',
            name: 'Storybook',
            description: '组件文档和开发环境',
            included: true,
            premium: true
          },
          {
            id: 'analytics',
            name: '数据分析',
            description: 'Google Analytics集成',
            included: true,
            premium: true
          }
        ],
        technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'next-intl', 'Framer Motion'],
        minNodeVersion: '18.0.0',
        estimatedSetupTime: '5-10分钟',
        complexity: 'intermediate',
        downloads: 1250,
        rating: 4.9,
        lastUpdated: new Date('2024-12-01')
      },
      {
        id: 'enterprise-react-spa',
        name: 'Enterprise React SPA',
        description: '企业级React单页应用模板，适用于管理后台和复杂业务系统',
        category: 'frontend',
        tier: 'pro',
        price: 199,
        features: [
          {
            id: 'react-18',
            name: 'React 18',
            description: '最新版本的React',
            included: true
          },
          {
            id: 'vite',
            name: 'Vite',
            description: '快速的构建工具',
            included: true
          },
          {
            id: 'router',
            name: 'React Router',
            description: '客户端路由管理',
            included: true
          },
          {
            id: 'state-management',
            name: '状态管理',
            description: 'Zustand状态管理',
            included: true
          },
          {
            id: 'ui-library',
            name: 'UI组件库',
            description: 'Ant Design集成',
            included: true,
            premium: true
          },
          {
            id: 'auth',
            name: '认证系统',
            description: '用户认证和授权',
            included: true,
            premium: true
          }
        ],
        technologies: ['React', 'TypeScript', 'Vite', 'React Router', 'Ant Design', 'Zustand'],
        minNodeVersion: '16.0.0',
        estimatedSetupTime: '3-5分钟',
        complexity: 'intermediate',
        downloads: 890,
        rating: 4.7,
        lastUpdated: new Date('2024-11-15')
      },
      {
        id: 'enterprise-vue-app',
        name: 'Enterprise Vue Application',
        description: '企业级Vue应用模板，包含Vue 3 Composition API和现代化工具链',
        category: 'frontend',
        tier: 'enterprise',
        price: 399,
        features: [
          {
            id: 'vue-3',
            name: 'Vue 3',
            description: 'Composition API和最新特性',
            included: true
          },
          {
            id: 'vue-router',
            name: 'Vue Router',
            description: '官方路由解决方案',
            included: true
          },
          {
            id: 'pinia',
            name: 'Pinia',
            description: 'Vue官方状态管理',
            included: true
          },
          {
            id: 'element-plus',
            name: 'Element Plus',
            description: '企业级UI组件库',
            included: true,
            premium: true
          },
          {
            id: 'vue-i18n',
            name: 'Vue I18n',
            description: 'Vue国际化解决方案',
            included: true,
            premium: true
          }
        ],
        technologies: ['Vue 3', 'TypeScript', 'Vite', 'Vue Router', 'Pinia', 'Element Plus'],
        minNodeVersion: '16.0.0',
        estimatedSetupTime: '5-8分钟',
        complexity: 'advanced',
        downloads: 650,
        rating: 4.8,
        lastUpdated: new Date('2024-11-20')
      }
    ];
  }

  /**
   * 根据ID获取企业级模板
   */
  static getTemplateById(id: string): EnterpriseTemplate | undefined {
    return this.getEnterpriseTemplates().find(template => template.id === id);
  }

  /**
   * 获取免费模板
   */
  static getFreeTemplates(): EnterpriseTemplate[] {
    return this.getEnterpriseTemplates().filter(template => template.tier === 'free');
  }

  /**
   * 获取付费模板
   */
  static getPremiumTemplates(): EnterpriseTemplate[] {
    return this.getEnterpriseTemplates().filter(template => template.tier !== 'free');
  }

  /**
   * 验证模板许可证
   */
  static async validateLicense(templateId: string, licenseKey?: string): Promise<boolean> {
    const template = this.getTemplateById(templateId);
    if (!template) return false;

    // 免费模板无需验证
    if (template.tier === 'free') return true;

    // 付费模板需要许可证验证
    if (!licenseKey) return false;

    // 这里可以调用许可证验证API
    // 暂时返回true用于演示
    return true;
  }

  /**
   * 创建企业级项目配置
   */
  static createEnterpriseConfig(templateId: string, baseConfig: any): EnterpriseProjectConfig {
    const template = this.getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const enterpriseConfig: EnterpriseProjectConfig = {
      ...baseConfig,
      template: templateId as any,
      enterpriseFeatures: this.getDefaultEnterpriseFeatures(templateId)
    };

    return enterpriseConfig;
  }

  /**
   * 获取模板的默认企业级功能配置
   */
  private static getDefaultEnterpriseFeatures(templateId: string) {
    switch (templateId) {
      case 'enterprise-nextjs':
        return {
          internationalization: {
            enabled: true,
            defaultLocale: 'zh-CN',
            supportedLocales: ['zh-CN', 'en-US', 'ja-JP']
          },
          authentication: {
            provider: 'custom',
            enabled: false
          },
          database: {
            type: 'postgresql',
            enabled: false
          },
          deployment: {
            platform: 'vercel',
            cicd: true
          },
          monitoring: {
            errorTracking: true,
            analytics: true,
            performance: true
          },
          ui: {
            designSystem: 'tailwind',
            responsive: true,
            darkMode: true
          }
        };
      case 'enterprise-react-spa':
        return {
          authentication: {
            provider: 'custom',
            enabled: true
          },
          ui: {
            designSystem: 'ant-design',
            responsive: true,
            darkMode: true
          }
        };
      case 'enterprise-vue-app':
        return {
          internationalization: {
            enabled: true,
            defaultLocale: 'zh-CN',
            supportedLocales: ['zh-CN', 'en-US']
          },
          ui: {
            designSystem: 'element-plus',
            responsive: true,
            darkMode: true
          }
        };
      default:
        return {};
    }
  }

  /**
   * 检查用户是否有权限使用企业级模板
   */
  static async checkUserPermissions(templateId: string): Promise<{
    hasPermission: boolean;
    reason?: string;
    upgradeUrl?: string;
  }> {
    const template = this.getTemplateById(templateId);
    if (!template) {
      return { hasPermission: false, reason: '模板不存在' };
    }

    if (template.tier === 'free') {
      return { hasPermission: true };
    }

    // 这里可以检查用户的订阅状态或许可证
    // 暂时返回需要升级的提示
    return {
      hasPermission: false,
      reason: `此模板需要 ${template.tier} 版本许可证`,
      upgradeUrl: `/upgrade?template=${templateId}`
    };
  }
}
