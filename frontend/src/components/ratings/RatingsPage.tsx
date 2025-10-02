import React, { useState, useEffect } from 'react';
import { Loader2, Star, ThumbsUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import type { Rating } from '@/services/api';
import { RatingStars } from './RatingStars';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RatingsPageProps {
  className?: string;
}

export const RatingsPage: React.FC<RatingsPageProps> = ({ className }) => {
  const { isAuthenticated } = useAuth();
  const [myRatings, setMyRatings] = useState<Rating[]>([]);
  const [recentReviews, setRecentReviews] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('my-ratings');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (activeTab === 'my-ratings' && isAuthenticated) {
      loadMyRatings();
    } else if (activeTab === 'recent-reviews') {
      loadRecentReviews();
    }
  }, [activeTab, isAuthenticated, currentPage]);

  const loadMyRatings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getUserRatings(currentPage, 10);
      setMyRatings(response.data.ratings);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err) {
      setError('Failed to load your ratings');
      console.error('Error loading my ratings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getRecentReviews(currentPage, 10);
      setRecentReviews(response.data.ratings);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err) {
      setError('Failed to load recent reviews');
      console.error('Error loading recent reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkHelpful = async (ratingId: string) => {
    try {
      await apiService.markRatingHelpful(ratingId);
      // Update the helpful count locally
      setRecentReviews(prev =>
        prev.map(rating =>
          rating.id === ratingId
            ? { ...rating, helpful: rating.helpful + 1 }
            : rating
        )
      );
    } catch (err) {
      console.error('Error marking rating as helpful:', err);
    }
  };

  const handleDeleteRating = async (ratingId: string) => {
    if (!confirm('Are you sure you want to delete this rating?')) {
      return;
    }

    try {
      await apiService.deleteRating(ratingId);
      setMyRatings(prev => prev.filter(rating => rating.id !== ratingId));
    } catch (err) {
      console.error('Error deleting rating:', err);
    }
  };

  const filteredRatings = (activeTab === 'my-ratings' ? myRatings : recentReviews).filter(
    rating =>
      rating.movieData.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rating.review?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isAuthenticated && activeTab === 'my-ratings') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Star className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Sign in to view your ratings</h2>
        <p className="text-gray-600">
          Create an account or sign in to rate movies and write reviews.
        </p>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Ratings & Reviews</h1>
        <p className="text-gray-600">
          Explore movie ratings and reviews from the community
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          {isAuthenticated && (
            <TabsTrigger value="my-ratings">My Ratings</TabsTrigger>
          )}
          <TabsTrigger value="recent-reviews">Recent Reviews</TabsTrigger>
        </TabsList>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search ratings and reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        <TabsContent value="my-ratings" className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={loadMyRatings}>Try Again</Button>
                </div>
              </CardContent>
            </Card>
          ) : filteredRatings.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Star className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchQuery ? 'No matching ratings' : 'No ratings yet'}
                  </h3>
                  <p className="text-gray-600">
                    {searchQuery
                      ? 'Try adjusting your search terms'
                      : 'Start rating movies to build your collection!'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRatings.map((rating) => (
                <Card key={rating.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={rating.movieData.poster}
                        alt={rating.movieData.title}
                        className="w-16 h-24 object-cover rounded cursor-pointer"
                        onClick={() => window.location.href = `/movies/${rating.movieId}`}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3
                              className="font-semibold text-lg cursor-pointer hover:text-blue-600"
                              onClick={() => window.location.href = `/movies/${rating.movieId}`}
                            >
                              {rating.movieData.title}
                            </h3>
                            <p className="text-gray-600">{rating.movieData.year}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <RatingStars rating={rating.rating} readonly size="sm" />
                            <span className="text-sm text-gray-600">
                              {rating.rating}/5
                            </span>
                          </div>
                        </div>

                        {rating.review && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {rating.review}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Rated on {formatDate(rating.createdAt)}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRating(rating.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

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
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent-reviews" className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={loadRecentReviews}>Try Again</Button>
                </div>
              </CardContent>
            </Card>
          ) : filteredRatings.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Star className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No reviews found</h3>
                  <p className="text-gray-600">
                    {searchQuery
                      ? 'Try adjusting your search terms'
                      : 'No recent reviews available'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRatings.map((rating) => (
                <Card key={rating.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={rating.movieData.poster}
                        alt={rating.movieData.title}
                        className="w-16 h-24 object-cover rounded cursor-pointer"
                        onClick={() => window.location.href = `/movies/${rating.movieId}`}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3
                              className="font-semibold text-lg cursor-pointer hover:text-blue-600"
                              onClick={() => window.location.href = `/movies/${rating.movieId}`}
                            >
                              {rating.movieData.title}
                            </h3>
                            <p className="text-gray-600">{rating.movieData.year}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <RatingStars rating={rating.rating} readonly size="sm" />
                            <span className="text-sm text-gray-600">
                              {rating.rating}/5
                            </span>
                          </div>
                        </div>

                        {rating.review && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {rating.review}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Reviewed on {formatDate(rating.createdAt)}</span>
                          {isAuthenticated && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkHelpful(rating.id)}
                              className="text-gray-600 hover:text-blue-600"
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              Helpful ({rating.helpful})
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

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
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};