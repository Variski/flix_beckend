const prisma = require('../config/prisma');

const getFilms = async ({ search, genreId, moodId, year, page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const where = {};

  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }
  if (year) {
    where.releaseYear = Number(year);
  }
  if (genreId) {
    where.genres = { some: { genreId: Number(genreId) } };
  }
  if (moodId) {
    where.moods = { some: { moodId: Number(moodId) } };
  }

  const [films, total] = await Promise.all([
    prisma.film.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { imdbRating: 'desc' },
      include: {
        genres: { include: { genre: true } },
        moods:  { include: { mood: true } },
        _count: { select: { ratings: true, reviews: true } },
      },
    }),
    prisma.film.count({ where }),
  ]);

  return { films, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
};

const getFilmById = async (id) => {
  const film = await prisma.film.findUnique({
    where: { id },
    include: {
      genres: { include: { genre: true } },
      moods:  { include: { mood: true } },
      _count: { select: { ratings: true, reviews: true, discussions: true } },
    },
  });
  if (!film) {
    const err = new Error('Film not found');
    err.statusCode = 404;
    throw err;
  }
  return film;
};

const createFilm = async (data) => {
  return prisma.film.create({
    data: {
      title:           data.title,
      omdbId:          data.omdbId,
      releaseYear:     data.releaseYear,
      posterUrl:       data.posterUrl,
      synopsis:        data.synopsis,
      imdbRating:      data.imdbRating,
      durationMinutes: data.durationMinutes,
      director:        data.director,
      genres: data.genreIds?.length
        ? { create: data.genreIds.map((id) => ({ genreId: id })) }
        : undefined,
      moods: data.moodIds?.length
        ? { create: data.moodIds.map((id) => ({ moodId: id })) }
        : undefined,
    },
    include: {
      genres: { include: { genre: true } },
      moods:  { include: { mood: true } },
    },
  });
};

const updateFilm = async (id, data) => {
  await getFilmById(id);
  return prisma.film.update({
    where: { id },
    data: {
      title:           data.title,
      releaseYear:     data.releaseYear,
      posterUrl:       data.posterUrl,
      synopsis:        data.synopsis,
      imdbRating:      data.imdbRating,
      durationMinutes: data.durationMinutes,
      director:        data.director,
    },
  });
};

const deleteFilm = async (id) => {
  await getFilmById(id);
  await prisma.film.delete({ where: { id } });
};

const getGenres = async () => prisma.genre.findMany({ orderBy: { name: 'asc' } });
const getMoods  = async () => prisma.mood.findMany({ orderBy: { name: 'asc' } });

module.exports = { getFilms, getFilmById, createFilm, updateFilm, deleteFilm, getGenres, getMoods };
