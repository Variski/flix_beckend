const prisma = require('../config/prisma');

const throwNotFound = (msg = 'Post not found') => {
  const err = new Error(msg); err.statusCode = 404; throw err;
};

// ── Repost (simple) ───────────────────────────────────────────

/**
 * Buat repost biasa atau quote repost.
 * - Jika quotePostId diberikan → quote repost (ada isi teks tambahan)
 * - Jika tidak → repost polos (seperti retweet)
 *
 * quotePostId merujuk ke CinePost baru yang dibuat sebagai kutipan.
 */
const repost = async (userId, originalPostId, { quoteContent, quoteFilmIds = [], quoteHashtags = [], quoteMedia = [] } = {}) => {
  // Pastikan post asli ada
  const original = await prisma.cinePost.findUnique({
    where: { id: originalPostId },
    select: { id: true, authorId: true, deletedAt: true },
  });
  if (!original || original.deletedAt) throwNotFound();

  // Cek apakah sudah pernah repost
  const existing = await prisma.cineRepost.findUnique({
    where: { userId_originalPostId: { userId, originalPostId } },
  });
  if (existing) {
    const err = new Error('You have already reposted this'); err.statusCode = 409; throw err;
  }

  let quotePostId = null;

  // Jika ada konten kutipan → buat quote post dulu
  if (quoteContent || quoteFilmIds.length || quoteHashtags.length || quoteMedia.length) {
    const quotePost = await prisma.cinePost.create({
      data: {
        authorId: userId,
        postType: 'text',
        content: quoteContent,
        filmTags: quoteFilmIds.length ? { create: quoteFilmIds.map((filmId) => ({ filmId })) } : undefined,
        hashtags: quoteHashtags.length
          ? { create: quoteHashtags.map((h) => ({ hashtag: h.toLowerCase().replace(/^#/, '') })) }
          : undefined,
        media: quoteMedia.length
          ? { create: quoteMedia.map((m, i) => ({ mediaType: m.mediaType, url: m.url, altText: m.altText, sortOrder: i })) }
          : undefined,
      },
    });
    quotePostId = quotePost.id;
  }

  const entry = await prisma.cineRepost.create({
    data: { userId, originalPostId, quotePostId },
    include: {
      originalPost: {
        include: {
          author: { select: { id: true, username: true, avatarUrl: true } },
          media: { orderBy: { sortOrder: 'asc' } },
          filmTags: { include: { film: { select: { id: true, title: true, posterUrl: true } } } },
          hashtags: true,
        },
      },
    },
  });

  // Notifikasi ke pemilik post asli
  if (original.authorId !== userId) {
    const notifType = quotePostId ? 'quote_cinepost' : 'repost_cinepost';
    await prisma.notification.create({
      data: {
        userId: original.authorId,
        type: notifType,
        message: quotePostId ? 'Someone quoted your CineThread post' : 'Someone reposted your CineThread post',
        targetUrl: `/cinethread/${originalPostId}`,
      },
    });
  }

  return entry;
};

// ── Undo repost ───────────────────────────────────────────────

const undoRepost = async (userId, originalPostId) => {
  const entry = await prisma.cineRepost.findUnique({
    where: { userId_originalPostId: { userId, originalPostId } },
  });
  if (!entry) {
    const err = new Error('Repost not found'); err.statusCode = 404; throw err;
  }

  // Hapus quote post juga jika ada
  if (entry.quotePostId) {
    await prisma.cinePost.update({ where: { id: entry.quotePostId }, data: { deletedAt: new Date() } });
  }

  await prisma.cineRepost.delete({ where: { id: entry.id } });
};

module.exports = { repost, undoRepost };
