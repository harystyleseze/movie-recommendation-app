import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Movie, DiscoverParams } from '@/services/api'
import { apiService } from '@/services/api'
import { MovieCard } from './MovieCard'
import { MovieSearch } from './MovieSearch'
import { MovieFilters } from './MovieFilters'
import { MovieGridSkeleton } from './MovieSkeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Sparkles } from 'lucide-react'

export function MovieDiscovery() {
  const navigate = useNavigate()
  const [movies, setMovies] = useState<Movie[]>([])
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([])
  const [recommendations, setRecommendations] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<DiscoverParams>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [activeTab, setActiveTab] = useState<'discover' | 'trending' | 'recommendations'>('discover')

  useEffect(() => {
    loadTrendingMovies()
    loadRecommendations()
  }, [])

  useEffect(() => {
    if (searchQuery || Object.keys(filters).length > 0) {
      loadMovies()
    } else if (activeTab === 'discover') {
      loadDiscoverMovies()
    }
  }, [searchQuery, filters, currentPage])

  const loadMovies = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = searchQuery
        ? await apiService.searchMovies({ query: searchQuery, page: currentPage })
        : await apiService.discoverMovies({ ...filters, page: currentPage })

      setMovies(response.data.movies || [])
      setTotalPages(response.totalPages || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load movies')
    } finally {
      setLoading(false)
    }
  }

  const loadDiscoverMovies = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.discoverMovies({ page: currentPage })
      setMovies(response.data.movies || [])
      setTotalPages(response.totalPages || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load movies')
    } finally {
      setLoading(false)
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const response = await apiService.getTrendingMovies()
      setTrendingMovies(response.data.movies?.slice(0, 6) || [])
    } catch (err) {
      console.error('Failed to load trending movies:', err)
    }
  }

  const loadRecommendations = async () => {
    try {
      const response = await apiService.getRecommendations({ limit: 6 })
      setRecommendations(response.data.movies || [])
    } catch (err) {
      console.error('Failed to load recommendations:', err)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
    setActiveTab('discover')
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setCurrentPage(1)
  }

  const handleFiltersChange = (newFilters: DiscoverParams) => {
    setFilters(newFilters)
    setCurrentPage(1)
    setActiveTab('discover')
  }

  const handleClearFilters = () => {
    setFilters({})
    setCurrentPage(1)
  }

  const handleMovieClick = (movie: Movie) => {
    navigate(`/movies/${movie.imdbID}`)
  }

  const handleTabChange = (tab: 'discover' | 'trending' | 'recommendations') => {
    setActiveTab(tab)
    if (tab !== 'discover') {
      setSearchQuery('')
      setFilters({})
    }
  }

  const renderMovieGrid = (movieList: Movie[], isLoading: boolean) => {
    if (isLoading) {
      return <MovieGridSkeleton count={8} />
    }

    if (movieList.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No movies found. Try adjusting your search or filters.</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movieList.map((movie) => (
          <MovieCard
            key={movie.imdbID}
            movie={movie}
            onClick={() => handleMovieClick(movie)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Discover Movies</h1>
        <p className="text-muted-foreground text-lg">
          Find your next favorite movie with our powerful search and discovery tools
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={activeTab === 'discover' ? 'default' : 'outline'}
          onClick={() => handleTabChange('discover')}
        >
          Discover
        </Button>
        <Button
          variant={activeTab === 'trending' ? 'default' : 'outline'}
          onClick={() => handleTabChange('trending')}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Trending
        </Button>
        <Button
          variant={activeTab === 'recommendations' ? 'default' : 'outline'}
          onClick={() => handleTabChange('recommendations')}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Recommendations
        </Button>
      </div>

      {/* Search and Filters for Discover tab */}
      {activeTab === 'discover' && (
        <div className="space-y-6 mb-8">
          <MovieSearch
            onSearch={handleSearch}
            onClear={handleClearSearch}
            defaultValue={searchQuery}
          />

          <MovieFilters
            onFiltersChange={handleFiltersChange}
            onClear={handleClearFilters}
            defaultFilters={filters}
          />

          {(searchQuery || Object.keys(filters).some(key => filters[key as keyof DiscoverParams])) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary">
                  Search: {searchQuery}
                </Badge>
              )}
              {filters.sortBy && (
                <Badge variant="secondary">
                  Sort: {filters.sortBy}
                </Badge>
              )}
              {filters.genres && (
                <Badge variant="secondary">
                  Genres: {filters.genres}
                </Badge>
              )}
              {filters.year && (
                <Badge variant="secondary">
                  Year: {filters.year}
                </Badge>
              )}
              {(filters.ratingMin || filters.ratingMax) && (
                <Badge variant="secondary">
                  Rating: {filters.ratingMin || 0}-{filters.ratingMax || 10}
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="p-6">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => {
                setError(null)
                if (activeTab === 'discover') {
                  loadMovies()
                } else if (activeTab === 'trending') {
                  loadTrendingMovies()
                } else {
                  loadRecommendations()
                }
              }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Content based on active tab */}
      {activeTab === 'discover' && (
        <>
          {renderMovieGrid(movies, loading)}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {activeTab === 'trending' && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Trending Now</h2>
          {renderMovieGrid(trendingMovies, false)}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Recommended for You</h2>
          {renderMovieGrid(recommendations, false)}
        </div>
      )}
    </div>
  )
}