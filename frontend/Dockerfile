# ---------------------------
# Build Stage
# ---------------------------
FROM node:18 AS builder

WORKDIR /app

# Accept build-time arguments for env vars
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_NODE_ENV

# Export them so Next.js can see them during build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_NODE_ENV=$NEXT_PUBLIC_NODE_ENV

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy full project
COPY . .

# Build Next.js app (env vars are now baked into the bundle)
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

# Copy built files and public assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000

CMD ["npm", "start"]
