import { GameCategory } from '@/types/game'

// 游戏分类数据
export const categories: GameCategory[] = [
  {
    id: 'action',
    name: '动作游戏',
    slug: 'action',
    description: '快节奏的动作游戏，考验你的反应速度和操作技巧',
    icon: '⚡',
    color: '#ef4444', // red-500
    gameCount: 15,
    isPopular: true,
  },
  {
    id: 'puzzle',
    name: '益智游戏',
    slug: 'puzzle',
    description: '锻炼大脑的益智游戏，提升逻辑思维和解决问题的能力',
    icon: '🧩',
    color: '#3b82f6', // blue-500
    gameCount: 28,
    isPopular: true,
  },
  {
    id: 'adventure',
    name: '冒险游戏',
    slug: 'adventure',
    description: '探索未知世界的冒险游戏，体验精彩的故事情节',
    icon: '🗺️',
    color: '#10b981', // emerald-500
    gameCount: 12,
    isPopular: true,
  },
  {
    id: 'racing',
    name: '竞速游戏',
    slug: 'racing',
    description: '刺激的赛车竞速游戏，感受极速驾驶的快感',
    icon: '🏎️',
    color: '#f59e0b', // amber-500
    gameCount: 8,
    isPopular: false,
  },
  {
    id: 'strategy',
    name: '策略游戏',
    slug: 'strategy',
    description: '需要深度思考的策略游戏，考验你的战术规划能力',
    icon: '🎯',
    color: '#8b5cf6', // violet-500
    gameCount: 10,
    isPopular: true,
  },
  {
    id: 'arcade',
    name: '街机游戏',
    slug: 'arcade',
    description: '经典的街机风格游戏，重温童年的美好回忆',
    icon: '🕹️',
    color: '#ec4899', // pink-500
    gameCount: 18,
    isPopular: true,
  },
  {
    id: 'sports',
    name: '体育游戏',
    slug: 'sports',
    description: '各种体育运动游戏，在虚拟世界中挥洒汗水',
    icon: '⚽',
    color: '#06b6d4', // cyan-500
    gameCount: 14,
    isPopular: false,
  },
  {
    id: 'shooter',
    name: '射击游戏',
    slug: 'shooter',
    description: '紧张刺激的射击游戏，考验你的瞄准技巧和反应速度',
    icon: '🎯',
    color: '#dc2626', // red-600
    gameCount: 11,
    isPopular: true,
  },
  {
    id: 'simulation',
    name: '模拟游戏',
    slug: 'simulation',
    description: '真实的模拟体验游戏，感受不同职业和生活方式',
    icon: '🏗️',
    color: '#059669', // emerald-600
    gameCount: 7,
    isPopular: false,
  },
  {
    id: 'music',
    name: '音乐游戏',
    slug: 'music',
    description: '跟随音乐节拍的游戏，享受美妙的音乐和节奏',
    icon: '🎵',
    color: '#7c3aed', // violet-600
    gameCount: 6,
    isPopular: false,
  },
  {
    id: 'card',
    name: '卡牌游戏',
    slug: 'card',
    description: '经典的卡牌游戏，考验你的策略思维和运气',
    icon: '🃏',
    color: '#be123c', // rose-700
    gameCount: 9,
    isPopular: false,
  },
  {
    id: 'educational',
    name: '教育游戏',
    slug: 'educational',
    description: '寓教于乐的教育游戏，在游戏中学习知识',
    icon: '📚',
    color: '#0369a1', // sky-700
    gameCount: 5,
    isPopular: false,
  }
]

// 获取分类的辅助函数
export function getCategoryBySlug(slug: string): GameCategory | undefined {
  return categories.find(category => category.slug === slug)
}

export function getPopularCategories(): GameCategory[] {
  return categories.filter(category => category.isPopular)
}

export function getAllCategories(): GameCategory[] {
  return categories
}

export function getCategoriesByGameCount(): GameCategory[] {
  return [...categories].sort((a, b) => b.gameCount - a.gameCount)
}

// 分类统计信息
export const categoryStats = {
  totalCategories: categories.length,
  totalGames: categories.reduce((sum, category) => sum + category.gameCount, 0),
  popularCategories: categories.filter(category => category.isPopular).length,
  averageGamesPerCategory: Math.round(
    categories.reduce((sum, category) => sum + category.gameCount, 0) / categories.length
  ),
}

// 分类颜色映射
export const categoryColors: Record<string, string> = {
  action: '#ef4444',
  puzzle: '#3b82f6',
  adventure: '#10b981',
  racing: '#f59e0b',
  strategy: '#8b5cf6',
  arcade: '#ec4899',
  sports: '#06b6d4',
  shooter: '#dc2626',
  simulation: '#059669',
  music: '#7c3aed',
  card: '#be123c',
  educational: '#0369a1',
}

// 分类图标映射
export const categoryIcons: Record<string, string> = {
  action: '⚡',
  puzzle: '🧩',
  adventure: '🗺️',
  racing: '🏎️',
  strategy: '🎯',
  arcade: '🕹️',
  sports: '⚽',
  shooter: '🎯',
  simulation: '🏗️',
  music: '🎵',
  card: '🃏',
  educational: '📚',
}
