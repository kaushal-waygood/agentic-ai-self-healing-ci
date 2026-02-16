# ---------------------------
# Build Stage
# ---------------------------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies first (for caching)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# ---------------------------
# Runtime Stage
# ---------------------------
FROM node:20-alpine

WORKDIR /app

# Copy only package.json and node_modules for production
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy built Next.js files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Set environment variable for production
ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

# Start the app
CMD ["npm", "start"]
