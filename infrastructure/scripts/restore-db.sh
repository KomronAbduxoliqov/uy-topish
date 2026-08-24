#!/bin/bash
set -euo pipefail

# ==============================================================================
# UyTop PostgreSQL Production Restore Script
# Usage: ./restore-db.sh /path/to/uytop_backup_YYYYMMDD_HHMMSS.sql.gz
# ==============================================================================

if [ -z "${1:-}" ]; then
  echo "Error: You must specify a backup file to restore."
  echo "Usage: $0 /path/to/backup.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"
DB_CONTAINER="${DB_CONTAINER:-uytop-prod-db}"
DB_NAME="${DB_NAME:-uytop_prod_db}"
DB_USER="${DB_USER:-uytop_prod_user}"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "Error: Backup file '${BACKUP_FILE}' not found."
  exit 1
fi

echo "==================================================================="
echo "⚠️  CRITICAL WARNING: RESTORING WILL OVERWRITE THE CURRENT DATABASE"
echo "Target Container: ${DB_CONTAINER}"
echo "Target Database:  ${DB_NAME}"
echo "Backup File:      ${BACKUP_FILE}"
echo "==================================================================="
read -p "Are you absolutely sure you want to proceed? (yes/NO): " CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
  echo "Restore aborted by user."
  exit 0
fi

echo "[$(date)] Restoring database from ${BACKUP_FILE}..."

# Decompress and stream SQL dump into PostgreSQL container
gunzip -c "${BACKUP_FILE}" | docker exec -i "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}"

echo "[$(date)] Database restore completed successfully."
echo "[$(date)] Verifying PostgreSQL database..."
docker exec "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT version();"

echo "[$(date)] Verification complete. Production database is operational."
