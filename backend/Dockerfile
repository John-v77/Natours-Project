# Use official Node.js LTS image
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory and set permissions
RUN mkdir -p /app && addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy all app files
COPY . .

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Set environment variables
ENV NODE_ENV=dev
ENV PORT=8080

# Expose the app port (Fly.io typically uses 8080)
EXPOSE 8080

# Use dumb-init for proper signal handling
CMD ["dumb-init", "node", "server.js"]