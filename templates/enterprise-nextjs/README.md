# 🎮 企业级 Next.js 小游戏网站模板

## 📋 项目概述

这是一个专为**在线小游戏展示平台**设计的企业级 Next.js 网站模板。该模板提供了完整的小游戏运营网站功能，包括游戏展示、分类筛选、iframe游戏嵌入、多语言支持和现代化的用户体验。

**🎯 适用场景**: 小游戏运营平台、在线游戏门户、休闲游戏网站

## ✨ 核心特性

### 🎮 游戏功能
- **游戏展示**: 精美的游戏卡片网格布局
- **分类筛选**: 按益智、休闲、动作等分类浏览
- **搜索功能**: 快速查找游戏
- **iframe嵌入**: 安全的游戏内嵌播放
- **相关推荐**: 智能游戏推荐系统
- **移动端适配**: 触屏友好的游戏体验

### 🌍 国际化系统
- **中英文支持**: 完整的双语言支持 (zh-CN, en-US)
- **动态语言切换**: Header中的语言选择器
- **URL国际化**: SEO友好的多语言路由 (`/zh/games`, `/en/games`)
- **本地化内容**: 游戏名称、描述、分类都支持多语言

### 🎨 主题系统
- **双主题支持**: 亮色和暗色主题
- **青绿色配色**: 简约现代的青绿色设计风格
- **主题切换**: Header中的主题切换按钮
- **系统主题检测**: 自动跟随用户系统设置

### 🔍 SEO优化
- **页面级SEO**: 每个页面独立的Meta标签
- **结构化数据**: JSON-LD格式的游戏数据
- **自动生成**: sitemap.xml 和 robots.txt
- **Open Graph**: 社交媒体分享优化
- **性能优化**: Next.js 14 的最新优化特性

### 📱 响应式设计
- **移动端优先**: 专为移动设备优化的游戏体验
- **自适应布局**: 游戏网格和iframe自动适配屏幕
- **触屏优化**: 移动端友好的交互设计

### 🛡️ 合规审核
- **法律页面**: 完整的关于我们、隐私政策、服务条款
- **无用户系统**: 避免数据隐私复杂性
- **纯展示性质**: 游戏内容来自外部链接
- **清晰导航**: 所有页面都有明确入口

### 🔧 开发体验
- **TypeScript**: 完整的类型安全支持
- **Tailwind CSS**: 纯CSS实现，无外部UI框架依赖
- **组件化架构**: 高度可复用的组件系统
- **热重载**: 开发时的实时更新
- **代码规范**: ESLint + Prettier 自动格式化

### 🚀 部署支持
- **PM2 集成**: 完整的 PM2 生产部署支持
- **多环境配置**: 开发、测试、生产环境分离
- **健康检查**: 自动化的系统健康监控
- **日志管理**: 结构化的日志记录和轮转
- **集群模式**: 支持多实例负载均衡
- **零停机部署**: 热重载和平滑重启
- **Docker 支持**: 容器化部署选项

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
├── app/                          # Next.js 14 App Router
│   ├── [locale]/                # 国际化路由
│   │   ├── games/               # 游戏相关页面
│   │   │   ├── page.tsx         # 游戏列表页
│   │   │   ├── [category]/      # 分类页面
│   │   │   │   └── page.tsx
│   │   │   └── [slug]/          # 游戏详情页
│   │   │       └── page.tsx
│   │   ├── about/               # 关于我们
│   │   ├── privacy/             # 隐私政策
│   │   ├── terms/               # 服务条款
│   │   ├── contact/             # 联系我们
│   │   ├── layout.tsx           # 国际化布局
│   │   └── page.tsx             # 首页
│   ├── globals.css              # 全局样式和主题
│   ├── layout.tsx               # 根布局
│   ├── sitemap.ts               # 站点地图生成
│   └── robots.ts                # 爬虫配置
├── components/                   # React 组件库
│   ├── layout/                  # 布局组件
│   │   ├── Header.tsx           # 导航栏 (语言/主题切换)
│   │   ├── Footer.tsx           # 页脚
│   │   └── Navigation.tsx       # 主导航
│   ├── games/                   # 游戏相关组件
│   │   ├── GameCard.tsx         # 游戏卡片
│   │   ├── GameGrid.tsx         # 游戏网格布局
│   │   ├── GameIframe.tsx       # 游戏iframe容器
│   │   ├── CategoryFilter.tsx   # 分类筛选器
│   │   ├── SearchBox.tsx        # 搜索框
│   │   └── RelatedGames.tsx     # 相关游戏推荐
│   ├── ui/                      # 基础UI组件
│   │   ├── Button.tsx           # 按钮组件
│   │   ├── Card.tsx             # 卡片组件
│   │   ├── Badge.tsx            # 标签组件
│   │   ├── LoadingSpinner.tsx   # 加载动画
│   │   └── ErrorBoundary.tsx    # 错误边界
│   └── theme/                   # 主题相关组件
│       ├── ThemeProvider.tsx    # 主题提供者
│       └── ThemeToggle.tsx      # 主题切换按钮
├── lib/                         # 工具函数和配置
│   ├── games.ts                 # 游戏数据处理
│   ├── utils.ts                 # 通用工具函数
│   ├── constants.ts             # 常量定义
│   ├── metadata.ts              # SEO元数据生成
│   └── config.ts                # 网站配置
├── hooks/                       # 自定义React Hooks
│   ├── useTheme.ts              # 主题管理
│   ├── useLocalStorage.ts       # 本地存储
│   └── useDebounce.ts           # 防抖处理
├── types/                       # TypeScript 类型定义
│   ├── game.ts                  # 游戏相关类型
│   ├── theme.ts                 # 主题类型
│   └── global.ts                # 全局类型
└── data/                        # 静态数据
    ├── games.json               # 游戏数据
    └── categories.json          # 分类数据

messages/                        # 国际化消息文件
├── zh-CN.json                   # 中文语言包
└── en-US.json                   # 英文语言包

public/                          # 静态资源
├── games/                       # 游戏相关图片
│   ├── thumbnails/              # 游戏缩略图
│   └── icons/                   # 游戏图标
├── icons/                       # 网站图标
└── images/                      # 其他图片资源
```

## 🎮 游戏数据配置

### 游戏数据结构

在 `src/data/games.json` 中定义游戏数据：

```json
{
  "games": [
    {
      "id": "puzzle-game-1",
      "title": {
        "zh-CN": "益智拼图",
        "en-US": "Puzzle Game"
      },
      "description": {
        "zh-CN": "经典的拼图游戏，训练你的思维能力",
        "en-US": "Classic puzzle game to train your mind"
      },
      "category": "puzzle",
      "thumbnail": "/games/thumbnails/puzzle-1.jpg",
      "gameUrl": "https://example.com/games/puzzle-1",
      "difficulty": "easy",
      "tags": ["puzzle", "logic", "brain"],
      "featured": true,
      "playCount": 12500,
      "rating": 4.5
    }
  ]
}
```

### 分类配置

在 `src/data/categories.json` 中定义游戏分类：

```json
{
  "categories": [
    {
      "id": "puzzle",
      "name": {
        "zh-CN": "益智游戏",
        "en-US": "Puzzle Games"
      },
      "icon": "🧩",
      "color": "teal"
    },
    {
      "id": "action",
      "name": {
        "zh-CN": "动作游戏", 
        "en-US": "Action Games"
      },
      "icon": "⚡",
      "color": "red"
    }
  ]
}
```

## 🎨 主题系统配置

### 青绿色配色方案

模板使用青绿色 (Teal-Green) 作为主色调，在 `tailwind.config.js` 中配置：

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#f0fdfa',   // 极浅青绿
        100: '#ccfbf1',  // 浅青绿
        200: '#99f6e4',  // 青绿
        300: '#5eead4',  // 中青绿
        400: '#2dd4bf',  // 明青绿
        500: '#14b8a6',  // 标准青绿 (主色)
        600: '#0d9488',  // 深青绿
        700: '#0f766e',  // 更深青绿
        800: '#115e59',  // 很深青绿
        900: '#134e4a',  // 极深青绿
      },
      secondary: {
        // 灰色系，用于辅助元素
        50: '#f8fafc',
        500: '#64748b',
        900: '#0f172a',
      }
    }
  }
}
```

### CSS变量主题切换

在 `src/app/globals.css` 中定义CSS变量：

```css
:root {
  --primary: 168 85% 39%;      /* teal-500 */
  --primary-foreground: 0 0% 98%;
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  /* 更多变量... */
}

[data-theme="dark"] {
  --primary: 172 66% 50%;      /* teal-400 */
  --primary-foreground: 240 10% 3.9%;
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  /* 更多变量... */
}
```

### 组件样式定制

使用Tailwind类和CSS变量构建组件：

```tsx
// GameCard组件示例
<div className="bg-card border border-border rounded-lg hover:bg-primary/5 transition-colors">
  <img className="w-full h-48 object-cover rounded-t-lg" />
  <div className="p-4">
    <h3 className="text-foreground font-semibold">{game.title}</h3>
    <p className="text-muted-foreground text-sm">{game.description}</p>
    <div className="flex items-center justify-between mt-4">
      <Badge className="bg-primary/10 text-primary">{game.category}</Badge>
      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
        开始游戏
      </Button>
    </div>
  </div>
</div>
```

## 🌍 国际化配置

### 语言支持

模板支持中文和英文，配置在 `next.config.js`：

```javascript
const withNextIntl = require('next-intl/plugin')();

module.exports = withNextIntl({
  i18n: {
    locales: ['zh-CN', 'en-US'],
    defaultLocale: 'zh-CN',
  }
});
```

### 语言包结构

在 `messages/zh-CN.json` 中定义中文内容：

```json
{
  "common": {
    "play": "开始游戏",
    "search": "搜索游戏",
    "categories": "游戏分类",
    "featured": "精品推荐"
  },
  "games": {
    "title": "小游戏大全",
    "description": "精选优质小游戏，随时随地畅玩",
    "noResults": "没有找到相关游戏",
    "loading": "加载中..."
  },
  "categories": {
    "all": "全部",
    "puzzle": "益智",
    "action": "动作", 
    "arcade": "街机",
    "casual": "休闲"
  },
  "navigation": {
    "home": "首页",
    "games": "游戏",
    "about": "关于",
    "contact": "联系"
  }
}
```

### 使用翻译

在组件中使用 `useTranslations` Hook：

```tsx
import { useTranslations } from 'next-intl';

function GameCard({ game }) {
  const t = useTranslations('common');
  
  return (
    <div className="game-card">
      <h3>{game.title}</h3>
      <button>{t('play')}</button>
    </div>
  );
}
```

### 路由国际化

页面自动支持语言前缀路由：
- `/zh-CN/games` - 中文游戏页面  
- `/en-US/games` - 英文游戏页面
- `/zh-CN/games/puzzle` - 中文益智游戏分类

## 📱 移动端游戏体验

### 响应式游戏布局

模板专为移动端游戏体验优化：

```tsx
// GameGrid 响应式布局
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {games.map(game => (
    <GameCard key={game.id} game={game} />
  ))}
</div>

// GameIframe 自适应容器
<div className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh]">
  <iframe 
    src={game.url}
    className="absolute inset-0 w-full h-full border-0 rounded-lg"
    allowFullScreen
  />
</div>
```

### 触屏友好设计

- **大按钮**: 最小44px触屏目标
- **手势支持**: 滑动切换游戏
- **安全区域**: 适配刘海屏和圆角
- **横屏适配**: 游戏iframe支持横屏模式

```css
/* 安全区域适配 */
.game-container {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
}
```

### 性能优化

- **懒加载**: 游戏图片和iframe懒加载
- **预加载**: 关键资源预加载
- **缓存**: 游戏数据和图片缓存策略

```tsx
// 图片懒加载
<Image
  src={game.thumbnail}
  alt={game.title}
  width={300}
  height={200}
  loading="lazy"
  className="w-full h-48 object-cover"
/>
```

## 🔧 配置选项

### 网站配置

在 `src/lib/config.ts` 中修改小游戏网站配置：

```typescript
export const siteConfig = {
  name: '小游戏大全',
  description: '精选优质小游戏，随时随地畅玩',
  url: 'https://your-game-site.com',
  ogImage: '/images/og-image.jpg',
  
  // 游戏配置
  games: {
    defaultCategory: 'all',
    gamesPerPage: 12,
    featuredCount: 6,
    enableSearch: true,
    enableFilters: true,
  },
  
  // SEO配置
  seo: {
    keywords: ['小游戏', '在线游戏', '免费游戏', 'HTML5游戏'],
    author: '游戏网站',
    twitterHandle: '@yourgamesite',
  },
  
  // 社交媒体
  social: {
    twitter: 'https://twitter.com/yourgamesite',
    facebook: 'https://facebook.com/yourgamesite',
  }
}
```

### Next.js 游戏网站配置

在 `next.config.js` 中优化游戏网站：

```javascript
const withNextIntl = require('next-intl/plugin')();

module.exports = withNextIntl({
  // 图像域名配置 (游戏缩略图)
  images: {
    domains: [
      'example.com',
      'gamecdn.com', 
      'img.yourgamesite.com'
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 安全头配置 (iframe安全)
  async headers() {
    return [
      {
        source: '/games/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' *.yourdomain.com",
          },
        ],
      },
    ];
  },
  
  // 重定向配置
  async redirects() {
    return [
      {
        source: '/game/:slug',
        destination: '/games/:slug',
        permanent: true,
      },
    ];
  }
});
```

## 🚀 部署配置

### Vercel 部署 (推荐)

1. **准备部署**
   ```bash
   # 构建测试
   pnpm build
   
   # 检查输出
   pnpm start
   ```

2. **环境变量配置**
   ```env
   NEXT_PUBLIC_SITE_URL=https://your-game-site.com
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_GAME_API_URL=https://api.yourgamesite.com
   ```

3. **Vercel配置** (`vercel.json`)
   ```json
   {
     "framework": "nextjs",
     "buildCommand": "pnpm build",
     "devCommand": "pnpm dev",
     "installCommand": "pnpm install",
     "functions": {
       "app/api/**/*.ts": {
         "maxDuration": 10
       }
     }
   }
   ```

### PM2 部署

1. **全局安装 PM2**
   ```bash
   npm install -g pm2
   ```

2. **启动应用**
   ```bash
   pm2 start npm --name "mini-game-website" -- run start
   ```

3. **其他常用命令**
   ```bash
   pm2 stop mini-game-website        # 停止应用
   pm2 restart mini-game-website     # 重启应用
   pm2 delete mini-game-website      # 删除应用
   pm2 logs mini-game-website        # 查看日志
   ```

4. **PM2 配置示例** (`ecosystem.config.js`)
   ```javascript
   module.exports = {
     apps: [
       {
         name: "mini-game-website",
         script: "npm",
         args: "start",
         instances: "max",
         exec_mode: "cluster",
         env: {
           NODE_ENV: "production",
           NEXT_PUBLIC_SITE_URL: "https://your-game-site.com",
           NEXT_PUBLIC_GA_ID: "G-XXXXXXXXXX",
           NEXT_PUBLIC_GAME_API_URL: "https://api.yourgamesite.com",
         },
         log_file: "./logs/pm2-logs.log",
         merge_logs: true,
         max_memory_restart: "300M",
         restart_delay: 5000,
       }
     ]
   };
   ```

3. **启动 PM2 配置**
   ```bash
   pm2 start ecosystem.config.js
   ```

### 其他平台部署

- **Netlify**: 支持静态导出 (`output: 'export'`)
- **AWS Amplify**: 自动CI/CD和全球CDN
- **Docker**: 容器化部署
- **传统服务器**: PM2 + Nginx反向代理

### CDN优化

配置CDN加速游戏资源：

```javascript
// next.config.js
module.exports = {
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.yourgamesite.com' 
    : '',
  
  images: {
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.js'
  }
}
```

## 🧪 测试套件

### 运行测试

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage

# E2E测试
pnpm test:e2e
```

### 游戏组件测试

```tsx
// __tests__/components/GameCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { GameCard } from '@/components/games/GameCard';

const mockGame = {
  id: 'test-game',
  title: { 'zh-CN': '测试游戏', 'en-US': 'Test Game' },
  category: 'puzzle',
  thumbnail: '/test-thumb.jpg',
  gameUrl: 'https://example.com/game'
};

test('renders game card with title and play button', () => {
  render(<GameCard game={mockGame} locale="zh-CN" />);
  
  expect(screen.getByText('测试游戏')).toBeInTheDocument();
  expect(screen.getByText('开始游戏')).toBeInTheDocument();
});

test('opens game in new tab when play button clicked', () => {
  const mockOpen = jest.spyOn(window, 'open').mockImplementation();
  render(<GameCard game={mockGame} locale="zh-CN" />);
  
  fireEvent.click(screen.getByText('开始游戏'));
  expect(mockOpen).toHaveBeenCalledWith(mockGame.gameUrl, '_blank');
});
```

### 国际化测试

```tsx
// __tests__/i18n.test.tsx
import { render } from '@testing-library/react';
import { NextIntlProvider } from 'next-intl';
import { Header } from '@/components/layout/Header';

const messages = {
  navigation: { home: 'Home', games: 'Games' }
};

test('renders navigation in English', () => {
  const { getByText } = render(
    <NextIntlProvider locale="en-US" messages={messages}>
      <Header />
    </NextIntlProvider>
  );
  
  expect(getByText('Home')).toBeInTheDocument();
  expect(getByText('Games')).toBeInTheDocument();
});
```

## 📈 SEO 优化配置

### 页面级SEO

每个页面都有完整的SEO配置：

```tsx
// app/[locale]/games/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const game = await getGame(params.slug);
  
  return {
    title: `${game.title[params.locale]} - 小游戏大全`,
    description: game.description[params.locale],
    keywords: [...game.tags, '小游戏', '在线游戏'],
    openGraph: {
      title: game.title[params.locale],
      description: game.description[params.locale],
      images: [game.thumbnail],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: game.title[params.locale],
      description: game.description[params.locale],
      images: [game.thumbnail],
    },
    alternates: {
      canonical: `/games/${params.slug}`,
      languages: {
        'zh-CN': `/zh-CN/games/${params.slug}`,
        'en-US': `/en-US/games/${params.slug}`,
      },
    },
  };
}
```

### 结构化数据

游戏页面包含JSON-LD结构化数据：

```tsx
// components/seo/GameStructuredData.tsx
export function GameStructuredData({ game, locale }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Game",
    "name": game.title[locale],
    "description": game.description[locale],
    "image": game.thumbnail,
    "genre": game.category,
    "playMode": "single-player",
    "applicationCategory": "Game",
    "operatingSystem": "Web Browser",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": game.rating,
      "bestRating": 5,
      "worstRating": 1,
      "ratingCount": game.reviewCount
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
```

### 自动生成Sitemap

```tsx
// app/sitemap.ts
export default async function sitemap() {
  const games = await getAllGames();
  const locales = ['zh-CN', 'en-US'];
  
  const gameUrls = games.flatMap(game => 
    locales.map(locale => ({
      url: `${siteConfig.url}/${locale}/games/${game.slug}`,
      lastModified: game.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map(loc => [loc, `${siteConfig.url}/${loc}/games/${game.slug}`])
        )
      }
    }))
  );

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...gameUrls
  ];
}
```

### Robots.txt配置

```tsx
// app/robots.ts
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
```

## 🔒 游戏安全配置

### iframe安全策略

保护游戏iframe不被恶意利用：

```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/games/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'Content-Security-Policy',
          value: "frame-src 'self' https://*.trusted-game-domain.com; frame-ancestors 'self';",
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ];
}
```

### 游戏URL验证

验证游戏链接安全性：

```tsx
// lib/gameValidation.ts
const TRUSTED_DOMAINS = [
  'trusted-games.com',
  'safe-game-cdn.com',
  'your-game-server.com'
];

export function validateGameUrl(url: string): boolean {
  try {
    const gameUrl = new URL(url);
    return TRUSTED_DOMAINS.includes(gameUrl.hostname);
  } catch {
    return false;
  }
}

// components/games/GameIframe.tsx
export function GameIframe({ gameUrl, title }) {
  if (!validateGameUrl(gameUrl)) {
    return <div>游戏链接不安全</div>;
  }
  
  return (
    <iframe
      src={gameUrl}
      title={title}
      className="w-full h-full border-0"
      sandbox="allow-scripts allow-same-origin allow-forms"
      loading="lazy"
    />
  );
}
```

### 内容安全策略

```tsx
// components/seo/SecurityHeaders.tsx
export function SecurityHeaders() {
  return (
    <head>
      <meta httpEquiv="Content-Security-Policy" 
            content="default-src 'self'; script-src 'self' 'unsafe-inline' https://trusted-analytics.com; img-src 'self' data: https:; frame-src 'self' https://*.trusted-game-domain.com;" />
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
    </head>
  );
}
```

## 📊 性能监控

### Core Web Vitals 监控

集成性能监控以优化游戏加载体验：

```tsx
// lib/analytics.ts
export function reportWebVitals(metric: any) {
  // 发送到分析服务
  if (process.env.NODE_ENV === 'production') {
    console.log(metric);
    
    // 游戏相关性能指标
    if (metric.name === 'LCP' && metric.value > 2500) {
      console.warn('游戏缩略图加载过慢:', metric.value);
    }
    
    if (metric.name === 'CLS' && metric.value > 0.1) {
      console.warn('游戏卡片布局偏移:', metric.value);
    }
  }
}

// app/layout.tsx
import { reportWebVitals } from '@/lib/analytics';

export default function RootLayout({ children }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(reportWebVitals);
        getFID(reportWebVitals);
        getFCP(reportWebVitals);
        getLCP(reportWebVitals);
        getTTFB(reportWebVitals);
      });
    }
  }, []);

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### 游戏加载性能优化

```tsx
// components/games/GameCard.tsx
import { useState, useEffect } from 'react';
import Image from 'next/image';

export function GameCard({ game }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadTime, setLoadTime] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    
    const img = new Image();
    img.onload = () => {
      const endTime = performance.now();
      setLoadTime(endTime - startTime);
      setImageLoaded(true);
      
      // 记录慢加载图片
      if (endTime - startTime > 1000) {
        console.warn(`游戏图片加载过慢: ${game.title} - ${endTime - startTime}ms`);
      }
    };
    img.src = game.thumbnail;
  }, [game]);

  return (
    <div className="game-card">
      <div className="relative">
        <Image
          src={game.thumbnail}
          alt={game.title}
          width={300}
          height={200}
          className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
        )}
      </div>
      {/* 游戏信息 */}
    </div>
  );
}
```

### 错误监控

```tsx
// lib/errorTracking.ts
export function trackError(error: Error, context?: any) {
  console.error('游戏网站错误:', error, context);
  
  // 发送到错误监控服务
  if (process.env.NODE_ENV === 'production') {
    // 集成 Sentry 或其他错误监控服务
    fetch('/api/errors', {
      method: 'POST',
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
      })
    });
  }
}

// components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';
import { trackError } from '@/lib/errorTracking';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GameErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    trackError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold">游戏加载失败</h3>
          <p className="text-red-600 text-sm mt-1">请刷新页面重试</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 🤝 贡献指南

### 开发流程

1. **Fork 项目**
   ```bash
   git clone https://github.com/your-username/mini-game-website.git
   cd mini-game-website
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **创建功能分支**
   ```bash
   git checkout -b feature/new-game-category
   ```

4. **开发和测试**
   ```bash
   pnpm dev        # 启动开发服务器
   pnpm test       # 运行测试
   pnpm lint       # 代码检查
   ```

5. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加新游戏分类功能"
   git push origin feature/new-game-category
   ```

6. **创建 Pull Request**

### 代码规范

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 和 Prettier 配置
- 编写有意义的提交信息 (Conventional Commits)
- 为新功能添加测试用例
- 更新相关文档

### 添加新游戏

1. **游戏数据格式**
   ```json
   {
     "id": "unique-game-id",
     "title": {
       "zh-CN": "游戏中文名",
       "en-US": "Game English Name"
     },
     "description": {
       "zh-CN": "游戏描述",
       "en-US": "Game description"
     },
     "category": "puzzle|action|arcade|casual",
     "thumbnail": "/games/thumbnails/game-thumb.jpg",
     "gameUrl": "https://trusted-domain.com/game-url",
     "difficulty": "easy|medium|hard",
     "tags": ["tag1", "tag2"],
     "featured": false,
     "playCount": 0,
     "rating": 0
   }
   ```

2. **添加游戏步骤**
   - 在 `src/data/games.json` 中添加游戏数据
   - 添加游戏缩略图到 `public/games/thumbnails/`
   - 验证游戏URL安全性
   - 更新国际化文件 (如需要)
   - 运行测试确保没有破坏性更改

## ❓ 常见问题

### Q: 如何添加新的游戏分类？

A: 在 `src/data/categories.json` 中添加新分类，并更新相关的国际化文件：

```json
{
  "id": "strategy",
  "name": {
    "zh-CN": "策略游戏",
    "en-US": "Strategy Games"
  },
  "icon": "🧠",
  "color": "blue"
}
```

### Q: 如何自定义主题颜色？

A: 修改 `tailwind.config.js` 中的颜色配置：

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#your-custom-color', // 替换为你的颜色
      }
    }
  }
}
```

### Q: 如何优化游戏加载性能？

A: 几个关键优化点：
- 使用 WebP 格式的游戏缩略图
- 启用图片懒加载
- 对游戏iframe使用 `loading="lazy"`
- 配置CDN加速静态资源

### Q: 如何确保游戏iframe安全？

A: 模板已包含安全配置：
- CSP (内容安全策略) 限制
- iframe sandbox 属性
- URL域名白名单验证
- X-Frame-Options 头部设置

### Q: 如何添加第三方分析工具？

A: 在 `src/lib/analytics.ts` 中集成：

```tsx
// 集成 Google Analytics
export function initAnalytics() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_ID) {
    import('gtag').then(({ gtag }) => {
      gtag('config', process.env.NEXT_PUBLIC_GA_ID);
    });
  }
}
```

## 🛠️ 技术栈详解

### 核心框架
- **Next.js 14**: App Router, SSR/SSG, 自动优化
- **React 18**: Hooks, Suspense, 并发特性
- **TypeScript**: 类型安全, 开发体验优化

### 样式系统
- **Tailwind CSS**: 原子化CSS, 响应式设计
- **CSS Variables**: 主题切换, 动态样式
- **PostCSS**: CSS处理和优化

### 国际化
- **next-intl**: 路由级国际化, 类型安全
- **ICU消息格式**: 复数、日期、数字格式化

### 开发工具
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **Husky**: Git hooks 自动化
- **Jest**: 单元测试框架
- **Testing Library**: React组件测试

### 性能优化
- **Image Optimization**: Next.js 自动图片优化
- **Code Splitting**: 自动代码分割
- **Bundle Analyzer**: 包大小分析
- **Web Vitals**: 性能监控

## 📜 许可证

本模板基于 **MIT 许可证** 发布。详见 [LICENSE](LICENSE) 文件。

### 使用条款
- ✅ 商业使用
- ✅ 修改和分发
- ✅ 私人使用
- ✅ 包含许可证和版权声明

## 🆘 支持与帮助

### 获取帮助

1. **📖 查看文档**: 先查看本 README 和项目文档
2. **🔍 搜索 Issues**: 在 GitHub Issues 中搜索类似问题
3. **💬 提问交流**: 创建新的 Issue 描述问题
4. **📧 联系支持**: 发送邮件到 support@yourdomain.com

### 问题报告

提交 Issue 时请包含：
- 操作系统和浏览器版本
- Node.js 和 pnpm 版本
- 具体的错误信息和堆栈跟踪
- 复现步骤
- 相关的代码片段或截图

### 功能请求

我们欢迎功能建议！请在 Issue 中说明：
- 功能的具体描述
- 使用场景和价值
- 可能的实现方案
- 是否愿意贡献代码

---

## 🚀 开始你的小游戏网站之旅

这个模板为你提供了构建专业小游戏网站的所有基础设施。从游戏展示到用户体验，从SEO优化到性能监控，一切都已为你准备就绪。

**现在就开始构建你的下一个小游戏平台吧！** 🎮✨

---

<div align="center">
  <p>Made with ❤️ by the Game Website Template Team</p>
  <p>
    <a href="#-项目概述">回到顶部</a> •
    <a href="https://github.com/your-repo/issues">报告问题</a> •
    <a href="https://github.com/your-repo/discussions">讨论交流</a>
  </p>
</div>
