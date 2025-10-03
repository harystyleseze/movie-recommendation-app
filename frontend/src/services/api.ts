const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

// Auth token management
class AuthManager {
  private static TOKEN_KEY = 'auth_token';
  private static USER_KEY = 'auth_user';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static getUser(): User | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Type: string;
  Poster: string;
  Genre?: string;
  Director?: string;
  Plot?: string;
  Runtime?: string;
  imdbRating?: string;
  Released?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  location?: string;
  favoriteGenres: string[];
  isPublic: boolean;
  preferences: {
    emailNotifications: boolean;
    publicWatchlists: boolean;
    publicRatings: boolean;
  };
  stats: {
    totalMoviesRated: number;
    totalWatchlists: number;
    totalFavorites: number;
    averageRating: number;
  };
  lastActive: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface Favorite {
  id: string;
  userId: string;
  movieId: string;
  movieData: {
    title: string;
    poster: string;
    year: string;
    genre?: string;
  };
  addedAt: string;
}

export interface Watchlist {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  userId: string;
  movies: WatchlistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistItem {
  movieId: string;
  movieData: {
    title: string;
    poster: string;
    year: string;
    genre?: string;
  };
  addedAt: string;
  watched: boolean;
  watchedAt?: string;
  notes?: string;
}

export interface Rating {
  id: string;
  userId: string;
  movieId: string;
  rating: number;
  review?: string;
  movieData: {
    title: string;
    poster: string;
    year: string;
    genre?: string;
  };
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserActivity {
  recentRatings: Rating[];
  recentFavorites: Favorite[];
  recentWatchlistActivity: {
    watchlist: Watchlist;
    action: 'created' | 'updated' | 'movie_added' | 'movie_watched';
    timestamp: string;
  }[];
}

export interface SearchParams {
  query?: string;
  page?: number;
  year?: string;
}

export interface DiscoverParams {
  page?: number;
  sortBy?: 'popularity' | 'rating' | 'year' | 'title';
  genres?: string;
  year?: string;
  ratingMin?: number;
  ratingMax?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  totalPages: number;
}

export interface RatingStats {
  totalRatings: number;
  averageRating: number;
  ratingBreakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface MovieData {
  title: string;
  poster: string;
  year: string;
  genre?: string;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  totalResults?: string;
  totalPages?: number;
  currentPage?: number;
}

class ApiService {
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = AuthManager.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options?.headers) {
      Object.assign(headers, options.headers);
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    if (!response.ok) {
      if (response.status === 401) {
        AuthManager.removeToken();
        window.location.href = '/login';
        throw new Error('Authentication required');
      }
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Movie discovery endpoints
  async searchMovies(params: SearchParams): Promise<ApiResponse<{ movies: Movie[] }>> {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.append('query', params.query);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.year) searchParams.append('year', params.year);

    return this.fetchApi(`/movies/search?${searchParams.toString()}`);
  }

  async discoverMovies(params: DiscoverParams = {}): Promise<ApiResponse<{ movies: Movie[] }>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.genres) searchParams.append('genres', params.genres);
    if (params.year) searchParams.append('year', params.year);
    if (params.ratingMin) searchParams.append('ratingMin', params.ratingMin.toString());
    if (params.ratingMax) searchParams.append('ratingMax', params.ratingMax.toString());

    return this.fetchApi(`/movies/discover?${searchParams.toString()}`);
  }

  async getMovieDetails(movieId: string): Promise<ApiResponse<{ movie: Movie }>> {
    return this.fetchApi(`/movies/${movieId}`);
  }

  async getTrendingMovies(page = 1): Promise<ApiResponse<{ movies: Movie[] }>> {
    return this.fetchApi(`/movies/trending?page=${page}`);
  }

  async getRecommendations(params: { genres?: string; baseMovie?: string; page?: number; limit?: number } = {}): Promise<ApiResponse<{ movies: Movie[] }>> {
    const searchParams = new URLSearchParams();
    if (params.genres) searchParams.append('genres', params.genres);
    if (params.baseMovie) searchParams.append('baseMovie', params.baseMovie);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    return this.fetchApi(`/movies/recommendations?${searchParams.toString()}`);
  }

  async getGenres(): Promise<ApiResponse<{ genres: string[] }>> {
    return this.fetchApi('/movies/genres/all');
  }

  // Authentication endpoints
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await this.fetchApi<ApiResponse<AuthResponse>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.data.token) {
      AuthManager.setToken(response.data.token);
      AuthManager.setUser(response.data.user);
    }
    return response;
  }

  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    const response = await this.fetchApi<ApiResponse<AuthResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.data.token) {
      AuthManager.setToken(response.data.token);
      AuthManager.setUser(response.data.user);
    }
    return response;
  }

  async logout(): Promise<void> {
    AuthManager.removeToken();
  }

  async getProfile(): Promise<ApiResponse<{ profile: User }>> {
    return this.fetchApi('/auth/profile');
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<{ profile: User }>> {
    const response = await this.fetchApi<ApiResponse<{ profile: User }>>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (response.data.profile) {
      AuthManager.setUser(response.data.profile);
    }
    return response;
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<{ message: string }>> {
    return this.fetchApi('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyActivity(): Promise<ApiResponse<{ activity: UserActivity }>> {
    return this.fetchApi('/profile/me/activity');
  }

  // Favorites endpoints
  async addToFavorites(movieId: string, movieData: MovieData): Promise<ApiResponse<{ favorite: Favorite }>> {
    return this.fetchApi('/favorites', {
      method: 'POST',
      body: JSON.stringify({ movieId, movieData }),
    });
  }

  async removeFromFavorites(movieId: string): Promise<ApiResponse<{ message: string }>> {
    return this.fetchApi(`/favorites/${movieId}`, {
      method: 'DELETE',
    });
  }

  async getFavorites(page = 1, limit = 10): Promise<ApiResponse<{ favorites: Favorite[]; pagination: Pagination }>> {
    return this.fetchApi(`/favorites?page=${page}&limit=${limit}`);
  }

  async checkFavoriteStatus(movieId: string): Promise<ApiResponse<{ isFavorite: boolean }>> {
    return this.fetchApi(`/favorites/${movieId}/status`);
  }

  async getFavoritesCount(): Promise<ApiResponse<{ count: number }>> {
    return this.fetchApi('/favorites/count');
  }

  async getFavoriteRecommendations(page = 1, limit = 10): Promise<ApiResponse<{ movies: Movie[] }>> {
    return this.fetchApi(`/favorites/recommendations?page=${page}&limit=${limit}`);
  }

  // Watchlists endpoints
  async createWatchlist(data: { name: string; description?: string; isPublic?: boolean }): Promise<ApiResponse<{ watchlist: Watchlist }>> {
    return this.fetchApi('/watchlists', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWatchlists(page = 1, limit = 10): Promise<ApiResponse<{ watchlists: Watchlist[]; pagination: Pagination }>> {
    return this.fetchApi(`/watchlists?page=${page}&limit=${limit}`);
  }

  async getWatchlist(watchlistId: string): Promise<ApiResponse<{ watchlist: Watchlist }>> {
    return this.fetchApi(`/watchlists/${watchlistId}`);
  }

  async updateWatchlist(watchlistId: string, data: Partial<Watchlist>): Promise<ApiResponse<{ watchlist: Watchlist }>> {
    return this.fetchApi(`/watchlists/${watchlistId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWatchlist(watchlistId: string): Promise<ApiResponse<{ message: string }>> {
    return this.fetchApi(`/watchlists/${watchlistId}`, {
      method: 'DELETE',
    });
  }

  async addMovieToWatchlist(watchlistId: string, movieId: string, movieData: MovieData): Promise<ApiResponse<{ watchlist: Watchlist }>> {
    return this.fetchApi(`/watchlists/${watchlistId}/movies`, {
      method: 'POST',
      body: JSON.stringify({ movieId, movieData }),
    });
  }

  async removeMovieFromWatchlist(watchlistId: string, movieId: string): Promise<ApiResponse<{ message: string }>> {
    return this.fetchApi(`/watchlists/${watchlistId}/movies/${movieId}`, {
      method: 'DELETE',
    });
  }

  async updateWatchedStatus(watchlistId: string, movieId: string, watched: boolean, notes?: string): Promise<ApiResponse<{ message: string }>> {
    return this.fetchApi(`/watchlists/${watchlistId}/movies/${movieId}/watched`, {
      method: 'PATCH',
      body: JSON.stringify({ watched, notes }),
    });
  }

  async getPublicWatchlists(page = 1, limit = 10): Promise<ApiResponse<{ watchlists: Watchlist[]; pagination: Pagination }>> {
    return this.fetchApi(`/watchlists/public?page=${page}&limit=${limit}`);
  }

  // Ratings endpoints
  async addOrUpdateRating(data: { movieId: string; rating: number; review?: string; movieData: MovieData }): Promise<ApiResponse<{ rating: Rating }>> {
    return this.fetchApi('/ratings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserRatings(page = 1, limit = 10): Promise<ApiResponse<{ ratings: Rating[]; pagination: Pagination }>> {
    return this.fetchApi(`/ratings?page=${page}&limit=${limit}`);
  }

  async getMyRatingStats(): Promise<ApiResponse<{ stats: RatingStats }>> {
    return this.fetchApi('/ratings/stats');
  }

  async getMovieRatings(movieId: string, page = 1, limit = 10): Promise<ApiResponse<{ ratings: Rating[]; pagination: Pagination; averageRating: number }>> {
    return this.fetchApi(`/ratings/movie/${movieId}?page=${page}&limit=${limit}`);
  }

  async getUserRatingForMovie(movieId: string): Promise<ApiResponse<{ rating: Rating | null }>> {
    return this.fetchApi(`/ratings/movie/${movieId}/my-rating`);
  }

  async deleteRating(ratingId: string): Promise<ApiResponse<{ message: string }>> {
    return this.fetchApi(`/ratings/${ratingId}`, {
      method: 'DELETE',
    });
  }

  async getRecentReviews(page = 1, limit = 10): Promise<ApiResponse<{ ratings: Rating[]; pagination: Pagination }>> {
    return this.fetchApi(`/ratings/recent?page=${page}&limit=${limit}`);
  }

  async markRatingHelpful(ratingId: string): Promise<ApiResponse<{ message: string; helpfulCount: number }>> {
    return this.fetchApi(`/ratings/${ratingId}/helpful`, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();
export { AuthManager };