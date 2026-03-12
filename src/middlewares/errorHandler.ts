import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';
import logger from '../utils/logger';

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  logger.error('Error handler middleware caught error:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  const statusCode = (err as any).statusCode || 500;
  const message = err.message || 'Internal server error';

  return errorResponse(res, message, statusCode,
    process.env.NODE_ENV === 'development' ? err.stack : undefined);
};

export default errorHandler;
