#!/bin/sh
set -e

# ── Load .env if present (runtime env vars take precedence) ──────────────────
if [ -f /app/.env ]; then
  set -a
  . /app/.env
  set +a
fi

PRISMA="node /app/node_modules/prisma/build/index.js"
TSX="/app/node_modules/.bin/tsx"

# ── Wait for MySQL ────────────────────────────────────────────────────────────
DB_HOSTPORT=$(echo "$DATABASE_URL" | sed 's|.*@||' | cut -d/ -f1)
DB_HOST=$(echo "$DB_HOSTPORT" | cut -d: -f1)
DB_PORT=$(echo "$DB_HOSTPORT" | cut -d: -f2)

echo "Waiting for MySQL at $DB_HOST:$DB_PORT..."
until nc -z -w 3 "$DB_HOST" "$DB_PORT" > /dev/null 2>&1; do
  sleep 2
done
echo "MySQL is up"

# ── Push schema ───────────────────────────────────────────────────────────────
echo "Pushing Prisma schema..."
$PRISMA db push --accept-data-loss --skip-generate
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
