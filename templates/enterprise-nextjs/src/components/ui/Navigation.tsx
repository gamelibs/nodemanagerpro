'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface NavigationItem {
  key: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface NavigationProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
}

export function Navigation({ 
  className, 
  orientation = 'horizontal', 
  variant = 'default',
  size = 'md'
}: NavigationProps) {
  const pathname = usePathname();
  const t = useTranslations('navigation');
  
  const navigationItems: NavigationItem[] = [
    {
      key: 'home',
      href: '/',
    },
    {
      key: 'games',
      href: '/games',
    },
    {
      key: 'categories',
      href: '/categories',
    },
    {
      key: 'about',
      href: '/about',
    }
  ];

  const getItemClasses = (href: string) => {
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
    
    const baseClasses = cn(
      'relative inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      {
        'text-sm px-3 py-1.5': size === 'sm',
        'text-sm px-4 py-2': size === 'md', 
        'text-base px-6 py-3': size === 'lg',
      }
    );

    if (variant === 'default') {
      return cn(baseClasses, {
        'text-primary font-medium': isActive,
        'text-muted-foreground hover:text-foreground': !isActive,
      });
    }

    if (variant === 'pills') {
      return cn(baseClasses, 'rounded-full', {
        'bg-primary text-primary-foreground': isActive,
        'hover:bg-accent hover:text-accent-foreground': !isActive,
      });
    }

    if (variant === 'underline') {
      return cn(baseClasses, 'border-b-2 border-transparent', {
        'border-primary text-primary font-medium': isActive,
        'hover:border-muted-foreground hover:text-foreground': !isActive,
      });
    }

    return baseClasses;
  };

  return (
    <nav
      className={cn(
        'flex gap-1',
        {
          'flex-row': orientation === 'horizontal',
          'flex-col': orientation === 'vertical',
        },
        className
      )}
    >
      {navigationItems.map((item) => (
        <Link
          key={item.key}
          href={item.href as any}
          className={getItemClasses(item.href)}
        >
          {item.icon && (
            <span className="mr-2">{item.icon}</span>
          )}
          {t(item.key)}
          {item.badge && (
            <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
              {item.badge}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ReactNode;
}

export function Breadcrumb({ 
  items, 
  className, 
  separator = '/' 
}: BreadcrumbProps) {
  return (
    <nav className={cn('flex items-center space-x-1 text-sm', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-muted-foreground mx-2">{separator}</span>
          )}
          {item.href ? (
            <Link
              href={item.href as any}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <div className={className} data-tabs-value={value}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, { currentValue: value, onValueChange })
          : child
      )}
    </div>
  );
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ 
  value, 
  children, 
  className, 
  disabled,
  ...props 
}: TabsTriggerProps & { currentValue?: string; onValueChange?: (value: string) => void }) {
  const isActive = props.currentValue === value;
  
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isActive
          ? 'bg-background text-foreground shadow-sm'
          : 'hover:bg-background/50 hover:text-foreground',
        className
      )}
      onClick={() => props.onValueChange?.(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ 
  value, 
  children, 
  className,
  ...props 
}: TabsContentProps & { currentValue?: string }) {
  if (props.currentValue !== value) {
    return null;
  }
  
  return (
    <div
      className={cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      role="tabpanel"
    >
      {children}
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  className
}: PaginationProps) {
  const getVisiblePages = () => {
    const pages: number[] = [];
    const half = Math.floor(maxVisiblePages / 2);
    
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav className={cn('flex items-center justify-center space-x-1', className)}>
      {showFirstLast && currentPage > 1 && (
        <button
          onClick={() => onPageChange(1)}
          className="inline-flex items-center justify-center w-8 h-8 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors rounded-md"
          disabled={currentPage === 1}
        >
          ««
        </button>
      )}
      
      {showPrevNext && (
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="inline-flex items-center justify-center w-8 h-8 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors rounded-md"
          disabled={currentPage === 1}
        >
          ‹
        </button>
      )}
      
      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            'inline-flex items-center justify-center w-8 h-8 text-sm border transition-colors rounded-md',
            page === currentPage
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
          )}
        >
          {page}
        </button>
      ))}
      
      {showPrevNext && (
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="inline-flex items-center justify-center w-8 h-8 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors rounded-md"
          disabled={currentPage === totalPages}
        >
          ›
        </button>
      )}
      
      {showFirstLast && currentPage < totalPages && (
        <button
          onClick={() => onPageChange(totalPages)}
          className="inline-flex items-center justify-center w-8 h-8 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors rounded-md"
          disabled={currentPage === totalPages}
        >
          »»
        </button>
      )}
    </nav>
  );
}
