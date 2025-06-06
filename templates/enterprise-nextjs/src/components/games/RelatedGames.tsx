'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Game } from '@/types/game';
import { GameCard } from './GameCard';

interface RelatedGamesProps {
  games: Game[];
  currentGameId: string;
  className?: string;
}

export function RelatedGames({ 
  games, 
  currentGameId, 
  className = '' 
}: RelatedGamesProps) {
  const t = useTranslations('gameDetail');
  const locale = useLocale();
  
  // Filter out current game and limit to 4 related games
  const relatedGames = games
    .filter(game => game.id !== currentGameId)
    .slice(0, 4);

  if (relatedGames.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        {t('relatedGames')}
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedGames.map((game) => (
          <GameCard 
            key={game.id} 
            game={game}
            locale={locale}
          />
        ))}
      </div>
    </div>
  );
}
