#!/usr/bin/env bash
# WOT api deploy script for the home server (BIG). Runs every 5 minutes from
# a systemd timer (deploy/wot-deploy.timer) or a cron entry. It pulls the
# newest ghcr.io/stuurlau/wot-api:latest image; if the image changed, it runs
# the Drizzle migrations in a one-off container of the NEW image and only
# then recreates the api container. If a migration fails, the script aborts
# and the running api keeps serving the old version.
#
# Layout on the server: this script next to docker-compose.yml and .env in
# ~/wot-deploy (see docs/deployment.md).

set -euo pipefail

cd "$(dirname "$0")"

SERVICE=api        # compose service name in docker-compose.yml
CONTAINER=wot-api  # container_name of the api service

# Skip this run if the previous one is still busy (slow pull/migration).
exec 9>/tmp/wot-deploy.lock
flock -n 9 || exit 0

echo "=== $(date -Is) deploy check ==="

# Updates the local :latest tag if the registry has a new image; otherwise
# this is just a cheap manifest check ("Image is up to date").
docker compose pull "$SERVICE"

# Compare the image the running container was started from with the freshly
# pulled tag. No difference -> nothing to do (also on the very first run,
# when the container exists and is already current).
running_id="$(docker inspect --format '{{.Image}}' "$CONTAINER" 2>/dev/null || true)"
latest_id="$(docker image inspect "$(docker compose config --images "$SERVICE")" --format '{{.Id}}')"

if [[ -n "$running_id" && "$running_id" == "$latest_id" ]]; then
  echo "api is up to date, nothing to do"
  exit 0
fi

echo "new api image: $latest_id (running: ${running_id:-<none>})"

# Migration gate: apply pending migrations with the new image. set -e aborts
# the script here on failure, so the api is never restarted into a version
# whose migrations did not apply.
docker compose run --rm "$SERVICE" npm run db:migrate

echo "migrations ok, restarting api on the new image"
docker compose up -d "$SERVICE"

echo "deploy finished"
