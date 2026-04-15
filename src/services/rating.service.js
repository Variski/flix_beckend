const prisma = require('../config/prisma');

const upsertRating = async (userId, filmId, score) => {
  return prisma.rating.upsert({
    where:  { userId_filmId: { userId, filmId } },
    create: { userId, filmId, score },
    update: { score },
  });
};

const deleteRating = async (userId, filmId) => {
  const rating = await prisma.rating.findUnique({
    where: { userId_filmId: { userId, filmId } },
  });
  if (!rating) {
    const err = new Error('Rating not found');
    err.statusCode = 404;
    throw err;
  }
  await prisma.rating.delete({ where: { userId_filmId: { userId, filmId } } });
};

const getFilmRatings = async (filmId) => {
  const [ratings, agg] = await Promise.all([
    prisma.rating.findMany({
      where:   { filmId },
      include: { user: { select: { id: true, username: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.rating.aggregate({
      where:   { filmId },
      _avg:    { score: true },
      _count:  { score: true },
    }),
  ]);
  return { ratings, avgScore: agg._avg.score, totalRatings: agg._count.score };
};

module.exports = { upsertRating, deleteRating, getFilmRatings };
