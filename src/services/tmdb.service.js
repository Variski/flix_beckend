const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const getHeaders = () => {
  const token = process.env.TMDB_API_KEY?.trim();
  if (!token) throw new Error('TMDB_API_KEY is missing in .env');
  
  return {
    Authorization: `Bearer ${token}`,
    accept: 'application/json',
  };
};

const mapMovie = (movie) => ({
  id: movie.id,
  title: movie.title,
  original_title: movie.original_title,
  overview: movie.overview,
  release_date: movie.release_date,
  vote_average: movie.vote_average,
  poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
  backdrop_url: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
});

const fetchFromTMDB = async (endpoint, queryParams = {}) => {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  Object.keys(queryParams).forEach(key => {
    if (queryParams[key]) url.searchParams.append(key, queryParams[key]);
  });

  const response = await fetch(url.toString(), { headers: getHeaders() });
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.status_message || 'Error fetching from TMDB');
    error.statusCode = response.status;
    throw error;
  }
  return data;
};

const getPopularMovies = async (page = 1) => {
  const data = await fetchFromTMDB('/movie/popular', { page, language: 'en-US' });
  return { ...data, results: data.results.map(mapMovie) };
};

const searchMovies = async (query, page = 1) => {
  const data = await fetchFromTMDB('/search/movie', { query, page, language: 'en-US' });
  return { ...data, results: data.results.map(mapMovie) };
};

const getMovieDetails = async (id) => {
  const movie = await fetchFromTMDB(`/movie/${id}`, { language: 'en-US', append_to_response: 'videos,credits,recommendations' });
  return {
    ...mapMovie(movie),
    genres: movie.genres,
    runtime: movie.runtime,
    tagline: movie.tagline,
    videos: movie.videos?.results || [],
    cast: (movie.credits?.cast || []).slice(0, 10).map(c => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profile_url: c.profile_path ? `https://image.tmdb.org/t/p/w500${c.profile_path}` : null
    })),
    recommendations: (movie.recommendations?.results || []).map(mapMovie)
  };
};

const getTrendingMovies = async (timeWindow = 'day') => {
  const data = await fetchFromTMDB(`/trending/movie/${timeWindow}`, { language: 'en-US' });
  return { ...data, results: data.results.map(mapMovie) };
};

const getUpcomingMovies = async (page = 1) => {
  const data = await fetchFromTMDB('/movie/upcoming', { page, language: 'en-US' });
  return { ...data, results: data.results.map(mapMovie) };
};

const getTopRatedMovies = async (page = 1) => {
  const data = await fetchFromTMDB('/movie/top_rated', { page, language: 'en-US' });
  return { ...data, results: data.results.map(mapMovie) };
};

const discoverMovies = async (queryParams) => {
  const data = await fetchFromTMDB('/discover/movie', queryParams);
  return { ...data, results: data.results.map(mapMovie) };
};

const getMovieProviders = async (id) => {
  const data = await fetchFromTMDB(`/movie/${id}/watch/providers`);
  return data.results?.ID || data.results?.US || { link: "", flatrate: [], rent: [], buy: [] };
};

module.exports = {
  getPopularMovies,
  searchMovies,
  getMovieDetails,
  getTrendingMovies,
  getUpcomingMovies,
  getTopRatedMovies,
  discoverMovies,
  getMovieProviders
};
