// 游戏接口定义
export interface Game {
  id: string
  title: string | Record<string, string>
  slug: string
  description: string | Record<string, string>
  thumbnail: string
  category: string
  tags: string[]
  rating: number
  ratingCount: number
  playCount: number
  isFeatured: boolean
  isHot: boolean
  gameUrl: string
  difficulty?: 'easy' | 'medium' | 'hard'
  featured?: boolean // 兼容性字段
  reviewCount?: number // 兼容性字段
  createdAt?: string // 兼容性字段
  publishedAt: string
  updatedAt: string
}

// 游戏分类接口定义
export interface GameCategory {
  id: string
  name: string | Record<string, string>
  slug: string
  description: string | Record<string, string>
  icon: string
  color: string
  gameCount: number
  isPopular: boolean
}

// 游戏搜索和过滤参数
export interface GameSearchParams {
  query?: string
  category?: string
  tags?: string[]
  sortBy?: 'popular' | 'latest' | 'rating' | 'name'
  page?: number
  limit?: number
}

// 游戏过滤器
export interface GameFilter {
  category?: string
  categories?: string[]
  tags?: string[]
  minRating?: number
  isFeatured?: boolean
  isHot?: boolean
  search?: string
  difficulty?: string[]
  featured?: boolean // 兼容性字段
}

export interface GameListProps {
  games: Game[];
  categories: GameCategory[];
  currentCategory?: string;
  searchQuery?: string;
  onCategoryChange?: (category: string) => void;
  onSearchChange?: (query: string) => void;
}

export interface GameCardProps {
  game: Game;
  locale: string;
  onClick?: () => void;
}

// 游戏统计信息
export interface GameStats {
  totalPlays: number
  averageRating: number
  totalRatings: number
  lastPlayed?: string
}

// 游戏加载状态
export type GameLoadingState = 'idle' | 'loading' | 'loaded' | 'error'

// 游戏错误类型
export interface GameError {
  type: 'network' | 'timeout' | 'blocked' | 'unknown'
  message: string
  code?: string
}

// 排序选项
export type SortOption = {
  value: 'popular' | 'latest' | 'rating' | 'name'
  label: string
  order: 'asc' | 'desc'
}

// API 响应类型
export interface GameListResponse {
  games: Game[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface CategoryListResponse {
  categories: GameCategory[]
  total: number
}

// 语言配置
export interface LocaleConfig {
  locale: 'zh' | 'en'
  direction: 'ltr' | 'rtl'
  dateFormat: string
  numberFormat: string
}
