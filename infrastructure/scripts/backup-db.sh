#!/bin/bash
set -euo pipefail

# ==============================================================================
# UyTop PostgreSQL Automated Production Backup Script
# Usage: ./backup-db.sh [backup_destination_dir]
# ==============================================================================

BACKUP_DIR="${1:-/var/backups/uytop_db}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/uytop_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=14

# Production Database Credentials (from env or defaults)
DB_CONTAINER="${DB_CONTAINER:-uytop-prod-db}"
DB_NAME="${DB_NAME:-uytop_prod_db}"
DB_USER="${DB_USER:-uytop_prod_user}"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting UyTop PostgreSQL database backup..."

# Execute compressed pg_dump directly from database container
docker exec "${DB_CONTAINER}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists --no-owner --no-privileges | gzip > "${BACKUP_FILE}"

FILESIZE=$(stat -c%s "${BACKUP_FILE}" 2>/dev/null || stat -f%z "${BACKUP_FILE}" 2>/dev/null || wc -c < "${BACKUP_FILE}")

echo "[$(date)] Backup completed successfully: ${BACKUP_FILE} (${FILESIZE} bytes)"

# Clean up backups older than RETENTION_DAYS
echo "[$(date)] Pruning local backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "uytop_backup_*.sql.gz" -mtime +"${RETENTION_DAYS}" -exec rm -f {} \;

echo "[$(date)] Backup routine finished cleanly."
