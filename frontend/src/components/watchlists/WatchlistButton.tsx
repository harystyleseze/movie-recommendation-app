import React, { useState, useEffect } from 'react';
import { Plus, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import type { Movie, Watchlist } from '@/services/api';
import { cn } from '@/lib/utils';

interface WatchlistButtonProps {
  movie: Movie;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export const WatchlistButton: React.FC<WatchlistButtonProps> = ({
  movie,
  className,
  variant = 'ghost',
  size = 'icon',
  showLabel = false,
}) => {
  const { isAuthenticated } = useAuth();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && isDialogOpen) {
      loadWatchlists();
    }
  }, [isAuthenticated, isDialogOpen]);

  const loadWatchlists = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getWatchlists(1, 50); // Get all watchlists
      setWatchlists(response.data.watchlists);
    } catch (error) {
      console.error('Error loading watchlists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToWatchlist = async (watchlistId: string) => {
    try {
      const movieData = {
        title: movie.Title,
        poster: movie.Poster,
        year: movie.Year,
        genre: movie.Genre,
      };
      await apiService.addMovieToWatchlist(watchlistId, movie.imdbID, movieData);

      // Update the local state to show the movie is now in this watchlist
      setWatchlists(prev =>
        prev.map(wl =>
          wl.id === watchlistId
            ? {
                ...wl,
                movies: [
                  ...wl.movies,
                  {
                    movieId: movie.imdbID,
                    movieData,
                    addedAt: new Date().toISOString(),
                    watched: false,
                  },
                ],
              }
            : wl
        )
      );
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const handleRemoveFromWatchlist = async (watchlistId: string) => {
    try {
      await apiService.removeMovieFromWatchlist(watchlistId, movie.imdbID);

      // Update the local state to remove the movie from this watchlist
      setWatchlists(prev =>
        prev.map(wl =>
          wl.id === watchlistId
            ? {
                ...wl,
                movies: wl.movies.filter(m => m.movieId !== movie.imdbID),
              }
            : wl
        )
      );
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const isMovieInWatchlist = (watchlist: Watchlist) => {
    return watchlist.movies.some(m => m.movieId === movie.imdbID);
  };

  if (!isAuthenticated) {
    return null; // Don't show watchlist button for unauthenticated users
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn('transition-all duration-200', className)}
          title="Add to watchlist"
        >
          <Plus className="h-4 w-4" />
          {showLabel && <span className="ml-2">Add to Watchlist</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Watchlist</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : watchlists.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You don't have any watchlists yet.</p>
              <Button onClick={() => setIsDialogOpen(false)}>
                Create Your First Watchlist
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {watchlists.map((watchlist) => {
                const isInWatchlist = isMovieInWatchlist(watchlist);
                return (
                  <Card
                    key={watchlist.id}
                    className={cn(
                      'cursor-pointer transition-all duration-200 hover:shadow-md',
                      isInWatchlist ? 'border-green-500 bg-green-50' : ''
                    )}
                    onClick={() =>
                      isInWatchlist
                        ? handleRemoveFromWatchlist(watchlist.id)
                        : handleAddToWatchlist(watchlist.id)
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{watchlist.name}</h4>
                          {watchlist.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {watchlist.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {watchlist.movies.length} movies
                            </Badge>
                            {watchlist.isPublic && (
                              <Badge variant="outline" className="text-xs">
                                Public
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          {isInWatchlist ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <Plus className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};