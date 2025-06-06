import { SiteConfig, LocaleConfig } from '@/types';

export const siteConfig: SiteConfig = {
  name: '小游戏大全',
  description: '精选优质小游戏，随时随地畅玩',
  url: 'https://your-game-site.com',
  ogImage: '/images/og-image.jpg',
  
  games: {
    defaultCategory: 'all',
    gamesPerPage: 12,
    featuredCount: 6,
    enableSearch: true,
    enableFilters: true,
  },
  
  seo: {
    keywords: ['小游戏', '在线游戏', '免费游戏', 'HTML5游戏', '休闲游戏'],
    author: '游戏网站',
    twitterHandle: '@yourgamesite',
  },
  
  social: {
    twitter: 'https://twitter.com/yourgamesite',
    facebook: 'https://facebook.com/yourgamesite',
    github: 'https://github.com/yourgamesite',
  }
};

export const localeConfig: LocaleConfig = {
  locales: ['zh-CN', 'en-US'],
  defaultLocale: 'zh-CN',
  localeLabels: {
    'zh-CN': '中文',
    'en-US': 'English',
  },
};

export const marketingConfig = {
  mainNav: [
    {
      title: '功能',
      href: '#features',
    },
    {
      title: '定价',
      href: '#pricing',
    },
    {
      title: '关于',
      href: '#about',
    },
    {
      title: '联系',
      href: '#contact',
    },
  ],
}

export const dashboardConfig = {
  mainNav: [
    {
      title: '仪表板',
      href: '/dashboard',
    },
    {
      title: '项目',
      href: '/dashboard/projects',
    },
    {
      title: '设置',
      href: '/dashboard/settings',
    },
  ],
  sidebarNav: [
    {
      title: '概览',
      href: '/dashboard',
      icon: 'dashboard',
    },
    {
      title: '项目',
      href: '/dashboard/projects',
      icon: 'folder',
    },
    {
      title: '团队',
      href: '/dashboard/team',
      icon: 'users',
    },
    {
      title: '设置',
      href: '/dashboard/settings',
      icon: 'settings',
    },
  ],
}

export const navigation = {
  main: [
    {
      href: '/',
      label: 'navigation.home',
    },
    {
      href: '/games',
      label: 'navigation.games',
    },
    {
      href: '/about',
      label: 'navigation.about',
    },
    {
      href: '/contact',
      label: 'navigation.contact',
    },
  ],
  footer: [
    {
      href: '/about',
      label: 'navigation.about',
    },
    {
      href: '/privacy',
      label: 'navigation.privacy',
    },
    {
      href: '/terms',
      label: 'navigation.terms',
    },
    {
      href: '/contact',
      label: 'navigation.contact',
    },
  ],
};

export const gameCategories = [
  'all',
  'puzzle',
  'action',
  'arcade',
  'casual',
];

export const gameDifficulties = [
  'easy',
  'medium',
  'hard',
];

export const gameColors = {
  all: 'gray',
  puzzle: 'teal',
  action: 'red',
  arcade: 'yellow',
  casual: 'green',
} as const;
