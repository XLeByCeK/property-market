import { ErrorRequestHandler } from 'express';
import { HttpError } from '../utils/http-errors';
import { logger } from '../utils/logger';
import config from '../config';

/**
 * Централизованный обработчик ошибок. Если ошибка — HttpError, отдаёт её статус
 * и сообщение, иначе возвращает 500 и логирует стек.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, ...(err.details ? { details: err.details } : {}) });
    return;
  }

  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Something went wrong!',
    message: config.environment === 'development' ? (err as Error)?.message : undefined,
  });
};
