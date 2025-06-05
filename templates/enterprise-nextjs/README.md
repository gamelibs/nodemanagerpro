# 企业级 Next.js 网站模板

## 📋 项目概述

这是一个功能完整的企业级 Next.js 网站模板，专为现代企业和组织设计。模板包含了构建专业网站所需的所有核心功能，包括国际化、主题系统、响应式设计等。

## ✨ 主要特性

### 🌐 国际化支持
- **多语言支持**: 内置中文、英文、日文支持
- **动态语言切换**: 用户可以实时切换语言
- **SEO友好**: 每种语言都有独立的URL路径

### 🎨 现代化设计系统
- **Tailwind CSS**: 基于实用类的CSS框架
- **响应式设计**: 移动端优先的响应式布局
- **明暗主题**: 自动检测系统主题并支持手动切换
- **动画效果**: 使用 Framer Motion 实现流畅的动画

### 🔧 开发体验
- **TypeScript**: 完整的类型安全支持
- **ESLint + Prettier**: 代码质量和格式化工具
- **Husky**: Git hooks 自动化代码检查
- **Storybook**: 组件文档和开发环境

### 📊 性能优化
- **代码分割**: 自动的路由级代码分割
- **图像优化**: Next.js 内置的图像优化
- **Bundle 分析**: 内置 bundle analyzer
- **缓存策略**: 优化的缓存配置

### 🧪 测试套件
- **Jest**: 单元测试框架
- **Testing Library**: React 组件测试
- **测试覆盖率**: 代码覆盖率报告

## 🚀 快速开始

### 环境要求
- Node.js 18.0.0 或更高版本
- pnpm 8.0.0 或更高版本（推荐）

### 安装和运行

1. **安装依赖**
   ```bash
   pnpm install
   ```

2. **启动开发服务器**
   ```bash
   pnpm dev
   ```

3. **构建生产版本**
   ```bash
   pnpm build
   ```

4. **启动生产服务器**
   ```bash
   pnpm start
   ```

### 开发工具

- **类型检查**: `pnpm type-check`
- **代码检查**: `pnpm lint`
- **代码格式化**: `pnpm lint:fix`
- **运行测试**: `pnpm test`
- **测试覆盖率**: `pnpm test:coverage`
- **启动 Storybook**: `pnpm storybook`
- **分析包大小**: `pnpm analyze`

## 📁 项目结构

```
src/
├── app/                    # Next.js 13+ App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局组件
│   └── page.tsx           # 首页组件
├── components/            # React 组件
│   ├── layout/           # 布局组件
│   │   ├── Header.tsx    # 页面头部
│   │   └── Footer.tsx    # 页面底部
│   ├── sections/         # 页面区块组件
│   │   ├── Hero.tsx      # 英雄区块
│   │   ├── Features.tsx  # 功能特性
│   │   └── CTA.tsx       # 行动召唤
│   └── ui/               # 基础UI组件
│       ├── Button.tsx    # 按钮组件
│       └── LanguageSwitcher.tsx # 语言切换器
├── lib/                  # 工具函数和配置
│   ├── utils.ts          # 通用工具函数
│   └── config.ts         # 网站配置
├── hooks/                # 自定义 React Hooks
├── types/                # TypeScript 类型定义
└── constants/            # 常量定义

messages/                 # 国际化消息文件
├── zh-CN.json           # 中文消息
├── en-US.json           # 英文消息
└── ja-JP.json           # 日文消息
```

## 🎨 自定义主题

### 颜色系统

模板使用了完整的设计令牌系统，您可以在 `tailwind.config.js` 中自定义颜色：

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        500: '#3b82f6',
        900: '#1e3a8a',
      },
      // 更多颜色配置...
    }
  }
}
```

### 组件定制

所有组件都使用 Tailwind CSS 类构建，您可以轻松修改样式：

```tsx
// 修改按钮样式
<Button className="bg-purple-600 hover:bg-purple-700">
  自定义按钮
</Button>
```

## 🌍 国际化配置

### 添加新语言

1. 在 `messages/` 目录下创建新的语言文件，如 `fr-FR.json`
2. 在 `next.config.js` 中添加新的语言代码
3. 在 `LanguageSwitcher.tsx` 中添加语言选项

### 翻译内容

使用 `useTranslations` Hook 获取翻译文本：

```tsx
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('MyComponent');
  
  return <h1>{t('title')}</h1>;
}
```

## 📱 响应式设计

模板采用移动端优先的设计方法：

- **移动端**: 默认样式
- **平板**: `md:` 前缀 (768px+)
- **桌面**: `lg:` 前缀 (1024px+)
- **大屏**: `xl:` 前缀 (1280px+)

```tsx
<div className="text-sm md:text-base lg:text-lg">
  响应式文本大小
</div>
```

## 🔧 配置选项

### 网站配置

在 `src/lib/config.ts` 中修改网站基本信息：

```typescript
export const siteConfig = {
  name: '您的网站名称',
  description: '网站描述',
  url: 'https://your-domain.com',
  // 更多配置...
}
```

### Next.js 配置

在 `next.config.js` 中自定义 Next.js 配置：

- 图像域名配置
- 安全头配置
- 构建优化选项

## 🚀 部署

### Vercel (推荐)

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 自动部署和 CI/CD

### 其他平台

模板支持部署到任何支持 Node.js 的平台：

- Netlify
- AWS Amplify
- Docker
- 传统服务器

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage
```

### 编写测试

```tsx
// __tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

## 📈 SEO 优化

模板包含完整的 SEO 优化配置：

- 结构化数据
- Open Graph 标签
- Twitter Cards
- 站点地图
- robots.txt

## 🔒 安全配置

- 安全头配置
- CSRF 保护
- XSS 防护
- 内容安全策略

## 📊 性能监控

- Core Web Vitals 监控
- 错误跟踪集成
- 性能分析工具

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📝 许可证

本模板基于 MIT 许可证发布。详见 LICENSE 文件。

## 🆘 支持

如果您遇到问题或需要帮助：

1. 查看文档和常见问题
2. 在 GitHub Issues 中报告问题
3. 联系技术支持团队

---

**开始构建您的下一个企业级网站吧！** 🚀
