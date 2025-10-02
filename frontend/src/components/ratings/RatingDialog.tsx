import React, { useState, useEffect } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import type { Movie, Rating } from '@/services/api';
import { RatingStars } from './RatingStars';

interface RatingDialogProps {
  movie: Movie;
  trigger?: React.ReactNode;
  onRatingUpdated?: () => void;
}

export const RatingDialog: React.FC<RatingDialogProps> = ({
  movie,
  trigger,
  onRatingUpdated,
}) => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingRating, setExistingRating] = useState<Rating | null>(null);
  const [formData, setFormData] = useState({
    rating: 0,
    review: '',
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Load existing rating when dialog opens
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      loadExistingRating();
    }
  }, [isAuthenticated, isOpen, movie.imdbID]);

  const loadExistingRating = async () => {
    try {
      const response = await apiService.getUserRatingForMovie(movie.imdbID);
      const rating = response.data.rating;
      if (rating) {
        setExistingRating(rating);
        setFormData({
          rating: rating.rating,
          review: rating.review || '',
        });
      } else {
        setExistingRating(null);
        setFormData({ rating: 0, review: '' });
      }
    } catch (error) {
      console.error('Error loading existing rating:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    const newErrors: {[key: string]: string} = {};
    if (formData.rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const movieData = {
        title: movie.Title,
        poster: movie.Poster,
        year: movie.Year,
        genre: movie.Genre,
      };

      await apiService.addOrUpdateRating({
        movieId: movie.imdbID,
        rating: formData.rating,
        review: formData.review.trim() || undefined,
        movieData,
      });

      setIsOpen(false);
      onRatingUpdated?.();
    } catch (error) {
      console.error('Error submitting rating:', error);
      setErrors({ submit: 'Failed to submit rating. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingRating || !confirm('Are you sure you want to delete your rating?')) {
      return;
    }

    setIsLoading(true);
    try {
      await apiService.deleteRating(existingRating.id);
      setExistingRating(null);
      setFormData({ rating: 0, review: '' });
      setIsOpen(false);
      onRatingUpdated?.();
    } catch (error) {
      console.error('Error deleting rating:', error);
      setErrors({ submit: 'Failed to delete rating. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }));
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Star className="h-4 w-4 mr-2" />
            Rate Movie
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existingRating ? 'Update Rating' : 'Rate Movie'}
          </DialogTitle>
          <div className="flex items-center gap-3 mt-2">
            <img
              src={movie.Poster}
              alt={movie.Title}
              className="w-12 h-16 object-cover rounded"
            />
            <div>
              <h4 className="font-medium">{movie.Title}</h4>
              <p className="text-sm text-gray-600">{movie.Year}</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex items-center gap-2">
              <RatingStars
                rating={formData.rating}
                onRatingChange={handleRatingChange}
                size="lg"
              />
              {formData.rating > 0 && (
                <span className="text-sm text-gray-600">
                  {formData.rating} star{formData.rating !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {errors.rating && (
              <p className="text-sm text-red-600">{errors.rating}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Review (Optional)</Label>
            <Textarea
              id="review"
              placeholder="Share your thoughts about this movie..."
              value={formData.review}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData(prev => ({ ...prev, review: e.target.value }))
              }
              maxLength={1000}
              rows={4}
            />
            <div className="text-xs text-gray-500 text-right">
              {formData.review.length}/1000 characters
            </div>
          </div>

          {errors.submit && (
            <p className="text-sm text-red-600">{errors.submit}</p>
          )}

          <div className="flex justify-between">
            <div>
              {existingRating && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  Delete Rating
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : existingRating ? (
                  'Update Rating'
                ) : (
                  'Submit Rating'
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};