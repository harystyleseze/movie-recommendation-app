const movieService = require('../services/movie.service');
const { asyncHandler } = require('../utils/async');
const {
  searchMoviesSchema,
} = require('../validators/movie.validator');

/**
 * Controller for movie-related endpoints
 */
exports.searchMovies = asyncHandler(async (req, res) => {
  // Validate query parameters
  const validatedData = searchMoviesSchema.parse(req.query);

  const results = await movieService.searchMovies(validatedData);

  res.status(200).json({
    status: 'success',
    results: results.total_results,
    data: {
      movies: results.results,
      page: results.page,
      totalPages: results.total_pages,
    },
  });
});

exports.discoverMovies = asyncHandler(async (req, res) => {
  const {
    page = 1,
    sortBy = 'popularity.desc',
    genres,
    year,
    ratingMin,
    ratingMax,
  } = req.query;

  const filters = {
    page: parseInt(page),
    sortBy,
    withGenres: genres,
    primaryReleaseYear: year,
    voteAverageGte: ratingMin,
    voteAverageLte: ratingMax,
  };

  const results = await movieService.getMoviesByFilters(filters);

  res.status(200).json({
    status: 'success',
    results: results.total_results,
    data: {
      movies: results.results,
      page: results.page,
      totalPages: results.total_pages,
    },
  });
});

exports.getMovieDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const movie = await movieService.getMovieDetails(id);

  res.status(200).json({
    status: 'success',
    data: {
      movie,
    },
  });
});

exports.getGenres = asyncHandler(async (req, res) => {
  const genres = await movieService.getGenres();

  res.status(200).json({
    status: 'success',
    data: {
      genres,
    },
  });
});
