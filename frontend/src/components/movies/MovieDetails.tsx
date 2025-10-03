import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Movie, Rating } from '@/services/api'
import { apiService } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Star, Calendar, Clock, Users } from 'lucide-react'
import { FavoriteButton } from '@/components/favorites/FavoriteButton'
import { WatchlistButton } from '@/components/watchlists/WatchlistButton'
import { RatingDialog } from '@/components/ratings/RatingDialog'
import { RatingStars } from '@/components/ratings/RatingStars'
import { MovieCard } from './MovieCard'

export function MovieDetails() {
  const { movieId } = useParams<{ movieId: string }>()
  const navigate = useNavigate()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [recommendations, setRecommendations] = useState<Movie[]>([])
  const [movieRatings, setMovieRatings] = useState<Rating[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (movieId) {
      loadMovieDetails()
      loadRecommendations()
      loadMovieRatings()
    }
  }, [movieId])

  const loadMovieDetails = async () => {
    if (!movieId) return

    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getMovieDetails(movieId)
      setMovie(response.data.movie)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load movie details')
    } finally {
      setLoading(false)
    }
  }

  const loadRecommendations = async () => {
    if (!movieId) return

    try {
      const response = await apiService.getRecommendations({
        baseMovie: movieId,
        limit: 4,
      })
      setRecommendations(response.data.movies || [])
    } catch (err) {
      console.error('Failed to load recommendations:', err)
    }
  }

  const loadMovieRatings = async () => {
    if (!movieId) return

    try {
      const response = await apiService.getMovieRatings(movieId, 1, 5)
      setMovieRatings(response.data.ratings || [])
      setAverageRating(response.data.averageRating || 0)
    } catch (err) {
      console.error('Failed to load movie ratings:', err)
    }
  }

  const handleBackClick = () => {
    navigate(-1)
  }

  const handleRecommendationClick = (recommendedMovie: Movie) => {
    navigate(`/movies/${recommendedMovie.imdbID}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-24 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="aspect-[2/3] bg-muted rounded-lg" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={handleBackClick} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">
              {error || 'Movie not found'}
            </p>
            <Button onClick={loadMovieDetails}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={handleBackClick} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Movie Poster */}
        <div className="lg:col-span-1">
          <div className="relative">
            {movie.Poster && movie.Poster !== 'N/A' ? (
              <img
                src={movie.Poster}
                alt={`${movie.Title} poster`}
                className="w-full rounded-lg shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder-movie.svg'
                }}
              />
            ) : (
              <div className="aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">No poster available</span>
              </div>
            )}
            {movie.imdbRating && (
              <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{movie.imdbRating}</span>
              </div>
            )}
          </div>
        </div>

        {/* Movie Details */}
        <div className="lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-4xl font-bold">{movie.Title}</h1>

            {/* User Action Buttons */}
            <div className="flex items-center gap-2 ml-4">
              <FavoriteButton movie={movie} variant="outline" showLabel />
              <WatchlistButton movie={movie} variant="outline" showLabel />
              <RatingDialog
                movie={movie}
                onRatingUpdated={loadMovieRatings}
                trigger={
                  <Button variant="outline">
                    <Star className="h-4 w-4 mr-2" />
                    Rate
                  </Button>
                }
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-6 text-muted-foreground">
            {movie.Year && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{movie.Year}</span>
              </div>
            )}
            {movie.Runtime && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{movie.Runtime}</span>
              </div>
            )}
            {movie.Director && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Dir. {movie.Director}</span>
              </div>
            )}
          </div>

          {movie.Genre && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {movie.Genre.split(', ').map((genre, index) => (
                  <Badge key={index} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {movie.Plot && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Plot</h3>
              <p className="text-muted-foreground leading-relaxed">{movie.Plot}</p>
            </div>
          )}

          {movie.Released && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Release Date</h3>
              <p className="text-muted-foreground">{movie.Released}</p>
            </div>
          )}
        </div>
      </div>

      {/* Ratings and Reviews Section */}
      {movieRatings.length > 0 && (
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Ratings & Reviews</span>
                {averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <RatingStars rating={averageRating} readonly />
                    <span className="text-sm text-muted-foreground">
                      {averageRating.toFixed(1)} ({movieRatings.length} review{movieRatings.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {movieRatings.map((rating) => (
                <div key={rating.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <RatingStars rating={rating.rating} readonly size="sm" />
                      <span className="text-sm font-medium">{rating.rating}/5</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {rating.review && (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {rating.review}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {recommendations.map((rec) => (
              <MovieCard
                key={rec.imdbID}
                movie={rec}
                onClick={() => handleRecommendationClick(rec)}
                className="h-full"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}