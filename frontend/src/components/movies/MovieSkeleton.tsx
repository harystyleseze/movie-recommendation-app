import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MovieSkeletonProps {
  className?: string
}

export function MovieSkeleton({ className }: MovieSkeletonProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-0">
        <div className="animate-pulse">
          {/* Poster skeleton */}
          <div className="h-64 w-full bg-muted" />

          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            {/* Title skeleton */}
            <div className="h-5 bg-muted rounded w-3/4" />

            {/* Year and runtime skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-16" />
              <div className="h-4 bg-muted rounded w-1" />
              <div className="h-4 bg-muted rounded w-12" />
            </div>

            {/* Genres skeleton */}
            <div className="flex gap-1">
              <div className="h-5 bg-muted rounded w-16" />
              <div className="h-5 bg-muted rounded w-12" />
              <div className="h-5 bg-muted rounded w-20" />
            </div>

            {/* Plot skeleton */}
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function MovieGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <MovieSkeleton key={i} />
      ))}
    </div>
  )
}