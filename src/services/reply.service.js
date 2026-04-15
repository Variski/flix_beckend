const prisma = require('../config/prisma');

const getReplies = async (discussionId) => {
  // Get top-level replies with nested children
  return prisma.discussionReply.findMany({
    where:   { discussionId, parentReplyId: null, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { id: true, username: true, avatarUrl: true } },
      _count: { select: { likes: true } },
      children: {
        where:   { deletedAt: null },
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
          _count: { select: { likes: true } },
        },
      },
    },
  });
};

const createReply = async (userId, discussionId, { body, parentReplyId = null }) => {
  const discussion = await prisma.discussion.findUnique({ where: { id: discussionId } });
  if (!discussion || discussion.deletedAt) {
    const err = new Error('Discussion not found'); err.statusCode = 404; throw err;
  }

  if (parentReplyId) {
    const parent = await prisma.discussionReply.findUnique({ where: { id: parentReplyId } });
    if (!parent) { const err = new Error('Parent reply not found'); err.statusCode = 404; throw err; }
  }

  const reply = await prisma.discussionReply.create({
    data: { userId, discussionId, body, parentReplyId },
    include: { user: { select: { id: true, username: true, avatarUrl: true } } },
  });

  // Notify discussion author if it's a direct reply
  if (discussion.userId !== userId) {
    await prisma.notification.create({
      data: {
        userId:    discussion.userId,
        type:      parentReplyId ? 'nested_reply' : 'reply_thread',
        message:   `Someone replied to your discussion "${discussion.title}"`,
        targetUrl: `/discussions/${discussionId}`,
      },
    });
  }

  return reply;
};

const updateReply = async (id, userId, body) => {
  const reply = await prisma.discussionReply.findUnique({ where: { id } });
  if (!reply || reply.deletedAt) { const err = new Error('Reply not found'); err.statusCode = 404; throw err; }
  if (reply.userId !== userId) { const err = new Error('Forbidden'); err.statusCode = 403; throw err; }
  return prisma.discussionReply.update({ where: { id }, data: { body } });
};

const deleteReply = async (id, userId, role) => {
  const reply = await prisma.discussionReply.findUnique({ where: { id } });
  if (!reply || reply.deletedAt) { const err = new Error('Reply not found'); err.statusCode = 404; throw err; }
  if (reply.userId !== userId && role === 'user') { const err = new Error('Forbidden'); err.statusCode = 403; throw err; }
  await prisma.discussionReply.update({ where: { id }, data: { deletedAt: new Date() } });
};

module.exports = { getReplies, createReply, updateReply, deleteReply };
