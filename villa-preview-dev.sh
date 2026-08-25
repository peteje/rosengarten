#!/usr/bin/env bash
# Nicht-interaktive Variante von "villa.sh dev" nur für automatisierte
# Preview-Sessions (Claude Code Browser-Pane) -- identisch zu villa.sh dev,
# aber ohne "-it" (kein TTY verfügbar in diesem Kontext). villa.sh selbst
# bleibt unverändert für den normalen manuellen Workflow.
set -euo pipefail
cd "$(dirname "$0")"

IMAGE="node:22-alpine"
CONTAINER="rosengarten-dev-preview"
PORT="4321"
SECRETS_FILE="${VILLA_SECRETS:-$HOME/.villa-secrets.env}"

if [ -f "$SECRETS_FILE" ]; then
  set -a; . "$SECRETS_FILE"; set +a
  echo "▶ Secrets geladen: $SECRETS_FILE"
fi

docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
echo "▶ Dev-Server startet auf http://localhost:${PORT}"
exec docker run --rm --name "$CONTAINER" \
  -e SMOOBU_API_KEY -e SMOOBU_API_SECRET \
  -e GOOGLE_PLACES_API_KEY -e GOOGLE_PLACE_ID -e TZ=Europe/Berlin \
  -v "$PWD":/app -w /app -p "${PORT}:${PORT}" "$IMAGE" \
  sh -c "npm install && npm run dev -- --host 0.0.0.0"
