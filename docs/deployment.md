# Deployment

## Overview

- API runs as a Docker container (`ghcr.io/stuurlau/wot-api:latest`) on the home server, reached at `https://wot-api.lau-soft.com` via a Cloudflare Tunnel (no open router ports).
- Pushes to `main` (paths `api/**`, `shared/**`) run checks in GitHub Actions, build the image, and push `:latest` (+ a sha tag) to GHCR.
- Watchtower on the server polls every 5 min and recreates the container when the image changes.
- Migrations run on container start (`drizzle-kit migrate` in the image CMD).

## One-time server setup

1. **Cloudflare** — add `lau-soft.com` (or delegate the zone) to Cloudflare and update the nameservers at the registrar.
2. **Tunnel** — in the Cloudflare Zero Trust dashboard: Networks → Tunnels → Create tunnel → copy the token. Add a public hostname `wot-api.lau-soft.com` → service `http://wot-api:3000`. Put the token in `deploy/.env` as `TUNNEL_TOKEN`.
3. **Env** — on the server: `mkdir -p ~/wot-deploy`, copy `deploy/docker-compose.yml` and `.env.example` → `.env`, fill in `DATABASE_URL` (point at the db already running there), `API_URL`, `CORS_ORIGIN`, `BETTER_AUTH_SECRET` (`openssl rand -hex 32`), `TUNNEL_TOKEN`.
4. **GHCR access** — `docker login ghcr.io` once if the image is private (PAT with read:packages; the login is read by watchtower via `~/.docker/config.json`). Or make the package public in the repo's package settings so no login is needed.
5. **Start** — `docker compose up -d`. Watchtower picks every subsequent image push automatically.

## Building the image locally (manual)

    docker build -f api/Dockerfile -t ghcr.io/stuurlau/wot-api:latest .

## Android test client

The `preview` EAS profile bakes `EXPO_PUBLIC_API_URL=https://wot-api.lau-soft.com` into a standalone APK:

    cd mobile-client
    npx eas login   # first time
    npm run build:preview

Download the APK from the EAS link and sideload it on the phone. For local dev against `localhost`, keep using `npx expo start` (Expo Go).

## CI notes

- Workflow: `.github/workflows/deploy-api.yml` — typecheck + unit tests, then buildx build with GHA cache.
- `shared/types` is part of the build context (see root `.dockerignore`); changes there also trigger a deploy.
- Rollback: `docker pull ghcr.io/stuurlau/wot-api:<sha>` and pin the tag in `docker-compose.yml`, then `docker compose up -d`.
