# Stage 1: Build the application
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    g++ \
    make \
    python3 \
    libc6-compat \
    linux-headers \
    eudev-dev

WORKDIR /app

# Define build arguments
ARG NEXT_PUBLIC_RPC_URL_SEPOLIA
ARG NEXT_PUBLIC_RPC_URL_MAINNET
ARG NEXT_PUBLIC_ENV

# Set environment variables for build
ENV NEXT_PUBLIC_RPC_URL_SEPOLIA=$NEXT_PUBLIC_RPC_URL_SEPOLIA
ENV NEXT_PUBLIC_RPC_URL_MAINNET=$NEXT_PUBLIC_RPC_URL_MAINNET
ENV NEXT_PUBLIC_ENV=$NEXT_PUBLIC_ENV

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY .github/workflows .

# Build the Next.js application
RUN npm run build

# Prune dev dependencies to keep only production dependencies
RUN npm prune --production

# Stage 2: Create the production image
FROM node:18-alpine AS production

WORKDIR /app

# Copy necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Use a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]