import React, { useState, useEffect } from 'react';
import { Loader2, Heart, Grid, List } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import type { Favorite } from '@/services/api';
import { MovieCard } from '@/components/movies/MovieCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FavoritesPageProps {
  className?: string;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ className }) => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    loadFavorites();
  }, [isAuthenticated, currentPage]);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getFavorites(currentPage, 12);
      setFavorites(response.data.favorites);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err) {
      setError('Failed to load favorites');
      console.error('Error loading favorites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (movieId: string) => {
    try {
      await apiService.removeFromFavorites(movieId);
      setFavorites(prev => prev.filter(fav => fav.movieId !== movieId));
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  const filteredFavorites = favorites.filter(fav =>
    fav.movieData.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fav.movieData.genre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Sign in to view your favorites</h2>
        <p className="text-gray-600">
          Create an account or sign in to save and manage your favorite movies.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadFavorites}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
          <p className="text-gray-600">
            {favorites.length} movie{favorites.length !== 1 ? 's' : ''} in your favorites
          </p>
        </div>

        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search your favorites..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Favorites Grid/List */}
      {filteredFavorites.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? 'No matching favorites' : 'No favorites yet'}
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Start exploring movies and add them to your favorites!'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
              {filteredFavorites.map((favorite) => (
                <div key={favorite.id} className="relative group">
                  <MovieCard
                    movie={{
                      imdbID: favorite.movieId,
                      Title: favorite.movieData.title,
                      Year: favorite.movieData.year,
                      Type: 'movie',
                      Poster: favorite.movieData.poster,
                      Genre: favorite.movieData.genre,
                    }}
                    onClick={() => window.location.href = `/movies/${favorite.movieId}`}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleRemoveFavorite(favorite.movieId);
                    }}
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                  <Badge variant="secondary" className="absolute bottom-2 left-2 text-xs">
                    {new Date(favorite.addedAt).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              {filteredFavorites.map((favorite) => (
                <Card key={favorite.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={favorite.movieData.poster}
                        alt={favorite.movieData.title}
                        className="w-16 h-24 object-cover rounded cursor-pointer"
                        onClick={() => window.location.href = `/movies/${favorite.movieId}`}
                      />
                      <div className="flex-1">
                        <h3
                          className="font-semibold text-lg cursor-pointer hover:text-blue-600"
                          onClick={() => window.location.href = `/movies/${favorite.movieId}`}
                        >
                          {favorite.movieData.title}
                        </h3>
                        <p className="text-gray-600">{favorite.movieData.year}</p>
                        {favorite.movieData.genre && (
                          <p className="text-sm text-gray-500">{favorite.movieData.genre}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Added {new Date(favorite.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveFavorite(favorite.movieId)}
                      >
                        <Heart className="h-4 w-4 fill-current text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};