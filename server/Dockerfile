# Build context is the repo root (see docker-compose.yml) so /shared is available.

# ---- Stage 1: builder ----
FROM node:20-slim AS builder

# Prisma engines need OpenSSL; slim images don't ship the openssl binary.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app/server

# tsconfig.json includes ../shared, so it must exist before the build.
COPY shared /app/shared

# prisma/ must be present before npm install: the postinstall hook runs
# `prisma generate`, and the build needs the generated client types.
COPY server/package*.json ./
COPY server/prisma ./prisma
RUN npm ci

COPY server ./
RUN npm run build

# ---- Stage 2: runner ----
FROM node:20-slim AS runner

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app/server
ENV NODE_ENV=production

# Production-only install; postinstall regenerates the Prisma client here.
# prisma/ is kept in the image so `npx prisma migrate deploy` works at runtime.
COPY server/package*.json ./
COPY server/prisma ./prisma
RUN npm ci --omit=dev

COPY --from=builder /app/server/dist ./dist

EXPOSE 4000
CMD ["npm", "start"]
