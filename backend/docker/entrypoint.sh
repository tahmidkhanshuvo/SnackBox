#!/usr/bin/env bash
set -e

echo "[entrypoint] starting with APP_ENV=${APP_ENV:-production}, APP_URL=${APP_URL}"

# Ensure view directory exists (avoid 'View path not found')
mkdir -p resources/views

# Create storage symlink (idempotent)
php artisan storage:link || true

# Clear any stale caches
php artisan config:clear || true
php artisan route:clear  || true
php artisan view:clear   || true

# Cache only config & routes (skip view:cache to avoid missing dir errors)
php artisan config:cache || true
php artisan route:cache  || true

# Run migrations (non-fatal if DB isn’t ready yet)
php artisan migrate --force || echo "[entrypoint] migrate skipped/failed (DB not ready?)"

# Finally run container CMD
exec "$@"
