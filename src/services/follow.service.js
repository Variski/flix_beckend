const prisma = require('../config/prisma');

const follow = async (followerId, followingId) => {
  if (followerId === followingId) {
    const err = new Error('Cannot follow yourself'); err.statusCode = 400; throw err;
  }
  const target = await prisma.user.findUnique({ where: { id: followingId } });
  if (!target) { const err = new Error('User not found'); err.statusCode = 404; throw err; }

  await prisma.follow.upsert({
    where:  { followerId_followingId: { followerId, followingId } },
    create: { followerId, followingId },
    update: {},
  });

  // Notify
  await prisma.notification.create({
    data: { userId: followingId, type: 'new_follower', message: `Someone started following you`, targetUrl: `/users/${followerId}` },
  });

  return { following: true };
};

const unfollow = async (followerId, followingId) => {
  const rel = await prisma.follow.findUnique({ where: { followerId_followingId: { followerId, followingId } } });
  if (!rel) { const err = new Error('Not following'); err.statusCode = 400; throw err; }
  await prisma.follow.delete({ where: { followerId_followingId: { followerId, followingId } } });
  return { following: false };
};

const getFollowers = async (userId) => {
  return prisma.follow.findMany({
    where: { followingId: userId },
    include: { follower: { select: { id: true, username: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

const getFollowing = async (userId) => {
  return prisma.follow.findMany({
    where: { followerId: userId },
    include: { following: { select: { id: true, username: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

module.exports = { follow, unfollow, getFollowers, getFollowing };
