const withNextIntl = require('next-intl/plugin')(
  // This is the default (also the `src` folder is supported out of the box)
  './src/i18n.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 性能优化
  compress: true,
  poweredByHeader: false,
  swcMinify: true,
  
  // 实验性功能
  experimental: {
    typedRoutes: true,
  },
  
  // 图片优化
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com', 'cdn.jsdelivr.net', 'www.google.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // SEO 优化
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
    ]
  },
  // 安全配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // 允许游戏 iframe
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/games/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL', // 游戏页面允许 iframe
          },
        ],
      },
    ]
  },
  // Bundle 分析
  ...(process.env.ANALYZE === 'true' ? { bundleAnalyzer: { enabled: true } } : {}),
}

module.exports = withNextIntl(nextConfig)
