import React, { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import type { Movie } from '@/services/api';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  movie: Movie;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  movie,
  className,
  variant = 'ghost',
  size = 'icon',
  showLabel = false,
}) => {
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check favorite status on mount and when auth state changes
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!isAuthenticated) {
        setIsFavorited(false);
        return;
      }

      try {
        const response = await apiService.checkFavoriteStatus(movie.imdbID);
        setIsFavorited(response.data.isFavorite);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [movie.imdbID, isAuthenticated]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Could show a toast or modal here asking user to login
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorited) {
        await apiService.removeFromFavorites(movie.imdbID);
        setIsFavorited(false);
      } else {
        const movieData = {
          title: movie.Title,
          poster: movie.Poster,
          year: movie.Year,
          genre: movie.Genre,
        };
        await apiService.addToFavorites(movie.imdbID, movieData);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Don't show favorite button for unauthenticated users
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={cn(
        'transition-all duration-200',
        isFavorited
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-400 hover:text-red-500',
        className
      )}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={cn(
            'h-4 w-4 transition-all duration-200',
            isFavorited ? 'fill-current' : ''
          )}
        />
      )}
      {showLabel && (
        <span className="ml-2">
          {isFavorited ? 'Favorited' : 'Add to Favorites'}
        </span>
      )}
    </Button>
  );
};