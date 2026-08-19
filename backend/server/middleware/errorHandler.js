export const errorHandler = (err, _req, res, _next) => {
  console.error('[Error]', err.message);

  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: Object.values(err.errors)
        .map((e) => e.message)
        .join(', '),
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  if (err.code === 11000) {
    res.status(409).json({
      success: false,
      message: 'A record with this value already exists',
      code: 'DUPLICATE_ERROR',
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || 'INTERNAL_ERROR';

  res.status(statusCode).json({
    success: false,
    message,
    code,
  });
};
