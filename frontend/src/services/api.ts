const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

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

export interface ApiResponse<T> {
  status: string;
  data: T;
  totalResults?: string;
  totalPages?: number;
  currentPage?: number;
}

class ApiService {
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
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
}

export const apiService = new ApiService();