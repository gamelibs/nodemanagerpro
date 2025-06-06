import { Metadata } from 'next'

export interface SEOProps {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'game'
  locale?: string
}

export function generateSEO({
  title,
  description,
  keywords = [],
  image = '/images/og-default.jpg',
  url = '',
  type = 'website',
  locale = 'zh-CN'
}: SEOProps): Metadata {
  const siteName = '游戏天地 - GameLand'
  const fullTitle = title === siteName ? title : `${title} | ${siteName}`
  
  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: 'GameLand Team' }],
    creator: 'GameLand',
    publisher: 'GameLand',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://gameland.com'),
    alternates: {
      canonical: url,
      languages: {
        'zh-CN': url,
        'en-US': url.replace('/zh/', '/en/'),
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale,
      type: type as any,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@GameLand',
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
    },
  }
}

export function generateGameSEO({
  title,
  description,
  category,
  tags = [],
  thumbnail,
  slug,
  locale = 'zh-CN'
}: {
  title: string
  description: string
  category: string
  tags?: string[]
  thumbnail?: string
  slug: string
  locale?: string
}): Metadata {
  const keywords = [
    '在线游戏',
    '免费游戏',
    '网页游戏',
    'HTML5游戏',
    category,
    ...tags
  ]
  
  return generateSEO({
    title,
    description,
    keywords,
    image: thumbnail,
    url: `/games/${slug}`,
    type: 'game',
    locale
  })
}

export function generateCategorySEO({
  category,
  description,
  locale = 'zh-CN'
}: {
  category: string
  description: string
  locale?: string
}): Metadata {
  const keywords = [
    '游戏分类',
    category,
    '在线游戏',
    '免费游戏',
    '网页游戏'
  ]
  
  return generateSEO({
    title: `${category}游戏`,
    description,
    keywords,
    url: `/categories/${category.toLowerCase()}`,
    locale
  })
}
