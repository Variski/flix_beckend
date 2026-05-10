const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const register = async ({ username, email, password, displayName }) => {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    const field = existing.email === email ? 'Email' : 'Username';
    const err = new Error(`${field} already taken`);
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      displayName: displayName || username,
    },
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

  const token = generateToken(user.id, user.role);
  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      username: true,
      displayName: true,
      email: true,
      avatarUrl: true,
      role: true,
      isBanned: true,
      createdAt: true,
      passwordHash: true,
    },
  });

  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  if (user.isBanned) {
    const err = new Error('Your account has been banned');
    err.statusCode = 403;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken(user.id, user.role);
  const { passwordHash, ...safeUser } = user;
  return { user: safeUser, token };
};

const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      displayName: true,
      email: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          ratings: true, reviews: true,
          discussions: true, watchlists: true,
          followers: true, following: true,
        },
      },
    },
  });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

module.exports = { register, login, getMe };
