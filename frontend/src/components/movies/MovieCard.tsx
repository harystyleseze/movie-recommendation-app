import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Movie } from '@/services/api'
import { Calendar, Star } from 'lucide-react'
import { FavoriteButton } from '@/components/favorites/FavoriteButton'
import { WatchlistButton } from '@/components/watchlists/WatchlistButton'

interface MovieCardProps {
  movie: Movie
  onClick?: () => void
  className?: string
  showUserActions?: boolean
}

export function MovieCard({ movie, onClick, className, showUserActions = true }: MovieCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105',
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          {movie.Poster && movie.Poster !== 'N/A' ? (
            <img
              src={movie.Poster}
              alt={`${movie.Title} poster`}
              className="h-64 w-full object-cover transition-transform duration-200 group-hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/placeholder-movie.svg'
              }}
            />
          ) : (
            <div className="h-64 w-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No poster available</span>
            </div>
          )}
          {movie.imdbRating && (
            <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{movie.imdbRating}</span>
            </div>
          )}

          {/* User Action Buttons */}
          {showUserActions && (
            <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <FavoriteButton movie={movie} size="sm" />
              <WatchlistButton movie={movie} size="sm" />
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">
            {movie.Title}
          </h3>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Calendar className="h-4 w-4" />
            <span>{movie.Year}</span>
            {movie.Runtime && (
              <>
                <span>•</span>
                <span>{movie.Runtime}</span>
              </>
            )}
          </div>

          {movie.Genre && (
            <div className="flex flex-wrap gap-1 mb-3">
              {movie.Genre.split(', ').slice(0, 3).map((genre, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          {movie.Plot && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {movie.Plot}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}