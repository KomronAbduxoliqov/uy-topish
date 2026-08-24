# 📘 UyTop Production Operations Runbook & Launch Guide
**Target Domain**: `https://uytop.uz` | **Infrastructure**: Next.js 14 + NestJS + PostgreSQL 16 + Redis 7 + Nginx SSL

---

## 1. 🚀 Production Deployment Procedures

### Standard Zero-Downtime Deployment
```bash
# 1. SSH into production server
ssh deploy@server.uytop.uz

# 2. Navigate to project root
cd /opt/uytop

# 3. Pull latest release from main branch
git pull origin main

# 4. Verify environment configuration
test -f .env.production || { echo "Missing .env.production!"; exit 1; }

# 5. Build and deploy containers with rolling update
docker compose -f infrastructure/docker/docker-compose.prod.yml up -d --build --remove-orphans

# 6. Verify health endpoints
curl -f https://uytop.uz/api/v1/health/ready || echo "Deployment health check failed!"
```

---

## 2. 🔄 Rollback Procedures

If a deployment introduces regressions or fails smoke tests:
```bash
# 1. Identify previous stable git commit
git log -n 5 --oneline

# 2. Checkout previous stable commit
git checkout <PREVIOUS_STABLE_COMMIT_HASH>

# 3. Rebuild and start previous container versions
docker compose -f infrastructure/docker/docker-compose.prod.yml up -d --build

# 4. Confirm system recovery
curl -f https://uytop.uz/api/v1/health/ready
```

---

## 3. 🗄️ Database Operations & Indexing

### Initial Database Setup & Index Verification
```bash
# Verify PostgreSQL version
docker exec uytop-prod-db psql -U uytop_prod_user -d uytop_prod_db -c "SELECT version();"

# Verify B-tree & coordinate indexes on properties
docker exec uytop-prod-db psql -U uytop_prod_user -d uytop_prod_db -c "
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'properties';
"
```

---

## 4. 💾 Backup & Disaster Recovery Procedures

### Running an Immediate Manual Backup
```bash
# Execute automated backup script
./infrastructure/scripts/backup-db.sh /var/backups/uytop_db
```

### Restoring from Backup
```bash
# Execute validated restore script (Requires manual confirmation)
./infrastructure/scripts/restore-db.sh /var/backups/uytop_db/uytop_backup_20260818_030000.sql.gz
```

### Scheduled Daily Cron (Host Crontab)
```cron
# Daily database backup at 03:00 AM Tashkent time (UTC+5)
0 3 * * * /opt/uytop/infrastructure/scripts/backup-db.sh /var/backups/uytop_db >> /var/log/uytop_backup.log 2>&1
```

---

## 5. 🔑 Secret Rotation Procedures

### Rotating JWT Secret
1. Generate new 64-character secret:
   ```bash
   openssl rand -hex 32
   ```
2. Update `JWT_SECRET` in `.env.production`.
3. Restart API container (`docker compose -f infrastructure/docker/docker-compose.prod.yml restart api`).
4. *Note*: Active user sessions will be prompted to log in again upon token expiration.

### Rotating Database Password
1. Update password in PostgreSQL:
   ```sql
   ALTER USER uytop_prod_user WITH PASSWORD 'NEW_STRONG_PASSWORD_32_CHARS';
   ```
2. Update `DB_PASSWORD` in `.env.production`.
3. Restart API container.

---

## 6. 📊 Monitoring & Log Inspection

### Viewing Live Production Logs
```bash
# Follow unified API logs
docker logs -f --tail 100 uytop-prod-api

# Follow Nginx access & error logs
docker logs -f --tail 100 uytop-prod-nginx

# Follow Web frontend logs
docker logs -f --tail 100 uytop-prod-web
```

### Health Monitoring Endpoints
* **Liveness Probe**: `GET https://uytop.uz/api/v1/health` (Returns HTTP 200 with uptime)
* **Readiness Probe**: `GET https://uytop.uz/api/v1/health/ready` (Tests PostgreSQL query & TypeORM pool latency)

---

## 7. 🚨 Incident Response Playbooks

### Incident 1: PostgreSQL Database Connection Exhaustion
* **Symptom**: HTTP 503 on `/health/ready`, `too many clients already` in API logs.
* **Remediation**:
  1. Increase `DB_POOL_MAX` in `.env.production` (e.g. from 25 to 50).
  2. Terminate idle connections:
     ```sql
     SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND state_change < current_timestamp - INTERVAL '5 minutes';
     ```

### Incident 2: Redis Unavailable
* **Symptom**: Cache misses, rate-limiter fallback.
* **Behavior**: NestJS API gracefully degrades to in-memory fallback and direct database queries.
* **Remediation**:
  ```bash
  docker compose -f infrastructure/docker/docker-compose.prod.yml restart redis
  ```

### Incident 3: External AI API Latency / Outage
* **Symptom**: Natural language search delays.
* **Behavior**: Intent parser falls back to classical keyword & faceted filters; user receives a friendly Uzbek notification (*"Filtrlar orqali qidirish davom ettirilmoqda"*).
