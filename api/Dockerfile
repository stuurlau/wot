# Build context must be the repo root (the api depends on ../shared/types):
#   docker build -f api/Dockerfile .
FROM node:22-alpine AS deps
WORKDIR /build/api
COPY api/package.json api/package-lock.json ./
COPY shared/types /build/shared/types
# npm links @wot/types as a symlink into node_modules; replace it with a real
# copy so the runtime image is self-contained (its zod dep is hoisted into
# node_modules by npm ci and resolves from the copied package).
RUN npm ci && rm -rf node_modules/@wot/types && cp -r /build/shared/types node_modules/@wot/types

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /build/api/node_modules ./node_modules
COPY api/package.json ./
COPY api/drizzle.config.ts ./
COPY api/drizzle ./drizzle
COPY api/src ./src
USER node
# Migrations deliberately do NOT run here. They are a deployment step:
# deploy/deploy.sh runs `docker compose run --rm api npm run db:migrate` with
# the new image and only recreates the api container if it succeeded.
CMD ["./node_modules/.bin/tsx", "src/server.ts"]
