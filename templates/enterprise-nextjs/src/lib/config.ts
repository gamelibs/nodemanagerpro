export const siteConfig = {
  name: '{{PROJECT_NAME}}',
  description: '基于Next.js构建的现代化企业级Web应用',
  url: 'https://your-domain.com',
  ogImage: 'https://your-domain.com/og.jpg',
  links: {
    twitter: 'https://twitter.com/yourcompany',
    github: 'https://github.com/yourcompany/{{PROJECT_NAME}}',
    docs: 'https://docs.your-domain.com',
  },
}

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
