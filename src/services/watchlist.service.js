const crypto = require('crypto');
const prisma = require('../config/prisma');

const generateShareCode = () => crypto.randomBytes(6).toString('hex'); // 12 chars

const getMyWatchlists = async (userId) => {
  return prisma.watchlist.findMany({
    where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
    include: {
      _count:   { select: { items: true, members: true } },
      members:  { include: { user: { select: { id: true, username: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getWatchlistById = async (id, userId) => {
  const wl = await prisma.watchlist.findUnique({
    where: { id },
    include: {
      owner:   { select: { id: true, username: true } },
      items:   { include: { film: { select: { id: true, title: true, posterUrl: true, imdbRating: true } } } },
      members: { include: { user: { select: { id: true, username: true, avatarUrl: true } } } },
    },
  });
  if (!wl) { const err = new Error('Watchlist not found'); err.statusCode = 404; throw err; }

  const isMember = wl.ownerId === userId || wl.members.some((m) => m.userId === userId);
  if (!isMember) { const err = new Error('Access denied'); err.statusCode = 403; throw err; }
  return wl;
};

const createWatchlist = async (userId, { name = 'My Watchlist', isShared = false }) => {
  const shareCode = isShared ? generateShareCode() : null;
  return prisma.watchlist.create({ data: { ownerId: userId, name, isShared, shareCode } });
};

const updateWatchlist = async (id, userId, data) => {
  const wl = await prisma.watchlist.findUnique({ where: { id } });
  if (!wl) { const err = new Error('Watchlist not found'); err.statusCode = 404; throw err; }
  if (wl.ownerId !== userId) { const err = new Error('Forbidden'); err.statusCode = 403; throw err; }

  const updates = { name: data.name };
  if (data.isShared !== undefined) {
    updates.isShared = data.isShared;
    updates.shareCode = data.isShared ? (wl.shareCode || generateShareCode()) : null;
  }
  return prisma.watchlist.update({ where: { id }, data: updates });
};

const deleteWatchlist = async (id, userId) => {
  const wl = await prisma.watchlist.findUnique({ where: { id } });
  if (!wl) { const err = new Error('Watchlist not found'); err.statusCode = 404; throw err; }
  if (wl.ownerId !== userId) { const err = new Error('Forbidden'); err.statusCode = 403; throw err; }
  await prisma.watchlist.delete({ where: { id } });
};

const addItem = async (watchlistId, userId, filmId) => {
  await assertEditorAccess(watchlistId, userId);
  return prisma.watchlistItem.create({ data: { watchlistId, filmId } });
};

const removeItem = async (watchlistId, userId, filmId) => {
  await assertEditorAccess(watchlistId, userId);
  await prisma.watchlistItem.delete({ where: { watchlistId_filmId: { watchlistId, filmId } } });
};

const toggleWatched = async (watchlistId, userId, filmId) => {
  await assertEditorAccess(watchlistId, userId);
  const item = await prisma.watchlistItem.findUnique({ where: { watchlistId_filmId: { watchlistId, filmId } } });
  if (!item) { const err = new Error('Item not found'); err.statusCode = 404; throw err; }
  return prisma.watchlistItem.update({ where: { watchlistId_filmId: { watchlistId, filmId } }, data: { isWatched: !item.isWatched } });
};

const joinByShareCode = async (userId, shareCode) => {
  const wl = await prisma.watchlist.findUnique({ where: { shareCode } });
  if (!wl || !wl.isShared) { const err = new Error('Invalid share code'); err.statusCode = 404; throw err; }
  if (wl.ownerId === userId) { const err = new Error('You are already the owner'); err.statusCode = 400; throw err; }
  return prisma.watchlistMember.upsert({
    where:  { watchlistId_userId: { watchlistId: wl.id, userId } },
    create: { watchlistId: wl.id, userId, role: 'viewer' },
    update: {},
  });
};

const addMember = async (watchlistId, ownerId, { userId, role = 'viewer' }) => {
  const wl = await prisma.watchlist.findUnique({ where: { id: watchlistId } });
  if (!wl) { const err = new Error('Watchlist not found'); err.statusCode = 404; throw err; }
  if (wl.ownerId !== ownerId) { const err = new Error('Forbidden'); err.statusCode = 403; throw err; }
  return prisma.watchlistMember.upsert({
    where:  { watchlistId_userId: { watchlistId, userId } },
    create: { watchlistId, userId, role },
    update: { role },
  });
};

const removeMember = async (watchlistId, ownerId, userId) => {
  const wl = await prisma.watchlist.findUnique({ where: { id: watchlistId } });
  if (!wl) { const err = new Error('Watchlist not found'); err.statusCode = 404; throw err; }
  if (wl.ownerId !== ownerId) { const err = new Error('Forbidden'); err.statusCode = 403; throw err; }
  await prisma.watchlistMember.delete({ where: { watchlistId_userId: { watchlistId, userId } } });
};

// Helper: check if user is owner or editor
const assertEditorAccess = async (watchlistId, userId) => {
  const wl = await prisma.watchlist.findUnique({
    where:   { id: watchlistId },
    include: { members: true },
  });
  if (!wl) { const err = new Error('Watchlist not found'); err.statusCode = 404; throw err; }
  const isOwner  = wl.ownerId === userId;
  const isEditor = wl.members.some((m) => m.userId === userId && m.role === 'editor');
  if (!isOwner && !isEditor) { const err = new Error('Access denied'); err.statusCode = 403; throw err; }
};

module.exports = { getMyWatchlists, getWatchlistById, createWatchlist, updateWatchlist, deleteWatchlist, addItem, removeItem, toggleWatched, joinByShareCode, addMember, removeMember };
