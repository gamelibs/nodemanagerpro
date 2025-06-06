'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div
      className={cn(
        'loading-spinner',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="加载中"
    >
      <span className="sr-only">加载中...</span>
    </div>
  )
}

interface LoadingDotsProps {
  className?: string
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn('loading-dots', className)}>
      <div />
      <div />
      <div />
    </div>
  )
}

interface LoadingSkeletonProps {
  className?: string
  children?: React.ReactNode
}

export function LoadingSkeleton({ className, children }: LoadingSkeletonProps) {
  return (
    <div className={cn('loading-skeleton', className)}>
      {children}
    </div>
  )
}

interface GameCardSkeletonProps {
  count?: number
}

export function GameCardSkeleton({ count = 1 }: GameCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4">
          <LoadingSkeleton className="aspect-video w-full mb-4 rounded-lg" />
          <LoadingSkeleton className="h-4 w-3/4 mb-2" />
          <LoadingSkeleton className="h-3 w-full mb-2" />
          <LoadingSkeleton className="h-3 w-2/3" />
          <div className="flex items-center justify-between mt-4">
            <LoadingSkeleton className="h-3 w-16" />
            <LoadingSkeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  loadingText = '加载中...' 
}: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">{loadingText}</p>
          </div>
        </div>
      )}
    </div>
  )
}

interface GameLoadingProps {
  className?: string
}

export function GameLoading({ className }: GameLoadingProps) {
  return (
    <div className={cn('game-loading', className)}>
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          游戏加载中
        </h3>
        <p className="text-sm text-muted-foreground">
          请稍候，游戏正在准备中...
        </p>
      </div>
    </div>
  )
}

interface FullPageLoadingProps {
  message?: string
}

export function FullPageLoading({ message = '页面加载中...' }: FullPageLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-6" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          {message}
        </h2>
        <p className="text-muted-foreground">
          请稍候片刻
        </p>
      </div>
    </div>
  )
}
