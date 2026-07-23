#!/usr/bin/env bash
#
# villa.sh – Helfer-Skript für die Villa-Rosengarten-Seite
#
#   ./villa.sh dev                 Dev-Server (Hot-Reload) auf http://localhost:4321
#   ./villa.sh build               Produktions-Build lokal erzeugen (nach dist/)
#   ./villa.sh deploy "Nachricht"  lokal bauen (mit Smoobu-Preisen) -> dist/ + Quelle
#                                  committen -> nach GitHub pushen
#
# Ablauf beim Deploy (Variante B):
#   Der Build läuft LOKAL mit den Smoobu-Zugangsdaten (bleiben auf diesem Rechner).
#   Die fertige dist/ wird ins Repo gepusht; GitHub Actions lädt sie nur noch per
#   FTPS zu IONOS – der Smoobu-Key landet NIE bei GitHub.
#
# Die Smoobu-Zugangsdaten liegen AUSSERHALB des Repos in einer Datei:
#   ~/.villa-secrets.env         (oder Pfad über $VILLA_SECRETS)
# Inhalt (siehe villa-secrets.example.env):
#   SMOOBU_API_KEY=usr_live_...
#   SMOOBU_API_SECRET=...
#
# Node läuft komplett über Docker – lokal muss kein Node installiert sein.

set -euo pipefail
cd "$(dirname "$0")"

IMAGE="node:22-alpine"
CONTAINER="rosengarten-dev"
PORT="4321"
SECRETS_FILE="${VILLA_SECRETS:-$HOME/.villa-secrets.env}"

die() { echo "Fehler: $*" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || die "Docker ist nicht installiert / nicht im PATH."
docker info >/dev/null 2>&1 || die "Docker-Daemon läuft nicht. Bitte Docker Desktop starten."

# Smoobu-Zugangsdaten aus der externen Datei in die Umgebung laden (falls vorhanden).
load_secrets() {
  if [ -f "$SECRETS_FILE" ]; then
    set -a; . "$SECRETS_FILE"; set +a
    echo "▶ Secrets geladen: $SECRETS_FILE"
  else
    echo "⚠ Keine Secrets-Datei ($SECRETS_FILE) gefunden – Build nutzt die manuellen Preise."
  fi
}

build() {
  docker run --rm \
    -e SMOOBU_API_KEY -e SMOOBU_API_SECRET \
    -v "$PWD":/app -w /app "$IMAGE" \
    sh -c "npm install && npm run build"
}

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
    load_secrets
    echo "▶ Produktions-Build …"
    build
    echo "✓ Fertig – Ergebnis liegt in dist/"
    ;;

  deploy)
    shift || true
    msg="${*:-"Update $(date '+%Y-%m-%d %H:%M')"}"

    [ -d .git ] || die "Kein Git-Repo. Zuerst einrichten (siehe DEPLOY.md)."
    git remote get-url origin >/dev/null 2>&1 || die "Kein 'origin'-Remote gesetzt (siehe DEPLOY.md)."

    load_secrets
    echo "▶ Build mit Smoobu-Preisen (bricht bei Fehlern ab, bevor gepusht wird) …"
    build

    echo "▶ Quelle + fertige dist/ committen & pushen …"
    git add -A
    if git diff --cached --quiet; then
      echo "  (keine Änderungen – pushe vorhandene Commits)"
    else
      git commit -m "$msg"
    fi
    git push origin main
    echo "✓ Nach GitHub gepusht. GitHub Actions lädt dist/ per FTPS zu IONOS."
    echo "  Fortschritt: Repo → Reiter 'Actions'."
    ;;

  *)
    echo "Verwendung: ./villa.sh [dev | build | deploy \"commit-nachricht\"]"
    exit 1
    ;;
esac
