# ---------------------------
# Stage 1: Dependencies
# ---------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm install

# ---------------------------
# Stage 2: Builder
# ---------------------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables
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

RUN npm run build

# ---------------------------
# Stage 3: Runner (Production)
# ---------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only necessary files from builder
COPY --from=builder /app/public ./public

# Set correct permissions for the .next directory
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverages output: 'standalone' from next.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Start using the standalone server
CMD ["node", "server.js"]