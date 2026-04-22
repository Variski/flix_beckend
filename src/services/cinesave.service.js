const prisma = require('../config/prisma');

const postInclude = {
  author: { select: { id: true, username: true, avatarUrl: true } },
  media: { orderBy: { sortOrder: 'asc' } },
  filmTags: {
    include: { film: { select: { id: true, title: true, posterUrl: true } } },
  },
  hashtags: true,
  _count: { select: { comments: true, saves: true, reposts: true } },
};

// ── Toggle save ───────────────────────────────────────────────

/**
 * Save / unsave sebuah post. Bekerja seperti toggle:
 * - Jika belum disave → save
 * - Jika sudah disave → unsave
 */
const toggleSave = async (userId, postId) => {
  // Pastikan post ada
  const post = await prisma.cinePost.findUnique({
    where: { id: postId },
    select: { id: true, deletedAt: true },
  });
  if (!post || post.deletedAt) {
    const err = new Error('Post not found'); err.statusCode = 404; throw err;
  }

  const existing = await prisma.cineSave.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.cineSave.delete({ where: { userId_postId: { userId, postId } } });
    return { saved: false };
  }

  await prisma.cineSave.create({ data: { userId, postId } });
  return { saved: true };
};

// ── Get saved posts ───────────────────────────────────────────

/**
 * Ambil daftar post yang telah disimpan oleh user tertentu.
 */
const getSavedPosts = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (Number(page) - 1) * Number(limit);

  const [saves, total] = await Promise.all([
    prisma.cineSave.findMany({
      where: { userId },
      skip,
      take: Number(limit),
      orderBy: { savedAt: 'desc' },
      include: { post: { include: postInclude } },
    }),
    prisma.cineSave.count({ where: { userId } }),
  ]);

  const posts = saves
    .filter((s) => !s.post.deletedAt)
    .map((s) => s.post);

  return { posts, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
};

module.exports = { toggleSave, getSavedPosts };
