#!/bin/sh
set -e

PRISMA="node /app/node_modules/prisma/build/index.js"
TSX="/app/node_modules/.bin/tsx"

# ── Extract host and port from DATABASE_URL ───────────────────────────────────
# Handles both mysql://user:pass@host:port/db and postgresql://user:pass@host/db
AFTER_AT=$(echo "$DATABASE_URL" | sed 's|.*@||')           # host:port/db or host/db
HOSTPART=$(echo "$AFTER_AT" | cut -d/ -f1)                 # host:port or host
DB_HOST=$(echo "$HOSTPART" | cut -d: -f1)                  # host
DB_PORT_RAW=$(echo "$HOSTPART" | grep -o ':[0-9]*' | tr -d ':')  # port or empty

# Default to 5432 for PostgreSQL, 3306 for MySQL if no port in URL
if [ -z "$DB_PORT_RAW" ]; then
  case "$DATABASE_URL" in
    postgres*) DB_PORT=5432 ;;
    mysql*)    DB_PORT=3306 ;;
    *)         DB_PORT=5432 ;;
  esac
else
  DB_PORT="$DB_PORT_RAW"
fi

# ── Wait for DB ───────────────────────────────────────────────────────────────
echo "Waiting for DB at $DB_HOST:$DB_PORT..."
until nc -z -w 3 "$DB_HOST" "$DB_PORT" > /dev/null 2>&1; do
  sleep 2
done
echo "DB is up"

# ── Push schema ───────────────────────────────────────────────────────────────
echo "Pushing Prisma schema..."
$PRISMA db push --force-reset --skip-generate
echo "Schema applied"

# ── Seed if empty ─────────────────────────────────────────────────────────────
echo "Checking seed..."
printf 'SELECT COUNT(*) FROM users;' > /tmp/check.sql
USER_COUNT=$($PRISMA db execute --stdin < /tmp/check.sql 2>/dev/null | grep -o '[0-9]*' | head -1 || echo "0")

if [ -z "$USER_COUNT" ] || [ "$USER_COUNT" = "0" ]; then
  echo "Seeding database..."
  $TSX /app/prisma/seed.ts
  echo "Seed done"
else
  echo "Database already seeded ($USER_COUNT users), skipping"
fi

# ── Start app ─────────────────────────────────────────────────────────────────
echo "Starting Next.js..."
exec node /app/server.js
