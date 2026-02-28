# ---------------------------
# Build Stage (CI/CD optimized)
# ---------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Arguments for Build-time Env Vars
ARG NEXT_PUBLIC_NODE_ENV
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_LOGROCKET_ID
ARG NEXT_PUBLIC_SOCKET_URL
ARG NEXT_PUBLIC_LINKEDIN_CLIENT_ID

ENV NEXT_PUBLIC_NODE_ENV=$NEXT_PUBLIC_NODE_ENV
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_LOGROCKET_ID=$NEXT_PUBLIC_LOGROCKET_ID
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_LINKEDIN_CLIENT_ID=$NEXT_PUBLIC_LINKEDIN_CLIENT_ID

COPY package*.json ./
# Use 'npm ci' for faster, more reliable CI/CD builds
RUN npm ci 

COPY . .
RUN npm run build

# ---------------------------
# Runtime Stage
# ---------------------------
FROM node:20-slim
WORKDIR /app

# Install PM2 globally in the runtime image
RUN npm install pm2 -g

ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary production files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

# Install only production dependencies
RUN npm install --only=production

# Expose port
EXPOSE 3000

# Use PM2 to run the application
# 'pm2-runtime' is designed specifically for Docker containers
CMD ["pm2-runtime", "start", "npm", "--", "start"]