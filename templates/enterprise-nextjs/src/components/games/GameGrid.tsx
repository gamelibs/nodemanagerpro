'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Game } from '@/types/game';
import { GameCard } from './GameCard';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

interface GameGridProps {
  games: Game[];
  locale: string;
  className?: string;
  showLoadMore?: boolean;
  initialDisplayCount?: number;
  onGameClick?: (game: Game) => void;
}

export function GameGrid({ 
  games, 
  locale, 
  className = '',
  showLoadMore = true,
  initialDisplayCount = 12,
  onGameClick
}: GameGridProps) {
  const router = useRouter();
  const t = useTranslations('games');
  const [displayCount, setDisplayCount] = useState(initialDisplayCount);

  const displayedGames = useMemo(() => {
    return games.slice(0, displayCount);
  }, [games, displayCount]);

  const hasMoreGames = games.length > displayCount;

  const handleGameClick = (game: Game) => {
    if (onGameClick) {
      onGameClick(game);
    } else {
      router.push(`/${locale}/games/${game.slug}`);
    }
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + initialDisplayCount, games.length));
  };

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎮</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t('noResults')}
        </h3>
        <p className="text-muted-foreground">
          {t('noResultsDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* 游戏网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            locale={locale}
            onClick={() => handleGameClick(game)}
          />
        ))}
      </div>

      {/* 加载更多按钮 */}
      {showLoadMore && hasMoreGames && (
        <div className="text-center mt-12">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            size="lg"
            className="px-8"
          >
            {t('loadMore')} ({games.length - displayCount} {t('remaining')})
          </Button>
        </div>
      )}

      {/* 游戏统计信息 */}
      <div className="text-center mt-8 text-sm text-muted-foreground">
        {t('showingGames', { 
          current: displayedGames.length, 
          total: games.length 
        })}
      </div>
    </div>
  );
}
