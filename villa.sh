#!/usr/bin/env bash
#
# villa.sh – kleines Helfer-Skript für die Villa-Rosengarten-Seite
#
#   ./villa.sh dev                 Dev-Server (Hot-Reload) auf http://localhost:4321
#   ./villa.sh build               Produktions-Build lokal erzeugen (nach dist/)
#   ./villa.sh deploy "Nachricht"  Build prüfen -> committen -> nach GitHub pushen
#
# "deploy" pusht nach GitHub (Branch main). Von dort baut GitHub Actions mit den
# Smoobu-Preisen und deployt automatisch per FTPS auf den IONOS-Webspace.
#
# Node läuft komplett über Docker – lokal muss kein Node installiert sein.

set -euo pipefail
cd "$(dirname "$0")"

IMAGE="node:22-alpine"
CONTAINER="rosengarten-dev"
PORT="4321"

die() { echo "Fehler: $*" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || die "Docker ist nicht installiert / nicht im PATH."
docker info >/dev/null 2>&1 || die "Docker-Daemon läuft nicht. Bitte Docker Desktop starten."

cmd="${1:-}"

case "$cmd" in
  dev)
    docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
    echo "▶ Dev-Server startet auf http://localhost:${PORT}  (Stoppen mit Strg+C)"
    exec docker run --rm -it --name "$CONTAINER" \
      -v "$PWD":/app -w /app -p "${PORT}:${PORT}" "$IMAGE" \
      sh -c "npm install && npm run dev -- --host 0.0.0.0"
    ;;

  build)
    echo "▶ Produktions-Build …"
    docker run --rm -v "$PWD":/app -w /app "$IMAGE" sh -c "npm install && npm run build"
    echo "✓ Fertig – Ergebnis liegt in dist/"
    ;;

  deploy)
    shift || true
    msg="${*:-"Update $(date '+%Y-%m-%d %H:%M')"}"

    [ -d .git ] || die "Kein Git-Repo. Zuerst einrichten (siehe DEPLOY.md)."
    git remote get-url origin >/dev/null 2>&1 || die "Kein 'origin'-Remote gesetzt (siehe DEPLOY.md)."

    echo "▶ Build zur Verifikation (bricht bei Fehlern ab, bevor gepusht wird) …"
    docker run --rm -v "$PWD":/app -w /app "$IMAGE" sh -c "npm install && npm run build"

    echo "▶ Änderungen committen & pushen …"
    git add -A
    if git diff --cached --quiet; then
      echo "  (keine Änderungen – pushe vorhandene Commits)"
    else
      git commit -m "$msg"
    fi
    git push origin main
    echo "✓ Nach GitHub gepusht. GitHub Actions baut mit Smoobu-Preisen und"
    echo "  deployt automatisch nach IONOS. Fortschritt: Repo → Reiter 'Actions'."
    ;;

  *)
    echo "Verwendung: ./villa.sh [dev | build | deploy \"commit-nachricht\"]"
    exit 1
    ;;
esac
