const { Prisma } = require('@prisma/client');

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err.message);

  // ── Prisma Errors ────────────────────────────────────────
  const response = {
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    data: []
  };

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] || 'field';
      response.message = `${field} already exists`;
      return res.status(409).json(response);
    }
    if (err.code === 'P2025') {
      response.message = 'Record not found';
      return res.status(404).json(response);
    }
    if (err.code === 'P2003') {
      response.message = 'Related record not found';
      return res.status(400).json(response);
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    response.message = 'Invalid data provided';
    return res.status(400).json(response);
  }

  if (err.name === 'ZodError') {
    response.message = 'Validation error';
    response.errors = err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
    return res.status(400).json(response);
  }

  if (err.name === 'JsonWebTokenError') {
    response.message = 'Invalid token';
    return res.status(401).json(response);
  }
  if (err.name === 'TokenExpiredError') {
    response.message = 'Token expired';
    return res.status(401).json(response);
  }

  if (err.statusCode) {
    response.message = err.message;
    return res.status(err.statusCode).json(response);
  }

  res.status(500).json(response);
};

module.exports = errorHandler;
