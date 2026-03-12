import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

const SAFE_ID_PATTERN = /^[a-zA-Z0-9\-_]{1,128}$/;

export const correlationId = (req: Request, res: Response, next: NextFunction): void => {
  const raw =
    (req.headers['x-correlation-id'] as string) ||
    (req.headers['x-request-id'] as string) ||
    '';

  const id = (raw && SAFE_ID_PATTERN.test(raw)) ? raw : crypto.randomUUID();

  req.correlationId = id;
  res.setHeader('X-Correlation-ID', id);
  next();
};
