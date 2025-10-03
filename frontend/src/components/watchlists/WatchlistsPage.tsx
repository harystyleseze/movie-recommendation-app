import React, { useState, useEffect } from 'react';
import { Loader2, BookOpen, Eye, EyeOff, MoreHorizontal, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import type { Watchlist } from '@/services/api';
import { CreateWatchlistDialog } from './CreateWatchlistDialog';
import { MovieCard } from '@/components/movies/MovieCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface WatchlistsPageProps {
  className?: string;
}

export const WatchlistsPage: React.FC<WatchlistsPageProps> = ({ className }) => {
  const { isAuthenticated } = useAuth();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWatchlist, setSelectedWatchlist] = useState<Watchlist | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    loadWatchlists();
  }, [isAuthenticated]);

  const loadWatchlists = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getWatchlists(1, 50);
      setWatchlists(response.data.watchlists);
    } catch (err) {
      setError('Failed to load watchlists');
      console.error('Error loading watchlists:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWatchlist = async (watchlistId: string) => {
    if (!confirm('Are you sure you want to delete this watchlist?')) {
      return;
    }

    try {
      await apiService.deleteWatchlist(watchlistId);
      setWatchlists(prev => prev.filter(wl => wl.id !== watchlistId));
    } catch (err) {
      console.error('Error deleting watchlist:', err);
    }
  };

  const handleToggleWatched = async (watchlistId: string, movieId: string, watched: boolean) => {
    try {
      await apiService.updateWatchedStatus(watchlistId, movieId, !watched);

      // Update local state
      setWatchlists(prev =>
        prev.map(wl =>
          wl.id === watchlistId
            ? {
                ...wl,
                movies: wl.movies.map(movie =>
                  movie.movieId === movieId
                    ? { ...movie, watched: !watched, watchedAt: !watched ? new Date().toISOString() : undefined }
                    : movie
                ),
              }
            : wl
        )
      );

      // Update selected watchlist if it's the one being modified
      if (selectedWatchlist?.id === watchlistId) {
        setSelectedWatchlist(prev =>
          prev
            ? {
                ...prev,
                movies: prev.movies.map(movie =>
                  movie.movieId === movieId
                    ? { ...movie, watched: !watched, watchedAt: !watched ? new Date().toISOString() : undefined }
                    : movie
                ),
              }
            : null
        );
      }
    } catch (err) {
      console.error('Error updating watched status:', err);
    }
  };

  const handleRemoveFromWatchlist = async (watchlistId: string, movieId: string) => {
    try {
      await apiService.removeMovieFromWatchlist(watchlistId, movieId);

      // Update local state
      setWatchlists(prev =>
        prev.map(wl =>
          wl.id === watchlistId
            ? { ...wl, movies: wl.movies.filter(movie => movie.movieId !== movieId) }
            : wl
        )
      );

      // Update selected watchlist if it's the one being modified
      if (selectedWatchlist?.id === watchlistId) {
        setSelectedWatchlist(prev =>
          prev
            ? { ...prev, movies: prev.movies.filter(movie => movie.movieId !== movieId) }
            : null
        );
      }
    } catch (err) {
      console.error('Error removing movie from watchlist:', err);
    }
  };

  const openWatchlistDetail = (watchlist: Watchlist) => {
    setSelectedWatchlist(watchlist);
    setIsDetailDialogOpen(true);
  };

  const filteredWatchlists = watchlists.filter(wl =>
    wl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wl.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Sign in to view your watchlists</h2>
        <p className="text-gray-600">
          Create an account or sign in to create and manage your movie watchlists.
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
              <Button onClick={loadWatchlists}>Try Again</Button>
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
          <h1 className="text-3xl font-bold mb-2">My Watchlists</h1>
          <p className="text-gray-600">
            {watchlists.length} watchlist{watchlists.length !== 1 ? 's' : ''}
          </p>
        </div>

        <CreateWatchlistDialog onWatchlistCreated={loadWatchlists} />
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search watchlists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Watchlists Grid */}
      {filteredWatchlists.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? 'No matching watchlists' : 'No watchlists yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Create your first watchlist to organize your movies!'}
              </p>
              {!searchQuery && (
                <CreateWatchlistDialog
                  onWatchlistCreated={loadWatchlists}
                  trigger={<Button>Create Your First Watchlist</Button>}
                />
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWatchlists.map((watchlist) => {
            const watchedCount = watchlist.movies.filter(m => m.watched).length;
            const totalCount = watchlist.movies.length;

            return (
              <Card key={watchlist.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1" onClick={() => openWatchlistDetail(watchlist)}>
                      <CardTitle className="text-lg line-clamp-2">{watchlist.name}</CardTitle>
                      {watchlist.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {watchlist.description}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openWatchlistDetail(watchlist)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteWatchlist(watchlist.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {totalCount} movies
                    </Badge>
                    {totalCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {watchedCount}/{totalCount} watched
                      </Badge>
                    )}
                    {watchlist.isPublic && (
                      <Badge variant="outline" className="text-xs">
                        Public
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {watchlist.movies.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {watchlist.movies.slice(0, 4).map((movie) => (
                        <div
                          key={movie.movieId}
                          className="relative aspect-[2/3] bg-gray-100 rounded overflow-hidden"
                        >
                          <img
                            src={movie.movieData.poster}
                            alt={movie.movieData.title}
                            className="w-full h-full object-cover"
                          />
                          {movie.watched && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <Eye className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No movies added yet
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Watchlist Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedWatchlist?.name}</span>
              <div className="flex items-center gap-2">
                {selectedWatchlist?.isPublic && (
                  <Badge variant="outline" className="text-xs">
                    Public
                  </Badge>
                )}
              </div>
            </DialogTitle>
            {selectedWatchlist?.description && (
              <p className="text-gray-600">{selectedWatchlist.description}</p>
            )}
          </DialogHeader>

          {selectedWatchlist && (
            <div className="space-y-4">
              {selectedWatchlist.movies.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No movies in this watchlist yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {selectedWatchlist.movies.map((movie) => (
                    <div key={movie.movieId} className="relative group">
                      <MovieCard
                        movie={{
                          imdbID: movie.movieId,
                          Title: movie.movieData.title,
                          Year: movie.movieData.year,
                          Type: 'movie',
                          Poster: movie.movieData.poster,
                          Genre: movie.movieData.genre,
                        }}
                        onClick={() => window.location.href = `/movies/${movie.movieId}`}
                        className={movie.watched ? 'opacity-75' : ''}
                      />

                      {/* Movie controls */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-y-1">
                        <Button
                          variant={movie.watched ? 'default' : 'secondary'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleWatched(selectedWatchlist.id, movie.movieId, movie.watched);
                          }}
                          title={movie.watched ? 'Mark as unwatched' : 'Mark as watched'}
                        >
                          {movie.watched ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromWatchlist(selectedWatchlist.id, movie.movieId);
                          }}
                          title="Remove from watchlist"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Watched indicator */}
                      {movie.watched && (
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center pointer-events-none">
                          <Eye className="h-6 w-6 text-white" />
                        </div>
                      )}

                      {/* Date added */}
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="secondary" className="text-xs">
                          {new Date(movie.addedAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};