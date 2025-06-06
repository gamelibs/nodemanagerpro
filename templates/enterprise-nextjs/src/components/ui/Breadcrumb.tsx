'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  title: string
  href?: string
  isCurrentPage?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  showHome?: boolean
  separator?: React.ReactNode
}

export function Breadcrumb({ 
  items, 
  className,
  showHome = true,
  separator = <ChevronRight className="w-4 h-4 text-muted-foreground" />
}: BreadcrumbProps) {
  const allItems = showHome 
    ? [{ title: '首页', href: '/' }, ...items]
    : items

  return (
    <nav 
      aria-label="面包屑导航" 
      className={cn('flex items-center space-x-1 text-sm', className)}
    >
      <ol className="flex items-center space-x-1">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1
          const isHome = showHome && index === 0

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2" aria-hidden="true">
                  {separator}
                </span>
              )}
              
              {item.href && !isLast ? (
                <Link
                  href={item.href as any}
                  className={cn(
                    'hover:text-foreground transition-colors',
                    isHome ? 'text-muted-foreground hover:text-primary' : 'text-muted-foreground'
                  )}
                >
                  <span className="flex items-center gap-1">
                    {isHome && <Home className="w-4 h-4" />}
                    {item.title}
                  </span>
                </Link>
              ) : (
                <span 
                  className={cn(
                    'flex items-center gap-1',
                    isLast 
                      ? 'text-foreground font-medium' 
                      : 'text-muted-foreground'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {isHome && <Home className="w-4 h-4" />}
                  {item.title}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// 游戏详情页面包屑
interface GameBreadcrumbProps {
  gameTitle: string
  categoryName?: string
  categorySlug?: string
  className?: string
}

export function GameBreadcrumb({ 
  gameTitle, 
  categoryName, 
  categorySlug,
  className 
}: GameBreadcrumbProps) {
  const items: BreadcrumbItem[] = [
    { title: '游戏', href: '/games' }
  ]

  if (categoryName && categorySlug) {
    items.push({
      title: categoryName,
      href: `/categories/${categorySlug}`
    })
  }

  items.push({
    title: gameTitle,
    isCurrentPage: true
  })

  return <Breadcrumb items={items} className={className} />
}

// 分类页面包屑
interface CategoryBreadcrumbProps {
  categoryName: string
  className?: string
}

export function CategoryBreadcrumb({ categoryName, className }: CategoryBreadcrumbProps) {
  const items: BreadcrumbItem[] = [
    { title: '游戏分类', href: '/categories' },
    { title: categoryName, isCurrentPage: true }
  ]

  return <Breadcrumb items={items} className={className} />
}

// 通用页面面包屑
interface PageBreadcrumbProps {
  title: string
  parent?: {
    title: string
    href: string
  }
  className?: string
}

export function PageBreadcrumb({ title, parent, className }: PageBreadcrumbProps) {
  const items: BreadcrumbItem[] = []

  if (parent) {
    items.push(parent)
  }

  items.push({
    title,
    isCurrentPage: true
  })

  return <Breadcrumb items={items} className={className} />
}
