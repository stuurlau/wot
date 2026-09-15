# Deployment (staging on the home server)

**Deployment branch:** `master` (the plan calls it `main`; rename on GitHub and
update the two workflow files if you prefer that name).

**Public hostname:** `https://wot-api.wot-app.com`

## Architecture

| Piece | Where | Purpose |
|---|---|---|
| Fastify backend | Docker image `ghcr.io/stuurlau/wot-api` | Runs on the home server (BIG) |
| Drizzle database migrations | Part of the backend image | Applied by the deploy script, not at container start |
| PostgreSQL | Already running on BIG, external to the stack | Reached via `DATABASE_URL` |
| Cloudflare Tunnel (`cloudflared`) | Docker container next to the API | Exposes `wot-api.wot-app.com` with outbound-only networking |
| GitHub Actions | GitHub-hosted runners | Checks + publishes the image to GHCR; **never deploys to the server** |
| deploy.sh + systemd timer | BIG (`~/wot-deploy`) | Pulls new images, migrates, restarts the API every 5 min |
| Mobile client | Expo/EAS builds via GitHub Actions | Test APKs distributed through a GitHub Release |

The server only ever makes **outbound** connections (to GHCR and Cloudflare).
GitHub never gets shell access to the server and no router port forwarding is
needed. This works unchanged whether the repo is private or becomes public —
that is the security boundary:

- GitHub can publish an image to GHCR.
- The home server can pull from GHCR.
- GitHub Actions does not receive access to the home network.

## Backend deployment flow

    push to master → GitHub Actions → typecheck + unit tests → docker build
      → push image to GHCR (latest + sha tag)
      → BIG's timer notices the digest changed
      → pull image → run Drizzle migrations with the new image
      → only if migrations succeeded → restart API
      → if migrations failed → abort, existing API keeps running

## GitHub Actions — `.github/workflows/api.yml`

Triggers on PRs and on pushes to `master` (paths: `api/**`, `shared/**`):

1. checkout → npm ci → typecheck → unit tests
2. build the Docker image (on PRs only to validate the Dockerfile — no push)
3. on pushes to `master`: log in to GHCR and push the image

Tags: `ghcr.io/stuurlau/wot-api:latest` plus `ghcr.io/stuurlau/wot-api:sha-<commit>`
(e.g. `:sha-8f32a91`). The sha tags enable rollback to any deployed version.

## Home server stack — `deploy/docker-compose.yml`

Services (`restart: unless-stopped` on both):

- **api** — `ghcr.io/stuurlau/wot-api:latest`. No port is published to the
  internet; cloudflared reaches it over the compose network as `http://api:3000`.
- **cloudflared** — Cloudflare Tunnel, token via `TUNNEL_TOKEN` in `.env`.
- PostgreSQL is **not** part of this stack; it already runs on BIG and is
  reached through `DATABASE_URL` (see `deploy/.env.example`).

## Automatic deployment — `deploy/deploy.sh`

A systemd timer (or cron) runs `deploy.sh` every 5 minutes:

1. `docker compose pull api` — cheap manifest check; layers only download
   when GHCR has a new image.
2. Compare the running container's image ID with the pulled `:latest` image ID.
   Equal → exit (no unnecessary migration runs or restarts).
3. New image → `docker compose run --rm api npm run db:migrate` — migrations
   run in a one-off container of the **new** image while the old API still
   serves traffic.
4. `set -e`: if the migration fails, the script aborts here and the running
   API is untouched. It will retry on the next timer run.
5. Migrations OK → `docker compose up -d api` — recreate the container on the
   new image.

Migrations are intentionally **not** part of the image CMD. Migration is a
deployment operation, separate from app startup — this also stays correct if
the API is ever scaled to multiple containers, which must not race each other
applying migrations at boot.

## Migration compatibility (expand & contract)

The window between "migration applied" and "new API running" is small on a
single-instance staging box, but keep migrations backwards-compatible with the
currently running API anyway — the same pattern carries over to production:

1. Add the new database field (expand).
2. Deploy an API version that uses the new field.
3. Migrate/backfill existing data if necessary.
4. Later, remove the old field (contract).

So avoid a migration that immediately drops a column the running API still
uses; the deploy script would then restart the API into a crash loop.

## First-time setup

### 1. Cloudflare (Zero Trust dashboard)

`wot-app.com` is registered at Cloudflare, so DNS is already active.

1. Zero Trust → **Networks → Tunnels → Create a tunnel** (Cloudflared) → copy
   the tunnel token.
2. Add a **public hostname**: `wot-api.wot-app.com` → service `http://api:3000`.
3. Keep the token for the server's `.env` (`TUNNEL_TOKEN`).

### 2. Home server (BIG)

```bash
mkdir -p ~/wot-deploy
# from the repo checkout on your laptop:
scp deploy/docker-compose.yml deploy/deploy.sh deploy/.env.example BIG:~/wot-deploy/
chmod +x ~/wot-deploy/deploy.sh

cd ~/wot-deploy
cp .env.example .env   # then fill in:
#   DATABASE_URL      — the Postgres already running on BIG
#   BETTER_AUTH_SECRET — openssl rand -hex 32
#   TUNNEL_TOKEN      — from step 1
#   API_URL / CORS_ORIGIN — https://wot-api.wot-app.com
```

If the GHCR package is private: `docker login ghcr.io` once on BIG (PAT with
`read:packages`). Or make the package public in the repo's package settings.

### 3. First image

The workflow only publishes on pushes to `master`, so before the first merge
there is nothing to pull. Either merge `feat/v0` → `master` (deploys
automatically within ~5 min), or push once manually from a dev machine:

```bash
docker login ghcr.io   # PAT with write:packages
docker build -f api/Dockerfile -t ghcr.io/stuurlau/wot-api:latest .
docker push ghcr.io/stuurlau/wot-api:latest
```

### 4. First run + timer

```bash
cd ~/wot-deploy
./deploy.sh            # pulls the image, migrates, starts the api
docker compose up -d   # also starts cloudflared

# install the timer (recommended: journal logging, Persistent=true):
sudo cp wot-deploy.service wot-deploy.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now wot-deploy.timer
```

Cron alternative (logs into `deploy.log`):

    */5 * * * * /home/lau/wot-deploy/deploy.sh >> /home/lau/wot-deploy/deploy.log 2>&1

### 5. Verify

```bash
docker compose ps
systemctl status wot-deploy.timer
journalctl -u wot-deploy.service -n 20      # or: tail ~/wot-deploy/deploy.log
curl https://wot-api.wot-app.com/health
```

## Env vars — `deploy/.env`

- **DATABASE_URL** — same machine as the stack: `@host.docker.internal:5432/...?sslmode=disable`
  (the compose file ships `extra_hosts: host-gateway`). The
  `sslrootcert=$HOME/.certs/wot-server.crt` setup only matters for clients on
  *other* machines (e.g. laptop dev); same-machine db traffic is loopback. If
  the db enforces TLS even locally, mount `~/.certs` and keep `verify-ca` — see
  the comment block in `deploy/.env.example`.
- **API_URL** — external URL; feeds better-auth's `baseURL`.
- **CORS_ORIGIN** — also used as better-auth's `trustedOrigins`. Native app
  requests carry no Origin header anyway; keep it at the api URL.
- **BETTER_AUTH_SECRET** — session-signing key; generate once per environment.
- **TUNNEL_TOKEN** — cloudflared only needs this.

## Mobile test builds

The mobile client is never hosted on the server; test APKs go through GitHub.

- **`.github/workflows/mobile.yml`** — typecheck + lint on PRs/pushes.
- **`.github/workflows/build-test-app.yml`** — manual "Build test app" workflow:
  EAS build (locally on the runner, JDK 17) → APK attached to the rolling
  GitHub pre-release tagged `test-app`. Download from the phone at

      https://github.com/stuurlau/wot/releases/download/test-app/wot-test-app.apk

One-time setup:

1. `cd mobile-client && npx eas-cli login && npx eas-cli init` — writes
   `extra.eas.projectId` into `app.json` (commit it).
2. Add the **EXPO_TOKEN** secret (expo.dev → Account Settings → Access Tokens)
   to the repo's Actions secrets.

The `preview` EAS profile bakes `EXPO_PUBLIC_API_URL=https://wot-api.wot-app.com`
into the APK. Production builds later get their own tag-triggered workflow and
go through the app stores.

## Rollback

```bash
docker pull ghcr.io/stuurlau/wot-api:sha-<commit>
# pin that tag in docker-compose.yml (image: ...:sha-<commit>)
docker compose up -d api
```

(While a sha tag is pinned, the deploy script sees no change and leaves it
alone. Unpin back to `:latest` to resume auto-deploys.)

## CI notes

- `shared/types` is part of the Docker build context (root `.dockerignore`);
  changes there also trigger the api workflow.
- GHA build cache (`cache-from/to: type=gha`) keeps image builds fast.
- Periodically reclaim old images on BIG: `docker image prune` (the script
  deliberately does not prune automatically).
- Building the image locally by hand:

      docker build -f api/Dockerfile -t ghcr.io/stuurlau/wot-api:latest .
