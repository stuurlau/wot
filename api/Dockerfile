# Build context must be the repo root (the api depends on ../shared/types):
#   docker build -f api/Dockerfile .
FROM node:22-alpine AS deps
WORKDIR /build/api
COPY api/package.json api/package-lock.json ./
COPY shared/types /build/shared/types
RUN npm ci

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /build/api/node_modules ./node_modules
COPY api/package.json ./
COPY api/drizzle.config.ts ./
COPY api/drizzle ./drizzle
COPY api/src ./src
USER node
# Apply pending drizzle migrations before booting the server.
CMD ["sh", "-c", "./node_modules/.bin/drizzle-kit migrate && exec ./node_modules/.bin/tsx src/server.ts"]
