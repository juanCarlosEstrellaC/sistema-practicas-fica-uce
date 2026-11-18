#!/usr/bin/env bash
# ==============================================================================
# Script de Despliegue Continuo (CD) - Sistema de Practicas FICA UCE (Ubuntu)
# ==============================================================================
# Sincroniza la rama configurada desde GitHub y actualiza los servicios backend
# y frontend descargando las imagenes precompiladas de GHCR (sin compilar en
# la VM de Ubuntu), salvo que se indique --build-local.
# Con --continuo permanece revisando cambios cada N segundos.
# ==============================================================================

set -euo pipefail

DIR_BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RAMA=""
FORZAR=false
BUILD_LOCAL=false
MODO_CONTINUO=false
INTERVALO=60

mostrar_ayuda() {
  cat <<'EOF'
Uso: ./scripts/desplegar-docker.sh [opciones]

Opciones:
  --rama <nombre>       Rama remota y tag de imagen GHCR a usar (defecto: rama actual)
  --forzar              En modo --build-local reconstruye aunque no existan commits nuevos
  --build-local         Compila las imagenes localmente en Ubuntu en lugar de bajar de GHCR
  --continuo            Mantiene revision continua en bucle
  --intervalo <seg>     Segundos entre revisiones en modo continuo (defecto: 60)
  -h, --help            Muestra esta ayuda
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --rama)
      RAMA="${2:?Error: --rama requiere un valor}"
      shift 2
      ;;
    --forzar)
      FORZAR=true
      shift
      ;;
    --build-local)
      BUILD_LOCAL=true
      shift
      ;;
    --continuo)
      MODO_CONTINUO=true
      shift
      ;;
    --intervalo)
      INTERVALO="${2:?Error: --intervalo requiere un valor numerico}"
      shift 2
      ;;
    -h|--help)
      mostrar_ayuda
      exit 0
      ;;
    *)
      echo "[CD] Opcion desconocida: $1" >&2
      mostrar_ayuda >&2
      exit 1
      ;;
  esac
done

cd "${DIR_BASE}"

if [[ -z "${RAMA}" ]]; then
  RAMA="$(git rev-parse --abbrev-ref HEAD)"
  if [[ -z "${RAMA}" || "${RAMA}" == "HEAD" ]]; then
    echo "[CD] Error: no se pudo detectar la rama actual. Indica --rama <nombre>." >&2
    exit 1
  fi
fi

ejecutar_ciclo() {
  local rama_objetivo="$1"
  local forzar_construccion="$2"

  echo "[CD] Consultando cambios remotos en origin/${rama_objetivo}..."
  git fetch origin "${rama_objetivo}"

  local hash_local
  local hash_remoto
  hash_local="$(git rev-parse HEAD)"
  hash_remoto="$(git rev-parse "origin/${rama_objetivo}")"

  local hay_cambios=false
  if [[ "${hash_local}" != "${hash_remoto}" ]]; then
    hay_cambios=true
    echo "[CD] Descargando nuevos commits (${hash_local:0:7} -> ${hash_remoto:0:7})..."
    git pull --ff-only origin "${rama_objetivo}"
  fi

  export IMAGE_TAG="${rama_objetivo}"

  if [[ "${BUILD_LOCAL}" == "true" ]]; then
    if [[ "${hay_cambios}" == "false" && "${forzar_construccion}" == "false" ]]; then
      echo "[CD] Sin cambios nuevos en origin/${rama_objetivo} (${hash_local:0:7}). Contenedores al dia."
      return 0
    fi
    echo "[CD] Compilando localmente servicios backend y frontend..."
    docker compose up -d --build backend frontend
  else
    echo "[CD] Descargando imagenes de GHCR (tag: ${IMAGE_TAG})..."
    docker compose pull backend frontend
    echo "[CD] Actualizando servicios backend y frontend sin compilar en local..."
    docker compose up -d --no-build backend frontend
  fi

  echo "[CD] Limpiando imagenes huerfanas anteriores..."
  docker image prune -f

  echo "[CD] Despliegue completado exitosamente."
}

echo "[CD] Rama configurada: ${RAMA}"

if [[ "${MODO_CONTINUO}" == "false" ]]; then
  ejecutar_ciclo "${RAMA}" "${FORZAR}"
  exit 0
fi

echo "[CD] Modo continuo activo (revision cada ${INTERVALO}s). Presiona Ctrl+C para detener."
forzar_actual="${FORZAR}"
while true; do
  if ! ejecutar_ciclo "${RAMA}" "${forzar_actual}"; then
    echo "[CD] Advertencia: fallo en el ciclo de despliegue, se reintentara en ${INTERVALO}s." >&2
  fi
  forzar_actual=false
  sleep "${INTERVALO}"
done
