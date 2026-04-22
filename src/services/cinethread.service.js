const prisma = require('../config/prisma');

// ── Helpers ──────────────────────────────────────────────────

const postInclude = {
  author: { select: { id: true, username: true, avatarUrl: true } },
  media: { orderBy: { sortOrder: 'asc' } },
  filmTags: {
    include: { film: { select: { id: true, title: true, posterUrl: true } } },
  },
  hashtags: true,
  _count: { select: { comments: true, saves: true, reposts: true } },
};

const throwNotFound = (msg = 'Post not found') => {
  const err = new Error(msg);
  err.statusCode = 404;
  throw err;
};

const throwForbidden = (msg = 'Forbidden') => {
  const err = new Error(msg);
  err.statusCode = 403;
  throw err;
};

// ── Feed (public) ─────────────────────────────────────────────

/**
 * Ambil feed publik: hanya root posts (bukan thread lanjutan).
 */
const getFeed = async ({ page = 1, limit = 20, postType, hashtag } = {}) => {
  const skip = (Number(page) - 1) * Number(limit);
  const where = {
    threadRootId: null,
    deletedAt: null,
    ...(postType && { postType }),
    ...(hashtag && { hashtags: { some: { hashtag } } }),
  };

  const [posts, total] = await Promise.all([
    prisma.cinePost.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: postInclude,
    }),
    prisma.cinePost.count({ where }),
  ]);

  return { posts, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
};

// ── Get thread by root post ───────────────────────────────────

/**
 * Ambil root post beserta seluruh thread lanjutannya, terurut sesuai threadOrder.
 */
const getThread = async (rootPostId) => {
  const root = await prisma.cinePost.findUnique({
    where: { id: rootPostId },
    include: postInclude,
  });

  if (!root || root.deletedAt) throwNotFound();

  // increment view
  await prisma.cinePost.update({
    where: { id: rootPostId },
    data: { viewsCount: { increment: 1 } },
  });

  const threadItems = await prisma.cinePost.findMany({
    where: { threadRootId: rootPostId, deletedAt: null },
    orderBy: { threadOrder: 'asc' },
    include: postInclude,
  });

  return { root, threadItems };
};

// ── Get posts by user ─────────────────────────────────────────

const getPostsByUser = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (Number(page) - 1) * Number(limit);
  const where = { authorId: userId, threadRootId: null, deletedAt: null };

  const [posts, total] = await Promise.all([
    prisma.cinePost.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: postInclude,
    }),
    prisma.cinePost.count({ where }),
  ]);

  return { posts, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
};

// ── Create root post ──────────────────────────────────────────

/**
 * Buat post utama (root). Bisa berisi teks, tag film, hashtag, dan media.
 *
 * @param {string} authorId
 * @param {{ postType, content, filmIds, hashtags, media }} body
 */
const createPost = async (authorId, { postType = 'text', content, filmIds = [], hashtags = [], media = [] }) => {
  return prisma.cinePost.create({
    data: {
      authorId,
      postType,
      content,
      filmTags: filmIds.length
        ? { create: filmIds.map((filmId) => ({ filmId })) }
        : undefined,
      hashtags: hashtags.length
        ? { create: hashtags.map((h) => ({ hashtag: h.toLowerCase().replace(/^#/, '') })) }
        : undefined,
      media: media.length
        ? { create: media.map((m, i) => ({ mediaType: m.mediaType, url: m.url, altText: m.altText, sortOrder: i })) }
        : undefined,
    },
    include: postInclude,
  });
};

// ── Append thread item ────────────────────────────────────────

/**
 * Tambah post lanjutan ke sebuah thread.
 * Hanya author root post yang boleh menambahkan.
 */
const appendThread = async (authorId, rootPostId, body) => {
  const root = await prisma.cinePost.findUnique({ where: { id: rootPostId } });
  if (!root || root.deletedAt) throwNotFound('Root post not found');
  if (root.authorId !== authorId) throwForbidden('Only the thread author can add to this thread');

  // Hitung order berikutnya
  const lastItem = await prisma.cinePost.findFirst({
    where: { threadRootId: rootPostId },
    orderBy: { threadOrder: 'desc' },
    select: { threadOrder: true },
  });
  const nextOrder = (lastItem?.threadOrder ?? 0) + 1;

  const { postType = 'text', content, filmIds = [], hashtags = [], media = [] } = body;

  return prisma.cinePost.create({
    data: {
      authorId,
      threadRootId: rootPostId,
      threadOrder: nextOrder,
      postType,
      content,
      filmTags: filmIds.length ? { create: filmIds.map((filmId) => ({ filmId })) } : undefined,
      hashtags: hashtags.length
        ? { create: hashtags.map((h) => ({ hashtag: h.toLowerCase().replace(/^#/, '') })) }
        : undefined,
      media: media.length
        ? { create: media.map((m, i) => ({ mediaType: m.mediaType, url: m.url, altText: m.altText, sortOrder: i })) }
        : undefined,
    },
    include: postInclude,
  });
};

// ── Update post ───────────────────────────────────────────────

const updatePost = async (postId, authorId, { content, postType }) => {
  const post = await prisma.cinePost.findUnique({ where: { id: postId } });
  if (!post || post.deletedAt) throwNotFound();
  if (post.authorId !== authorId) throwForbidden();

  return prisma.cinePost.update({
    where: { id: postId },
    data: { content, postType },
    include: postInclude,
  });
};

// ── Soft delete post ──────────────────────────────────────────

const deletePost = async (postId, userId, role) => {
  const post = await prisma.cinePost.findUnique({ where: { id: postId } });
  if (!post || post.deletedAt) throwNotFound();
  if (post.authorId !== userId && role === 'user') throwForbidden();

  await prisma.cinePost.update({ where: { id: postId }, data: { deletedAt: new Date() } });
};

module.exports = { getFeed, getThread, getPostsByUser, createPost, appendThread, updatePost, deletePost };
