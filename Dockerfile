# Single stage build
FROM public.ecr.aws/docker/library/node:lts

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port (3000 for production)
EXPOSE 3000

# Set essential environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "dist/server.js"]
