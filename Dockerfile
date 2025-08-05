# Islamic Quiz Card Game - Docker Configuration
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    curl

# Copy package files
COPY package*.json ./
COPY mobile/package*.json ./mobile/

# Install ALL dependencies (including dev) for build step
RUN npm ci

# Install mobile dependencies
WORKDIR /app/mobile
RUN npm ci

# Go back to app directory
WORKDIR /app

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Remove dev dependencies after build to reduce image size
RUN npm prune --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Start the application
CMD ["npm", "start"]