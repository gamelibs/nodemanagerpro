'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { GameCategory } from '@/types/game';
import { Badge } from '@/components/ui/Badge';

interface CategoryFilterProps {
  categories: GameCategory[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  className = ''
}: CategoryFilterProps) {
  const t = useTranslations('common');
  const tCategories = useTranslations('categories');

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className="transition-all duration-200 hover:scale-105"
        >
          <Badge
            variant={selectedCategory === category.id ? 'primary' : 'secondary'}
            size="lg"
            className="cursor-pointer"
          >
            {category.id === 'all' ? t('all') : tCategories(category.id)}
          </Badge>
        </button>
      ))}
    </div>
  );
}
