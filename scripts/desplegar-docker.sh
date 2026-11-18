#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

RAMA="${1:-$(git rev-parse --abbrev-ref HEAD)}"
export IMAGE_TAG="${RAMA}"

echo "[CD] Sincronizando repositorio y desplegando imagenes GHCR (tag: ${IMAGE_TAG})..."
git fetch origin "${RAMA}"
git checkout "${RAMA}"
git pull --ff-only origin "${RAMA}"
docker compose pull backend frontend
docker compose up -d --no-build backend frontend
docker image prune -f
echo "[CD] Despliegue completado."
