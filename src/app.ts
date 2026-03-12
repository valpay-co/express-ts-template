import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './config/database';
import config from './config';
import logger from './utils/logger';
import errorHandler from './middlewares/errorHandler';
import { correlationId } from './middlewares/correlationId';
import { generalLimiter } from './middlewares/rateLimiter';
import swaggerSpec from './config/swagger';
import AppError from './utils/appError';
import routes from './routes';

// Initialize Express application
const app: Application = express();

// Connect to MongoDB
connectDB();

// Correlation ID — must be first so all downstream middleware/routes have access
app.use(correlationId);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
morgan.token('correlation-id', (req: Request) => req.correlationId || '-');
app.use(morgan(':correlation-id :method :url :status :res[content-length] - :response-time ms', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));

// Rate limiter
app.use('/api', generalLimiter);

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check route
app.get('/api/health', async (req: Request, res: Response) => {
  const health: Record<string, any> = {
    status: 'success',
    message: 'API is running',
    environment: config.nodeEnv,
    timestamp: new Date(),
    services: {},
  };

  // MongoDB status
  try {
    const mongoState = mongoose.connection.readyState;
    const mongoStates: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    health.services.mongodb = {
      status: mongoState === 1 ? 'healthy' : 'unhealthy',
      state: mongoStates[mongoState] || 'unknown',
    };
  } catch {
    health.services.mongodb = { status: 'unhealthy', state: 'error' };
  }

  // Redis status
  try {
    const IORedis = (await import('ioredis')).default;
    const redis = new IORedis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      connectTimeout: 3000,
      lazyConnect: true,
    });
    await redis.connect();
    const pong = await redis.ping();
    health.services.redis = {
      status: pong === 'PONG' ? 'healthy' : 'unhealthy',
    };
    await redis.quit();
  } catch {
    health.services.redis = { status: 'unhealthy', error: 'Connection failed' };
  }

  const overallHealthy = health.services.mongodb?.status === 'healthy';
  res.status(overallHealthy ? 200 : 503).json(health);
});

// API routes
app.use('/api', routes);

// 404 handler
app.use('*', (req: Request, res: Response, next: NextFunction) => {
  logger.warn(`Route not found: ${req.originalUrl}`);
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Error handling middleware
app.use(errorHandler);

export default app;
