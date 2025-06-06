import { Metadata } from 'next';
import { siteConfig } from './config';
import { Game, GameCategory } from '@/types/game';

interface MetadataParams {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  canonical?: string;
  locale?: string;
}

/**
 * 生成基础元数据
 */
export function generateMetadata(params: MetadataParams = {}): Metadata {
  const {
    title = siteConfig.name,
    description = siteConfig.description,
    keywords = siteConfig.seo.keywords,
    image = siteConfig.ogImage,
    canonical,
    locale = 'zh-CN'
  } = params;

  const fullTitle = title === siteConfig.name ? title : `${title} - ${siteConfig.name}`;
  const imageUrl = image.startsWith('http') ? image : `${siteConfig.url}${image}`;
  const canonicalUrl = canonical ? `${siteConfig.url}${canonical}` : siteConfig.url;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: siteConfig.seo.author }],
    creator: siteConfig.seo.author,
    publisher: siteConfig.seo.author,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale,
      url: canonicalUrl,
      title: fullTitle,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: siteConfig.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: siteConfig.seo.twitterHandle,
      site: siteConfig.seo.twitterHandle,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'zh-CN': `${siteConfig.url}/zh-CN`,
        'en-US': `${siteConfig.url}/en-US`,
      },
    },
    other: {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
    },
  };
}

/**
 * 为游戏页面生成元数据
 */
export function generateGameMetadata(game: Game, locale: string = 'zh-CN'): Metadata {
  const title = typeof game.title === 'string' 
    ? game.title 
    : game.title[locale as keyof typeof game.title] || game.title['zh'] || Object.values(game.title)[0];
  const description = typeof game.description === 'string' 
    ? game.description 
    : game.description[locale as keyof typeof game.description] || game.description['zh'] || Object.values(game.description)[0];
  const keywords = [
    ...game.tags,
    '小游戏',
    '在线游戏',
    '免费游戏',
    game.category === 'puzzle' ? '益智游戏' : '',
    game.category === 'action' ? '动作游戏' : '',
    game.category === 'arcade' ? '街机游戏' : '',
    game.category === 'casual' ? '休闲游戏' : '',
  ].filter(Boolean) as string[];

  return generateMetadata({
    title,
    description,
    keywords,
    image: game.thumbnail,
    canonical: `/${locale}/games/${game.slug}`,
    locale,
  });
}

/**
 * 为游戏分类页面生成元数据
 */
export function generateCategoryMetadata(
  category: GameCategory, 
  locale: string = 'zh-CN'
): Metadata {
  const title = typeof category.name === 'string' 
    ? category.name 
    : category.name[locale as keyof typeof category.name] || category.name['zh'] || Object.values(category.name)[0];
  const description = typeof category.description === 'string' 
    ? category.description 
    : category.description[locale as keyof typeof category.description] || category.description['zh'] || Object.values(category.description)[0];
  const keywords = [
    title,
    '小游戏',
    '在线游戏',
    '免费游戏',
    category.id === 'puzzle' ? '益智游戏' : '',
    category.id === 'action' ? '动作游戏' : '',
    category.id === 'arcade' ? '街机游戏' : '',
    category.id === 'casual' ? '休闲游戏' : '',
  ].filter(Boolean) as string[];

  return generateMetadata({
    title,
    description,
    keywords,
    canonical: `/${locale}/games/${category.id}`,
    locale,
  });
}

/**
 * 为游戏列表页面生成元数据
 */
export function generateGamesListMetadata(locale: string = 'zh-CN'): Metadata {
  const titles = {
    'zh-CN': '游戏大全',
    'en-US': 'All Games'
  };
  
  const descriptions = {
    'zh-CN': '浏览我们精选的小游戏合集，包含益智、动作、街机、休闲等各类游戏',
    'en-US': 'Browse our curated collection of mini games, including puzzle, action, arcade, and casual games'
  };

  return generateMetadata({
    title: titles[locale as keyof typeof titles],
    description: descriptions[locale as keyof typeof descriptions],
    canonical: `/${locale}/games`,
    locale,
  });
}

/**
 * 生成结构化数据 (JSON-LD)
 */
export function generateGameStructuredData(game: Game, locale: string = 'zh-CN') {
  const title = typeof game.title === 'string' 
    ? game.title 
    : game.title[locale as keyof typeof game.title] || game.title['zh'] || Object.values(game.title)[0];
  const description = typeof game.description === 'string' 
    ? game.description 
    : game.description[locale as keyof typeof game.description] || game.description['zh'] || Object.values(game.description)[0];

  return {
    '@context': 'https://schema.org',
    '@type': 'Game',
    name: title,
    description,
    image: game.thumbnail.startsWith('http') ? game.thumbnail : `${siteConfig.url}${game.thumbnail}`,
    genre: game.category,
    playMode: 'SinglePlayer',
    applicationCategory: 'Game',
    operatingSystem: 'Web Browser',
    url: `${siteConfig.url}/${locale}/games/${game.slug}`,
    dateCreated: game.createdAt,
    dateModified: game.updatedAt,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: game.rating,
      bestRating: 5,
      worstRating: 1,
      ratingCount: game.reviewCount || game.ratingCount,
    },
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/PlayAction',
      userInteractionCount: game.playCount,
    },
    keywords: game.tags.join(', '),
    creator: {
      '@type': 'Organization',
      name: siteConfig.seo.author,
      url: siteConfig.url,
    },
  };
}

/**
 * 生成游戏分类的结构化数据
 */
export function generateCategoryStructuredData(category: GameCategory, gamesCount: number, locale: string = 'zh-CN') {
  const title = typeof category.name === 'string' 
    ? category.name 
    : category.name[locale as keyof typeof category.name] || category.name['zh'] || Object.values(category.name)[0];
  const description = typeof category.description === 'string' 
    ? category.description 
    : category.description[locale as keyof typeof category.description] || category.description['zh'] || Object.values(category.description)[0];

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: `${siteConfig.url}/${locale}/games/${category.id}`,
    mainEntity: {
      '@type': 'ItemList',
      name: title,
      description,
      numberOfItems: gamesCount,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '首页',
          item: `${siteConfig.url}/${locale}`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: '游戏',
          item: `${siteConfig.url}/${locale}/games`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: title,
          item: `${siteConfig.url}/${locale}/games/${category.id}`,
        },
      ],
    },
  };
}

/**
 * 生成网站整体的结构化数据
 */
export function generateWebsiteStructuredData(locale: string = 'zh-CN') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/${locale}/games?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.seo.author,
      url: siteConfig.url,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/icon.svg`,
      },
    },
    sameAs: Object.values(siteConfig.social).filter(Boolean),
  };
}

// 为向后兼容性添加别名
export const generateGameDetailMetadata = generateGameMetadata;
