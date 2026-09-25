# ==============================================================================
# STAGE 1: Dependency Installation & Application Build
# ==============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install build tools if needed for native modules
RUN apk add --no-cache libc6-compat

# Copy package manifests first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for TypeScript compilation)
RUN npm ci

# Copy entire application source code
COPY . .

# Build the TanStack Start production bundle (Vite compilation & route trees)
RUN npm run build

# Prune devDependencies to keep runtime dependencies only
RUN npm prune --production

# ==============================================================================
# STAGE 2: Production Runtime Container
# ==============================================================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create a non-root user for security (never run Node as root in production!)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 tanstack

# Copy package manifest
COPY --from=builder /app/package.json ./

# Copy production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled application build output
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/public ./public

# Set ownership to non-root user
USER tanstack

# Expose standard application port
EXPOSE 3000

# Start the TanStack Start SSR Node server
CMD ["node", ".output/server/index.mjs"]