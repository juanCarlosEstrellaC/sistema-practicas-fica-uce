#!/usr/bin/env bash
# ==============================================================================
# Script de Respaldo Automatizado - Sistema de Practicas FICA UCE
# ==============================================================================
# Realiza respaldo comprimido de:
# 1. Base de datos PostgreSQL (dump comprimido en .sql.gz)
# 2. Archivos y evidencias subidas (comprimido en .tar.gz)
# 3. Limpieza automatica de respaldos antiguos (retencion de N dias)
# ==============================================================================

set -euo pipefail

# ---------------- CONFIGURACION ----------------
DIR_BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIR_DESTINO="${DIR_BASE}/respaldos"
DIAS_RETENCION=15
FECHA=$(date +"%Y%m%d_%H%M%S")

# Cargar variables del entorno si existe .env
if [ -f "${DIR_BASE}/.env" ]; then
  # Cargar variables ignorando lineas comentadas o vacias
  set -a
  source <(grep -v '^[[:space:]]*#' "${DIR_BASE}/.env" | grep -v '^[[:space:]]*$')
  set +a
fi

NOMBRE_BD="${DB_NAME:-db_practicas_fica_uce}"
USUARIO_BD="${DB_USER:-postgres}"
CONTENEDOR_BD="sistema-practicas-bd"
VOLUMEN_ARCHIVOS="sistema-practicas-fica-uce_backend_archivos"

# Si el volumen con prefijo del proyecto no existe, buscar el nombre simple
if ! docker volume ls --format '{{.Name}}' | grep -q "^${VOLUMEN_ARCHIVOS}$"; then
  VOLUMEN_ARCHIVOS="backend_archivos"
fi

# Crear directorio de respaldos si no existe
mkdir -p "${DIR_DESTINO}"

echo "=========================================================="
echo "Iniciando respaldo: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Destino: ${DIR_DESTINO}"
echo "=========================================================="

# 1. Respaldo de Base de Datos PostgreSQL
ARCHIVO_BD="${DIR_DESTINO}/bd_${NOMBRE_BD}_${FECHA}.sql.gz"
echo "[1/3] Respaldando base de datos (${NOMBRE_BD})..."

if docker ps --format '{{.Names}}' | grep -q "^${CONTENEDOR_BD}$"; then
  docker exec "${CONTENEDOR_BD}" pg_dump -U "${USUARIO_BD}" -d "${NOMBRE_BD}" --no-owner --clean | gzip > "${ARCHIVO_BD}"
  echo "      -> Base de datos respaldada con exito: $(du -h "${ARCHIVO_BD}" | cut -f1)"
else
  echo "      [ERROR] El contenedor ${CONTENEDOR_BD} no esta en ejecucion."
  exit 1
fi

# 2. Respaldo de Archivos y Evidencias
ARCHIVO_DOCS="${DIR_DESTINO}/archivos_${FECHA}.tar.gz"
echo "[2/3] Respaldando archivos y evidencias..."

docker run --rm \
  -v "${VOLUMEN_ARCHIVOS}:/origen:ro" \
  -v "${DIR_DESTINO}:/destino" \
  alpine tar czf "/destino/archivos_${FECHA}.tar.gz" -C /origen .

echo "      -> Archivos respaldados con exito: $(du -h "${ARCHIVO_DOCS}" | cut -f1)"

# 3. Rotacion y Depuracion de Respaldos Antiguos
echo "[3/3] Depurando respaldos con mas de ${DIAS_RETENCION} dias..."
find "${DIR_DESTINO}" -type f \( -name "bd_*.sql.gz" -o -name "archivos_*.tar.gz" \) -mtime "+${DIAS_RETENCION}" -print -delete || true

echo "=========================================================="
echo "Respaldo finalizado exitosamente a las $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================================="

