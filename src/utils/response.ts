import { Response } from 'express';
import logger from './logger';

export const successResponse = (
  res: Response,
  data: any = {},
  statusCode: number = 200
): Response => {
  logger.info('Success response', { statusCode, data });
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

export const errorResponse = (
  res: Response,
  message: string = 'Internal server error',
  statusCode: number = 500,
  error: any = null
): Response => {
  logger.error('Error response', { statusCode, message, error });
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(error && { details: error }),
    },
  });
};

export const validationErrorResponse = (
  res: Response,
  errors: any
): Response => {
  logger.warn('Validation error response', { errors });
  return res.status(400).json({
    success: false,
    error: {
      message: 'Validation error',
      details: errors,
    },
  });
};
