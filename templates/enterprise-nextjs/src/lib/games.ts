import { Game, GameCategory, GameFilter } from '@/types/game';
import gamesData from '@/data/games.json';
import categoriesData from '@/data/categories.json';

export const games: Game[] = gamesData.games as Game[];
export const categories: GameCategory[] = categoriesData.categories as GameCategory[];

/**
 * 获取所有游戏
 */
export function getAllGames(): Game[] {
  return games;
}

/**
 * 获取所有分类
 */
export function getAllCategories(): GameCategory[] {
  return categories;
}

/**
 * 根据slug获取单个游戏
 */
export function getGameBySlug(slug: string): Game | undefined {
  return games.find(game => game.slug === slug);
}

/**
 * 根据ID获取单个游戏
 */
export function getGameById(id: string): Game | undefined {
  return games.find(game => game.id === id);
}

/**
 * 获取分类信息
 */
export function getCategoryById(id: string): GameCategory | undefined {
  return categories.find(category => category.id === id);
}

/**
 * 获取精品推荐游戏
 */
export function getFeaturedGames(count: number = 6): Game[] {
  return games
    .filter(game => game.featured)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, count);
}

/**
 * 根据分类筛选游戏
 */
export function getGamesByCategory(categoryId: string): Game[] {
  if (categoryId === 'all') {
    return games;
  }
  return games.filter(game => game.category === categoryId);
}

/**
 * 搜索游戏
 */
export function searchGames(query: string, locale: string = 'zh-CN'): Game[] {
  if (!query.trim()) {
    return games;
  }

  const searchTerm = query.toLowerCase();
  return games.filter(game => {
    const getLocalizedText = (text: string | Record<string, string>): string => {
      if (typeof text === 'string') return text;
      return text[locale] || text['zh-CN'] || text['en-US'] || '';
    };

    const title = getLocalizedText(game.title).toLowerCase();
    const description = getLocalizedText(game.description).toLowerCase();
    const tags = game.tags.join(' ').toLowerCase();
    
    return title.includes(searchTerm) || 
           description.includes(searchTerm) || 
           tags.includes(searchTerm);
  });
}

/**
 * 高级筛选游戏
 */
export function filterGames(filter: GameFilter, locale: string = 'zh-CN'): Game[] {
  let filteredGames = games;

  // 分类筛选
  if (filter.category && filter.category !== 'all') {
    filteredGames = filteredGames.filter(game => game.category === filter.category);
  }

  // 难度筛选
  if (filter.difficulty && filter.difficulty.length > 0) {
    filteredGames = filteredGames.filter(game => 
      game.difficulty && filter.difficulty!.includes(game.difficulty)
    );
  }

  // 精品筛选
  if (filter.featured !== undefined) {
    filteredGames = filteredGames.filter(game => 
      (game.featured || game.isFeatured) === filter.featured
    );
  }

  // 标签筛选
  if (filter.tags && filter.tags.length > 0) {
    filteredGames = filteredGames.filter(game => 
      filter.tags!.some(tag => game.tags.includes(tag))
    );
  }

  // 搜索筛选
  if (filter.search) {
    const searchTerm = filter.search.toLowerCase();
    filteredGames = filteredGames.filter(game => {
      const getLocalizedText = (text: string | Record<string, string>): string => {
        if (typeof text === 'string') return text;
        return text[locale] || text['zh-CN'] || text['en-US'] || '';
      };

      const title = getLocalizedText(game.title).toLowerCase();
      const description = getLocalizedText(game.description).toLowerCase();
      const tags = game.tags.join(' ').toLowerCase();
      
      return title.includes(searchTerm) || 
             description.includes(searchTerm) || 
             tags.includes(searchTerm);
    });
  }

  return filteredGames;
}

/**
 * 获取相关游戏推荐
 */
export function getRelatedGames(gameId: string, count: number = 4): Game[] {
  const currentGame = getGameById(gameId);
  if (!currentGame) return [];

  // 基于分类和标签的相似度计算
  const relatedGames = games
    .filter(game => game.id !== gameId)
    .map(game => {
      let score = 0;
      
      // 同分类加分
      if (game.category === currentGame.category) {
        score += 3;
      }
      
      // 共同标签加分
      const commonTags = game.tags.filter(tag => currentGame.tags.includes(tag));
      score += commonTags.length;
      
      // 相似难度加分
      if (game.difficulty && currentGame.difficulty && game.difficulty === currentGame.difficulty) {
        score += 1;
      }
      
      return { game, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(item => item.game);

  return relatedGames;
}

/**
 * 获取热门游戏
 */
export function getPopularGames(count: number = 8): Game[] {
  return games
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, count);
}

/**
 * 获取最新游戏
 */
export function getLatestGames(count: number = 8): Game[] {
  return games
    .sort((a, b) => {
      const dateA = a.createdAt || a.publishedAt;
      const dateB = b.createdAt || b.publishedAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })
    .slice(0, count);
}

/**
 * 获取评分最高的游戏
 */
export function getTopRatedGames(count: number = 8): Game[] {
  return games
    .filter(game => (game.reviewCount || game.ratingCount) > 10) // 至少有10个评价
    .sort((a, b) => b.rating - a.rating)
    .slice(0, count);
}

/**
 * 获取游戏统计信息
 */
export function getGameStats() {
  const totalGames = games.length;
  const categoriesCount = categories.filter(cat => cat.id !== 'all').length;
  const totalPlays = games.reduce((sum, game) => sum + game.playCount, 0);
  const averageRating = games.reduce((sum, game) => sum + game.rating, 0) / totalGames;
  
  const categoryStats = categories
    .filter(cat => cat.id !== 'all')
    .map(category => ({
      id: category.id,
      name: category.name,
      count: games.filter(game => game.category === category.id).length
    }));

  return {
    totalGames,
    categoriesCount,
    totalPlays,
    averageRating: Math.round(averageRating * 10) / 10,
    categoryStats
  };
}

/**
 * 验证游戏URL的安全性
 */
export function isValidGameUrl(url: string): boolean {
  try {
    const gameUrl = new URL(url);
    
    // 只允许https协议
    if (gameUrl.protocol !== 'https:') {
      return false;
    }
    
    // 可以添加域名白名单检查
    const allowedDomains = [
      'example.com',
      'trusted-games.com',
      'secure-games.net'
    ];
    
    // 这里可以根据需要添加域名验证逻辑
    // return allowedDomains.some(domain => gameUrl.hostname.endsWith(domain));
    
    return true;
  } catch {
    return false;
  }
}

// 按分类过滤游戏（兼容性函数）
export function filterGamesByCategory(games: Game[], categoryId: string): Game[] {
  return getGamesByCategory(categoryId);
}

// 排序游戏
export function sortGames(games: Game[], sortBy: string): Game[] {
  const gamesCopy = [...games];
  
  switch (sortBy) {
    case 'popular':
      return gamesCopy.sort((a, b) => b.playCount - a.playCount);
    case 'rating':
      return gamesCopy.sort((a, b) => b.rating - a.rating);
    case 'latest':
      return gamesCopy.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    case 'name':
      return gamesCopy.sort((a, b) => {
        const titleA = typeof a.title === 'string' ? a.title : a.title['zh-CN'] || a.title['en-US'];
        const titleB = typeof b.title === 'string' ? b.title : b.title['zh-CN'] || b.title['en-US'];
        return titleA.localeCompare(titleB);
      });
    default:
      return gamesCopy;
  }
}
