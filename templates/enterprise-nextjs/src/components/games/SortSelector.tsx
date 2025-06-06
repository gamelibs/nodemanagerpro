'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export type SortOption = 'popular' | 'latest' | 'rating' | 'name';

interface SortSelectorProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  className?: string;
}

export function SortSelector({
  currentSort,
  onSortChange,
  className = ''
}: SortSelectorProps) {
  const t = useTranslations('games');
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'popular', label: t('sortOptions.popular') },
    { value: 'latest', label: t('sortOptions.latest') },
    { value: 'rating', label: t('sortOptions.rating') },
    { value: 'name', label: t('sortOptions.name') }
  ];

  const currentOption = sortOptions.find(opt => opt.value === currentSort);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 
                   bg-white dark:bg-gray-800 
                   border border-gray-300 dark:border-gray-600 
                   rounded-lg shadow-sm
                   hover:bg-gray-50 dark:hover:bg-gray-700
                   focus:ring-2 focus:ring-teal-500 focus:border-transparent
                   text-gray-900 dark:text-white
                   transition-all duration-200"
      >
        <span className="text-sm font-medium">{t('sortBy')}:</span>
        <span className="text-sm">{currentOption?.label}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 
                         bg-white dark:bg-gray-800 
                         border border-gray-200 dark:border-gray-700 
                         rounded-lg shadow-lg z-20">
            <div className="py-1">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm
                             hover:bg-gray-100 dark:hover:bg-gray-700
                             transition-colors duration-200 ${
                               currentSort === option.value
                                 ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                                 : 'text-gray-900 dark:text-white'
                             }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
