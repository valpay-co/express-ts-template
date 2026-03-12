import app from './app';
import config from './config';
import logger from './utils/logger';

// Uncaught exception handler
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

// Validate required secrets before starting
if (!config.jwtSecret) {
  logger.error('Missing required JWT_SECRET. Server cannot start.');
  process.exit(1);
}

// Start server
const server = app.listen(config.port, () => {
  logger.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
});

// Unhandled rejection handler
process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

// SIGTERM handler
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});
