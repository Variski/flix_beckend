const prisma = require('../config/prisma');

const toggleLike = async (userId, { targetType, targetId }) => {
  const existing = await prisma.like.findUnique({
    where: { userId_targetType_targetId: { userId, targetType, targetId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return { liked: false };
  }

  await prisma.like.create({ data: { userId, targetType, targetId } });

  // Create notification for the target owner
  let ownerId = null;
  if (targetType === 'discussion') {
    const d = await prisma.discussion.findUnique({ where: { id: targetId }, select: { userId: true, title: true } });
    if (d && d.userId !== userId) {
      ownerId = d.userId;
      await prisma.notification.create({
        data: { userId: ownerId, type: 'like_discussion', message: `Someone liked your discussion "${d.title}"`, targetUrl: `/discussions/${targetId}` },
      });
    }
  } else if (targetType === 'reply') {
    const r = await prisma.discussionReply.findUnique({ where: { id: targetId }, select: { userId: true } });
    if (r && r.userId !== userId) {
      await prisma.notification.create({
        data: { userId: r.userId, type: 'like_reply', message: 'Someone liked your reply', targetUrl: `/discussions` },
      });
    }
  } else if (targetType === 'cinepost') {
    const p = await prisma.cinePost.findUnique({ where: { id: targetId }, select: { authorId: true } });
    if (p && p.authorId !== userId) {
      await prisma.notification.create({
        data: { userId: p.authorId, type: 'like_cinepost', message: 'Someone liked your CineThread post', targetUrl: `/cinethread/${targetId}` },
      });
    }
  } else if (targetType === 'cinecomment') {
    const c = await prisma.cineComment.findUnique({ where: { id: targetId }, select: { authorId: true } });
    if (c && c.authorId !== userId) {
      await prisma.notification.create({
        data: { userId: c.authorId, type: 'like_cinepost', message: 'Someone liked your comment', targetUrl: `/cinethread` },
      });
    }
  }

  return { liked: true };
};

module.exports = { toggleLike };
