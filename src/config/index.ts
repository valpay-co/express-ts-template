import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the appropriate .env file
let envFile = '.env';
if (process.env.NODE_ENV === 'production') {
  envFile = '.env.production';
} else if (process.env.NODE_ENV === 'test') {
  envFile = '.env.test';
} else if (process.env.NODE_ENV === 'local') {
  envFile = '.env.local';
}

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/my-app',
  jwtSecret: process.env.JWT_SECRET || 'test-jwt-secret',
  logLevel: process.env.LOG_LEVEL || 'info',
  appUrl: process.env.APP_URL || 'http://localhost:3000',

  // Redis (for Bull job queues)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  // AWS (optional)
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET || '',
  },
};

export default config;
