const prisma = require('../config/prisma');

const getNotifications = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId }, skip, take: Number(limit), orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);
  return { notifications, total, unreadCount, page: Number(page), totalPages: Math.ceil(total / limit) };
};

const markRead = async (id, userId) => {
  const notif = await prisma.notification.findUnique({ where: { id } });
  if (!notif || notif.userId !== userId) { const err = new Error('Not found'); err.statusCode = 404; throw err; }
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
};

const markAllRead = async (userId) => {
  await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
};

const deleteNotification = async (id, userId) => {
  const notif = await prisma.notification.findUnique({ where: { id } });
  if (!notif || notif.userId !== userId) { const err = new Error('Not found'); err.statusCode = 404; throw err; }
  await prisma.notification.delete({ where: { id } });
};

module.exports = { getNotifications, markRead, markAllRead, deleteNotification };
