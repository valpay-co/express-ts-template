module.exports = {
  apps: [
    {
      name: 'my-app-api',
      script: 'dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'local',
        PORT: 3001,
        MONGODB_URI: 'mongodb://localhost:27017/my-app',
        JWT_SECRET: 'local_development_jwt_secret',
        LOG_LEVEL: 'debug'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
