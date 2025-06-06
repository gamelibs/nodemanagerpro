import { Game } from '@/types/game'

// 示例游戏数据
export const games: Game[] = [
  {
    id: '1',
    title: '2048经典版',
    slug: '2048-classic',
    description: '经典的2048数字游戏，通过滑动合并相同数字，挑战你的逻辑思维能力。',
    thumbnail: '/images/games/2048-classic.jpg',
    category: 'puzzle',
    tags: ['数字', '逻辑', '休闲'],
    rating: 4.5,
    ratingCount: 1248,
    playCount: 15620,
    isFeatured: true,
    isHot: true,
    gameUrl: 'https://play2048.co/',
    publishedAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
  {
    id: '2',
    title: '贪吃蛇大作战',
    slug: 'snake-battle',
    description: '多人在线贪吃蛇游戏，与全球玩家一起竞技，成为最长的蛇！',
    thumbnail: '/images/games/snake-battle.jpg',
    category: 'action',
    tags: ['多人', '竞技', '实时'],
    rating: 4.3,
    ratingCount: 856,
    playCount: 12480,
    isFeatured: true,
    isHot: false,
    gameUrl: 'https://slither.io/',
    publishedAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z',
  },
  {
    id: '3',
    title: '俄罗斯方块',
    slug: 'tetris',
    description: '经典俄罗斯方块游戏，通过旋转和移动方块来消除完整的行。',
    thumbnail: '/images/games/tetris.jpg',
    category: 'puzzle',
    tags: ['经典', '方块', '消除'],
    rating: 4.7,
    ratingCount: 2156,
    playCount: 28940,
    isFeatured: true,
    isHot: true,
    gameUrl: 'https://tetris.com/play-tetris',
    publishedAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z',
  },
  {
    id: '4',
    title: '愤怒的小鸟',
    slug: 'angry-birds',
    description: '经典物理解谜游戏，用弹弓发射小鸟摧毁绿猪的堡垒。',
    thumbnail: '/images/games/angry-birds.jpg',
    category: 'puzzle',
    tags: ['物理', '射击', '策略'],
    rating: 4.4,
    ratingCount: 1876,
    playCount: 22350,
    isFeatured: false,
    isHot: true,
    gameUrl: 'https://chrome.angrybirds.com/',
    publishedAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-22T00:00:00Z',
  },
  {
    id: '5',
    title: '超级马里奥',
    slug: 'super-mario',
    description: '经典平台跳跃游戏，帮助马里奥穿越各种障碍拯救公主。',
    thumbnail: '/images/games/super-mario.jpg',
    category: 'adventure',
    tags: ['平台', '跳跃', '经典'],
    rating: 4.8,
    ratingCount: 3245,
    playCount: 45680,
    isFeatured: true,
    isHot: true,
    gameUrl: 'https://supermariobros.io/',
    publishedAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-30T00:00:00Z',
  },
  {
    id: '6',
    title: '切水果',
    slug: 'fruit-ninja',
    description: '经典切水果游戏，用手指滑动切开飞来的水果，避开炸弹。',
    thumbnail: '/images/games/fruit-ninja.jpg',
    category: 'arcade',
    tags: ['切割', '反应', '休闲'],
    rating: 4.2,
    ratingCount: 1456,
    playCount: 18920,
    isFeatured: false,
    isHot: false,
    gameUrl: 'https://www.addictinggames.com/funny/fruit-ninja',
    publishedAt: '2024-01-12T00:00:00Z',
    updatedAt: '2024-01-19T00:00:00Z',
  },
  {
    id: '7',
    title: '植物大战僵尸',
    slug: 'plants-vs-zombies',
    description: '经典塔防游戏，种植各种植物来抵御僵尸的入侵。',
    thumbnail: '/images/games/plants-vs-zombies.jpg',
    category: 'strategy',
    tags: ['塔防', '策略', '僵尸'],
    rating: 4.6,
    ratingCount: 2890,
    playCount: 35470,
    isFeatured: true,
    isHot: true,
    gameUrl: 'https://www.ea.com/games/plants-vs-zombies',
    publishedAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-28T00:00:00Z',
  },
  {
    id: '8',
    title: '消除糖果',
    slug: 'candy-crush',
    description: '甜蜜的三消游戏，通过交换糖果创造匹配来完成关卡挑战。',
    thumbnail: '/images/games/candy-crush.jpg',
    category: 'puzzle',
    tags: ['三消', '糖果', '关卡'],
    rating: 4.1,
    ratingCount: 1678,
    playCount: 21340,
    isFeatured: false,
    isHot: false,
    gameUrl: 'https://king.com/game/candycrushsaga',
    publishedAt: '2024-01-14T00:00:00Z',
    updatedAt: '2024-01-21T00:00:00Z',
  },
  {
    id: '9',
    title: '跑酷达人',
    slug: 'temple-run',
    description: '无尽跑酷游戏，在古老的神庙中狂奔，躲避各种障碍和追击。',
    thumbnail: '/images/games/temple-run.jpg',
    category: 'arcade',
    tags: ['跑酷', '无尽', '3D'],
    rating: 4.3,
    ratingCount: 2134,
    playCount: 27860,
    isFeatured: false,
    isHot: true,
    gameUrl: 'https://www.crazygames.com/game/temple-run-2',
    publishedAt: '2024-01-06T00:00:00Z',
    updatedAt: '2024-01-23T00:00:00Z',
  },
  {
    id: '10',
    title: '钢琴块',
    slug: 'piano-tiles',
    description: '音乐节奏游戏，跟随音乐节拍点击黑色钢琴键，不要错过任何一个。',
    thumbnail: '/images/games/piano-tiles.jpg',
    category: 'music',
    tags: ['音乐', '节奏', '反应'],
    rating: 4.4,
    ratingCount: 1923,
    playCount: 24570,
    isFeatured: false,
    isHot: false,
    gameUrl: 'https://www.agame.com/game/piano-tiles',
    publishedAt: '2024-01-09T00:00:00Z',
    updatedAt: '2024-01-26T00:00:00Z',
  },
  {
    id: '11',
    title: '赛车竞速',
    slug: 'racing-game',
    description: '刺激的3D赛车游戏，驾驶超级跑车在各种赛道上飞驰。',
    thumbnail: '/images/games/racing-game.jpg',
    category: 'racing',
    tags: ['赛车', '竞速', '3D'],
    rating: 4.5,
    ratingCount: 1567,
    playCount: 19840,
    isFeatured: false,
    isHot: true,
    gameUrl: 'https://www.crazygames.com/game/madalin-stunt-cars-2',
    publishedAt: '2024-01-11T00:00:00Z',
    updatedAt: '2024-01-24T00:00:00Z',
  },
  {
    id: '12',
    title: '麻将连连看',
    slug: 'mahjong-connect',
    description: '经典麻将连连看游戏，找出相同的麻将牌并将它们连接消除。',
    thumbnail: '/images/games/mahjong-connect.jpg',
    category: 'puzzle',
    tags: ['麻将', '连连看', '传统'],
    rating: 4.2,
    ratingCount: 1345,
    playCount: 16790,
    isFeatured: false,
    isHot: false,
    gameUrl: 'https://www.arkadium.com/games/mahjongg-dimensions/',
    publishedAt: '2024-01-13T00:00:00Z',
    updatedAt: '2024-01-27T00:00:00Z',
  }
]

// 获取游戏的辅助函数
export function getGameBySlug(slug: string): Game | undefined {
  return games.find(game => game.slug === slug)
}

export function getGamesByCategory(category: string, limit?: number): Game[] {
  const filtered = games.filter(game => game.category === category)
  return limit ? filtered.slice(0, limit) : filtered
}

export function getFeaturedGames(limit?: number): Game[] {
  const featured = games.filter(game => game.isFeatured)
  return limit ? featured.slice(0, limit) : featured
}

export function getHotGames(limit?: number): Game[] {
  const hot = games.filter(game => game.isHot)
  return limit ? hot.slice(0, limit) : hot
}

export function getPopularGames(limit?: number): Game[] {
  const sorted = [...games].sort((a, b) => b.playCount - a.playCount)
  return limit ? sorted.slice(0, limit) : sorted
}

export function getLatestGames(limit?: number): Game[] {
  const sorted = [...games].sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
  return limit ? sorted.slice(0, limit) : sorted
}

export function searchGames(query: string): Game[] {
  const lowercaseQuery = query.toLowerCase()
  return games.filter(game => {
    // 处理 title，可能是字符串或对象
    const title = typeof game.title === 'string' ? game.title : Object.values(game.title).join(' ')
    // 处理 description，可能是字符串或对象
    const description = typeof game.description === 'string' ? game.description : Object.values(game.description).join(' ')
    
    return title.toLowerCase().includes(lowercaseQuery) ||
           description.toLowerCase().includes(lowercaseQuery) ||
           game.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  })
}

export function getRelatedGames(gameId: string, limit: number = 4): Game[] {
  const currentGame = games.find(game => game.id === gameId)
  if (!currentGame) return []
  
  // 首先按分类查找相关游戏
  const sameCategory = games.filter(game => 
    game.id !== gameId && game.category === currentGame.category
  )
  
  // 如果同分类游戏不够，则添加其他热门游戏
  if (sameCategory.length < limit) {
    const otherGames = games.filter(game => 
      game.id !== gameId && 
      game.category !== currentGame.category &&
      game.isHot
    )
    return [...sameCategory, ...otherGames].slice(0, limit)
  }
  
  return sameCategory.slice(0, limit)
}
