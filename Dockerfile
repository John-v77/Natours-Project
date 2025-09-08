# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=18.17.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="NodeJS"

# NodeJS app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y python-is-python3 pkg-config build-essential 

# Copy backend package files
COPY --link backend/package*.json ./
RUN npm install --production=false

# Copy backend application code
COPY --link backend/ .

# Remove development dependencies
RUN npm prune --production


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Expose port
EXPOSE 8080

# Start the server by default, this can be overwritten at runtime
CMD [ "npm", "start" ]
