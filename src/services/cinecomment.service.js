const prisma = require('../config/prisma');

const throwNotFound = (msg = 'Comment not found') => {
  const err = new Error(msg); err.statusCode = 404; throw err;
};
const throwForbidden = (msg = 'Forbidden') => {
  const err = new Error(msg); err.statusCode = 403; throw err;
};

const commentInclude = {
  author: { select: { id: true, username: true, avatarUrl: true } },
  _count: { select: { replies: true } },
};

// ── Get comments for a post ───────────────────────────────────

/**
 * Ambil top-level comments (bukan nested reply) dari sebuah post.
 */
const getComments = async (postId, { page = 1, limit = 20 } = {}) => {
  const skip = (Number(page) - 1) * Number(limit);
  const where = { postId, parentCommentId: null, deletedAt: null };

  const [comments, total] = await Promise.all([
    prisma.cineComment.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'asc' },
      include: commentInclude,
    }),
    prisma.cineComment.count({ where }),
  ]);

  return { comments, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
};

// ── Get replies for a comment ─────────────────────────────────

const getReplies = async (commentId, { page = 1, limit = 20 } = {}) => {
  const skip = (Number(page) - 1) * Number(limit);
  const where = { parentCommentId: commentId, deletedAt: null };

  const [replies, total] = await Promise.all([
    prisma.cineComment.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'asc' },
      include: commentInclude,
    }),
    prisma.cineComment.count({ where }),
  ]);

  return { replies, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
};

// ── Add comment to a post ─────────────────────────────────────

const addComment = async (authorId, postId, { content }) => {
  // Pastikan post ada dan belum dihapus
  const post = await prisma.cinePost.findUnique({ where: { id: postId }, select: { id: true, authorId: true, deletedAt: true } });
  if (!post || post.deletedAt) {
    const err = new Error('Post not found'); err.statusCode = 404; throw err;
  }

  const comment = await prisma.cineComment.create({
    data: { postId, authorId, content },
    include: commentInclude,
  });

  // Notifikasi ke pemilik post (jika bukan diri sendiri)
  if (post.authorId !== authorId) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        type: 'comment_cinepost',
        message: 'Someone commented on your CineThread post',
        targetUrl: `/cinethread/${postId}`,
      },
    });
  }

  return comment;
};

// ── Reply to a comment ────────────────────────────────────────

const replyToComment = async (authorId, parentCommentId, { content }) => {
  const parent = await prisma.cineComment.findUnique({
    where: { id: parentCommentId },
    select: { id: true, postId: true, authorId: true, deletedAt: true },
  });
  if (!parent || parent.deletedAt) throwNotFound('Parent comment not found');

  const reply = await prisma.cineComment.create({
    data: { postId: parent.postId, authorId, parentCommentId, content },
    include: commentInclude,
  });

  // Notifikasi ke pemilik komentar induk
  if (parent.authorId !== authorId) {
    await prisma.notification.create({
      data: {
        userId: parent.authorId,
        type: 'reply_cinecomment',
        message: 'Someone replied to your comment',
        targetUrl: `/cinethread/${parent.postId}`,
      },
    });
  }

  return reply;
};

// ── Delete comment ────────────────────────────────────────────

const deleteComment = async (commentId, userId, role) => {
  const comment = await prisma.cineComment.findUnique({ where: { id: commentId } });
  if (!comment || comment.deletedAt) throwNotFound();
  if (comment.authorId !== userId && role === 'user') throwForbidden();

  await prisma.cineComment.update({ where: { id: commentId }, data: { deletedAt: new Date() } });
};

module.exports = { getComments, getReplies, addComment, replyToComment, deleteComment };
