import { Game, GameCategory } from '@/types/game'

export interface StructuredDataProps {
  type: 'Game' | 'WebSite' | 'Organization' | 'BreadcrumbList'
  data: any
}

export function generateGameStructuredData(game: Game): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Game',
    name: game.title,
    description: game.description,
    image: game.thumbnail,
    url: `/games/${game.slug}`,
    genre: game.category,
    gamePlatform: ['Web Browser', 'HTML5'],
    operatingSystem: ['Any'],
    applicationCategory: 'Game',
    isAccessibleForFree: true,
    inLanguage: ['zh-CN', 'en-US'],
    datePublished: game.publishedAt || new Date().toISOString(),
    publisher: {
      '@type': 'Organization',
      name: '游戏天地',
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
    aggregateRating: game.rating ? {
      '@type': 'AggregateRating',
      ratingValue: game.rating,
      ratingCount: game.ratingCount || 1,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
      availability: 'https://schema.org/InStock',
    },
  }
}

export function generateWebSiteStructuredData(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '游戏天地 - GameLand',
    description: '免费在线游戏平台，提供各种类型的HTML5游戏',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL}/games?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: '游戏天地',
      url: process.env.NEXT_PUBLIC_SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`,
        width: 512,
        height: 512,
      },
      sameAs: [
        'https://twitter.com/gameland',
        'https://facebook.com/gameland',
        'https://instagram.com/gameland',
      ],
    },
  }
}

export function generateOrganizationStructuredData(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '游戏天地',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`,
      width: 512,
      height: 512,
    },
    description: '专业的在线游戏平台，为用户提供高质量的免费HTML5游戏体验',
    foundingDate: '2024',
    founder: {
      '@type': 'Person',
      name: 'GameLand Team',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@gameland.com',
      availableLanguage: ['Chinese', 'English'],
    },
    sameAs: [
      'https://twitter.com/gameland',
      'https://facebook.com/gameland',
      'https://instagram.com/gameland',
    ],
  }
}

export function generateBreadcrumbStructuredData(items: Array<{
  name: string
  url: string
}>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${process.env.NEXT_PUBLIC_SITE_URL}${item.url}`,
    })),
  }
}

export function generateGameCategoryStructuredData(
  category: GameCategory,
  games: Game[]
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name}游戏`,
    description: category.description,
    url: `/categories/${category.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: games.length,
      itemListElement: games.map((game, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Game',
          name: game.title,
          url: `/games/${game.slug}`,
          image: game.thumbnail,
          description: game.description,
        },
      })),
    },
  }
}

// 组件：结构化数据脚本
export function StructuredData({ type, data }: StructuredDataProps) {
  let structuredData: object

  switch (type) {
    case 'Game':
      structuredData = generateGameStructuredData(data)
      break
    case 'WebSite':
      structuredData = generateWebSiteStructuredData()
      break
    case 'Organization':
      structuredData = generateOrganizationStructuredData()
      break
    case 'BreadcrumbList':
      structuredData = generateBreadcrumbStructuredData(data)
      break
    default:
      structuredData = data
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  )
}
