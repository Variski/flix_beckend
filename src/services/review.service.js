const prisma = require('../config/prisma');

const getReviews = async (filmId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where:   { filmId, deletedAt: null },
      skip,
      take:    Number(limit),
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, username: true, avatarUrl: true } } },
    }),
    prisma.review.count({ where: { filmId, deletedAt: null } }),
  ]);
  return { reviews, total, page: Number(page), totalPages: Math.ceil(total / limit) };
};

const createReview = async (userId, filmId, { content, isSpoiler = false }) => {
  return prisma.review.create({
    data:    { userId, filmId, content, isSpoiler },
    include: { user: { select: { id: true, username: true, avatarUrl: true } } },
  });
};

const updateReview = async (id, userId, { content, isSpoiler }) => {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review || review.deletedAt) {
    const err = new Error('Review not found'); err.statusCode = 404; throw err;
  }
  if (review.userId !== userId) {
    const err = new Error('Forbidden'); err.statusCode = 403; throw err;
  }
  return prisma.review.update({ where: { id }, data: { content, isSpoiler } });
};

const deleteReview = async (id, userId, role) => {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review || review.deletedAt) {
    const err = new Error('Review not found'); err.statusCode = 404; throw err;
  }
  if (review.userId !== userId && role === 'user') {
    const err = new Error('Forbidden'); err.statusCode = 403; throw err;
  }
  // Soft delete
  await prisma.review.update({ where: { id }, data: { deletedAt: new Date() } });
};

module.exports = { getReviews, createReview, updateReview, deleteReview };
