# 1️ Use official Node.js LTS image
FROM node:18-alpine
LABEL maintainer="John-v77"

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# 2️ Set working directory
WORKDIR /home/node/app

# 3️ Copy package files first (better caching)
COPY package*.json ./

# 4️ Install dependencies
RUN npm install --omit=dev

# 5️ Copy all app files
COPY . .

# 6️ Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# 7️ Expose the app port
EXPOSE 3000

# 8️ Start the app
CMD ["node", "server.js"]
