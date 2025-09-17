#!/usr/bin/env bash
set -euo pipefail

echo ">> Booting SnackBox (Laravel) ..."

# If vendor is missing (e.g., during local dev), install it
if [ ! -d "vendor" ]; then
  echo ">> vendor/ not found. Running composer install ..."
  composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction
fi

# Ensure .env exists
if [ ! -f ".env" ] && [ -n "${APP_KEY:-}" ]; then
  echo ">> .env missing but APP_KEY present in env. Creating minimal .env ..."
  cp .env.example .env || true
  # keep values from container env; Laravel will read from process env anyway
fi

# Ensure app key
if ! grep -q '^APP_KEY=base64:' .env 2>/dev/null && [ -z "${APP_KEY:-}" ]; then
  echo ">> Generating APP_KEY ..."
  php artisan key:generate --force || true
fi

# Cache config/routes/views (ignore errors if fresh)
php artisan config:clear || true
php artisan route:clear  || true
php artisan view:clear   || true

php artisan config:cache || true
php artisan route:cache  || true
php artisan view:cache   || true

# Storage symlink
php artisan storage:link || true

# Database migrate (only if DB vars likely set)
if [ -n "${DB_HOST:-}" ]; then
  echo ">> Running migrations ..."
  php artisan migrate --force || {
    echo "!! Migrations failed (continuing to boot so you can inspect logs)."
  }
fi

echo ">> Ready. Launching Laravel server ..."
exec "$@"
