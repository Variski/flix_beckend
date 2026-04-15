const prisma = require('../config/prisma');

const getDiscussions = async (filmId, { page = 1, limit = 20, category } = {}) => {
  const skip = (page - 1) * limit;
  const where = { filmId, deletedAt: null };
  if (category) where.category = category;

  const [discussions, total] = await Promise.all([
    prisma.discussion.findMany({
      where, skip, take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        tags: true,
        _count: { select: { replies: true, likes: true } },
      },
    }),
    prisma.discussion.count({ where }),
  ]);
  return { discussions, total, page: Number(page), totalPages: Math.ceil(total / limit) };
};

const getDiscussionById = async (id) => {
  const discussion = await prisma.discussion.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true, avatarUrl: true } },
      film: { select: { id: true, title: true, posterUrl: true } },
      tags: true,
      _count: { select: { replies: true, likes: true } },
    },
  });
  if (!discussion || discussion.deletedAt) {
    const err = new Error('Discussion not found'); err.statusCode = 404; throw err;
  }
  // Increment view count
  await prisma.discussion.update({ where: { id }, data: { viewsCount: { increment: 1 } } });
  return discussion;
};

const createDiscussion = async (userId, filmId, { title, body, category = 'general', tags = [] }) => {
  return prisma.discussion.create({
    data: {
      userId, filmId, title, body, category,
      tags: tags.length ? { create: tags.map((tag) => ({ tag })) } : undefined,
    },
    include: {
      user: { select: { id: true, username: true, avatarUrl: true } },
      tags: true,
    },
  });
};

const updateDiscussion = async (id, userId, data) => {
  const discussion = await prisma.discussion.findUnique({ where: { id } });
  if (!discussion || discussion.deletedAt) {
    const err = new Error('Discussion not found'); err.statusCode = 404; throw err;
  }
  if (discussion.userId !== userId) {
    const err = new Error('Forbidden'); err.statusCode = 403; throw err;
  }
  return prisma.discussion.update({ where: { id }, data: { title: data.title, body: data.body, category: data.category } });
};

const deleteDiscussion = async (id, userId, role) => {
  const discussion = await prisma.discussion.findUnique({ where: { id } });
  if (!discussion || discussion.deletedAt) {
    const err = new Error('Discussion not found'); err.statusCode = 404; throw err;
  }
  if (discussion.userId !== userId && role === 'user') {
    const err = new Error('Forbidden'); err.statusCode = 403; throw err;
  }
  await prisma.discussion.update({ where: { id }, data: { deletedAt: new Date() } });
};

module.exports = { getDiscussions, getDiscussionById, createDiscussion, updateDiscussion, deleteDiscussion };
