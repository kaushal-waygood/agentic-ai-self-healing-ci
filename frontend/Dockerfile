FROM node:18 AS builder

WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Copy the full project
COPY . .

# Build Next.js app
RUN npm run build

# ---------------------------
# Runtime Stage
# ---------------------------
FROM node:18-slim

WORKDIR /app



ENV NODE_ENV=production
ENV PORT=3000

# Copy only what’s needed for production
COPY --from=builder /app/package*.json ./
RUN npm install --only=production

# Copy built files and .next
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000

CMD ["npm", "start"]
