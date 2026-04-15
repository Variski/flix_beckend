const prisma = require('../config/prisma');

const createReport = async (reporterId, { targetType, targetId, reason }) => {
  return prisma.report.create({ data: { reporterId, targetType, targetId, reason } });
};

const getReports = async ({ status, page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const where = status ? { status } : {};
  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where, skip, take: Number(limit), orderBy: { createdAt: 'desc' },
      include: { reporter: { select: { id: true, username: true } }, resolver: { select: { id: true, username: true } } },
    }),
    prisma.report.count({ where }),
  ]);
  return { reports, total, page: Number(page), totalPages: Math.ceil(total / limit) };
};

const resolveReport = async (id, resolvedBy, status) => {
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) { const err = new Error('Report not found'); err.statusCode = 404; throw err; }
  return prisma.report.update({ where: { id }, data: { status, resolvedBy } });
};

module.exports = { createReport, getReports, resolveReport };
