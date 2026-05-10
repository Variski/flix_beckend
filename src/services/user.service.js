const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

const getUserProfile = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      _count: { select: { ratings: true, reviews: true, discussions: true, followers: true, following: true } },
    },
  });
  if (!user) { const err = new Error('User not found'); err.statusCode = 404; throw err; }
  return user;
};

const updateProfile = async (id, { username, email, avatarUrl, password, displayName }) => {
  // Validasi displayName jika dikirim
  if (displayName !== undefined) {
    if (typeof displayName !== 'string' || displayName.trim().length === 0) {
      const err = new Error('displayName tidak boleh kosong');
      err.statusCode = 400;
      throw err;
    }
    if (displayName.length > 50) {
      const err = new Error('displayName maksimal 50 karakter');
      err.statusCode = 400;
      throw err;
    }
  }

  const data = {};
  if (username)               data.username    = username;
  if (email)                  data.email       = email;
  if (avatarUrl)              data.avatarUrl   = avatarUrl;
  if (password)               data.passwordHash = await bcrypt.hash(password, 12);
  if (displayName !== undefined) data.displayName = displayName;

  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      username: true,
      displayName: true,
      email: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
    },
  });
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
      select: { id: true, username: true, displayName: true, email: true, role: true, isBanned: true, createdAt: true },
    }),
    prisma.user.count({ where }),
  ]);
  return { users, total, page: Number(page), totalPages: Math.ceil(total / limit) };
};

module.exports = { getUserProfile, updateProfile, banUser, setRole, deleteUser, listUsers };
