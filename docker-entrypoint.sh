#!/bin/sh
set -e

echo "⏳ Waiting for MySQL to be ready..."
until npx prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1; do
  sleep 2
done
echo "✅ MySQL is up"

echo "⚙️  Pushing Prisma schema..."
npx prisma db push --accept-data-loss
echo "✅ Schema applied"

# Seed only if the users table is empty
USER_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as c FROM users;" 2>/dev/null | grep -o '[0-9]*' | tail -1 || echo "0")
if [ "$USER_COUNT" = "0" ]; then
  echo "🌱 Seeding database..."
  npx tsx prisma/seed.ts
  echo "✅ Seed done"
else
  echo "ℹ️  Database already seeded, skipping"
fi

echo "🚀 Starting Next.js..."
exec node server.js
