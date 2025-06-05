/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // 国际化配置
  i18n: {
    locales: ['zh-CN', 'en-US', 'ja-JP'],
    defaultLocale: 'zh-CN',
    localeDetection: true,
  },
  // 性能优化
  compress: true,
  poweredByHeader: false,
  // 安全配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  // Bundle 分析
  ...(process.env.ANALYZE === 'true' ? { bundleAnalyzer: { enabled: true } } : {}),
}

module.exports = nextConfig
