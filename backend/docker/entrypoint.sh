#!/usr/bin/env bash
set -e

# Helpful log
echo "[entrypoint] starting with APP_ENV=${APP_ENV:-production}, APP_URL=${APP_URL}"

# Storage symlink (idempotent)
php artisan storage:link || true

# Clear stale caches from image builds (if any)
php artisan config:clear || true
php artisan route:clear  || true
php artisan view:clear   || true

# Optimize with *runtime* environment
php artisan optimize || true

# Run pending migrations (won't fail container if DB isn’t ready yet)
php artisan migrate --force || echo "[entrypoint] migrate skipped/failed (DB not ready?)"

# Finally, exec the CMD
exec "$@"
