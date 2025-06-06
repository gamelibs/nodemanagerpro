'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Game } from '@/types/game';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Star, Play, Users } from 'lucide-react';

interface GameCardProps {
  game: Game;
  locale: string;
  onClick?: () => void;
  className?: string;
}

export function GameCard({ game, locale, onClick, className = '' }: GameCardProps) {
  const t = useTranslations('common');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const title = typeof game.title === 'string' 
    ? game.title 
    : game.title[locale as keyof typeof game.title] || game.title['zh-CN'] || Object.values(game.title)[0];
  const description = typeof game.description === 'string' 
    ? game.description 
    : game.description[locale as keyof typeof game.description] || game.description['zh-CN'] || Object.values(game.description)[0];

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (game.gameUrl) {
      window.open(game.gameUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'puzzle': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400';
      case 'action': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'arcade': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'casual': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatPlayCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div 
      className={`group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {/* 游戏缩略图 */}
      <div className="relative aspect-video overflow-hidden">
        {!imageError ? (
          <Image
            src={game.thumbnail}
            alt={title}
            fill
            className={`object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <div className="text-gray-400 text-4xl">🎮</div>
          </div>
        )}
        
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
        )}

        {/* 精品标识 */}
        {game.featured && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm">
              ⭐ {t('featured')}
            </Badge>
          </div>
        )}

        {/* 难度标识 */}
        {game.difficulty && (
          <div className="absolute top-2 right-2">
            <Badge className={getDifficultyColor(game.difficulty)}>
              {t(`difficulty.${game.difficulty}`)}
            </Badge>
          </div>
        )}

        {/* 播放按钮覆盖层 */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <Button
            size="lg"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary hover:bg-primary/90"
            onClick={handlePlayClick}
          >
            <Play className="w-5 h-5 mr-2" />
            {t('play')}
          </Button>
        </div>
      </div>

      {/* 游戏信息 */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <Badge className={getCategoryColor(game.category)}>
            {t(`categories.${game.category}`)}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {description}
        </p>

        {/* 游戏统计 */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Star className="w-3 h-3 mr-1 text-yellow-500" />
              <span>{game.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              <span>{formatPlayCount(game.playCount)}</span>
            </div>
          </div>
          
          <Button 
            size="sm" 
            variant="ghost"
            className="h-8 px-3 hover:bg-primary/10 hover:text-primary"
            onClick={handlePlayClick}
          >
            <Play className="w-3 h-3 mr-1" />
            {t('play')}
          </Button>
        </div>

        {/* 标签 */}
        {game.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {game.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs px-2 py-1"
              >
                {tag}
              </Badge>
            ))}
            {game.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-1">
                +{game.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
