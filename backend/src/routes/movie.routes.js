const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const movieController = require('../controllers/movie.controller');

const router = express.Router();

/**
 * @route   GET /api/v1/movies/search
 * @desc    Search movies by title or keywords
 * @access  Public
 */
router.get('/search', movieController.searchMovies);

/**
 * @route   GET /api/v1/movies/discover
 * @desc    Get movies by various filters
 * @access  Public
 */
router.get('/discover', movieController.discoverMovies);

/**
 * @route   GET /api/v1/movies/:id
 * @desc    Get movie details by TMDB ID
 * @access  Public
 */
router.get('/:id', movieController.getMovieDetails);

/**
 * @route   GET /api/v1/movies/genres
 * @desc    Get all movie genres
 * @access  Public
 */
router.get('/genres/all', movieController.getGenres);

module.exports = router;
