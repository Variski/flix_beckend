const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

const getUserProfile = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, username: true, avatarUrl: true,
      role: true, createdAt: true,
      _count: { select: { ratings: true, reviews: true, discussions: true, followers: true, following: true } },
    },
  });
  if (!user) { const err = new Error('User not found'); err.statusCode = 404; throw err; }
  return user;
};

const updateProfile = async (id, { username, avatarUrl, password }) => {
  const data = {};
  if (username)  data.username  = username;
  if (avatarUrl) data.avatarUrl = avatarUrl;
  if (password)  data.passwordHash = await bcrypt.hash(password, 12);
  return prisma.user.update({ where: { id }, data, select: { id: true, username: true, email: true, avatarUrl: true } });
};

const banUser = async (id, isBanned) => {
  return prisma.user.update({ where: { id }, data: { isBanned } });
};

const setRole = async (id, role) => {
  return prisma.user.update({ where: { id }, data: { role } });
};

const deleteUser = async (id) => {
  await prisma.user.delete({ where: { id } });
};

const listUsers = async ({ page = 1, limit = 20, search } = {}) => {
  const skip = (page - 1) * limit;
  const where = search ? { OR: [{ username: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] } : {};
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, skip, take: Number(limit), orderBy: { createdAt: 'desc' },
      select: { id: true, username: true, email: true, role: true, isBanned: true, createdAt: true },
    }),
    prisma.user.count({ where }),
  ]);
  return { users, total, page: Number(page), totalPages: Math.ceil(total / limit) };
};

module.exports = { getUserProfile, updateProfile, banUser, setRole, deleteUser, listUsers };
