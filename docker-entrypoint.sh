#!/bin/sh
set -e

echo "[DOCKER] Waiting for PostgreSQL to be ready..."

max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if pg_isready -h postgres -p 5432 -U postgres > /dev/null 2>&1; then
    echo "[DOCKER] Database is ready!"
    break
  fi
  attempt=$((attempt + 1))
  echo "[DOCKER] Waiting for database connection... (attempt $attempt/$max_attempts)"
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "[DOCKER] Failed to connect to database after $max_attempts attempts"
  exit 1
fi

echo "[DOCKER] Running Prisma migrations..."
npx prisma migrate deploy

echo "[DOCKER] Running database seeds..."
npx prisma db seed

echo "[DOCKER] Starting application..."
exec "$@"
