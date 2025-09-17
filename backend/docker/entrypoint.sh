#!/usr/bin/env bash
set -euo pipefail

echo ">> Booting SnackBox (Laravel) ..."

# Composer in container runs as root without nags
export COMPOSER_ALLOW_SUPERUSER=1

# 1) Ensure vendor exists (useful for local 'docker run' scenarios)
if [ ! -d "vendor" ]; then
  echo ">> vendor/ not found. Running composer install (no scripts) ..."
  composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction --no-scripts
fi

# 2) Ensure .env exists (copy example if missing)
if [ ! -f ".env" ]; then
  echo ">> .env missing. Creating from .env.example ..."
  cp .env.example .env || touch .env
fi

# 3) Ensure APP_KEY exists (either from env or by generating)
APP_KEY_LINE="$(grep -E '^APP_KEY=.*' .env || true)"
APP_KEY_VALUE="${APP_KEY_LINE#APP_KEY=}"
if [ -z "${APP_KEY_VALUE}" ] && [ -z "${APP_KEY:-}" ]; then
  echo ">> No APP_KEY value found. Generating ..."
  php artisan key:generate --force || true
fi

# 4) Clear caches
php artisan config:clear || true
php artisan route:clear  || true
if [ -d "resources/views" ]; then
  php artisan view:clear || true
fi

# 5) Rebuild caches
php artisan config:cache || true
php artisan route:cache  || true
if [ -d "resources/views" ]; then
  php artisan view:cache || true
fi

# Make sure packages are discovered (we skipped composer scripts at build)
php artisan package:discover --ansi || true

# 6) Storage symlink
php artisan storage:link || true

# 7) Optional: wait for DB before migrate (default: on)
WAIT_FOR_DB="${WAIT_FOR_DB:-1}"
DB_HOST="${DB_HOST:-}"
DB_PORT="${DB_PORT:-3306}"

if [ "$WAIT_FOR_DB" = "1" ] && [ -n "$DB_HOST" ]; then
  echo ">> Waiting for MySQL at ${DB_HOST}:${DB_PORT} ..."
  for i in $(seq 1 30); do
    if mysqladmin ping -h"$DB_HOST" -P"$DB_PORT" --silent >/dev/null 2>&1; then
      echo ">> MySQL is up."
      break
    fi
    echo "   ... still waiting ($i/30)"
    sleep 2
  done
fi

# 8) Run migrations (toggle with RUN_MIGRATIONS=0 to skip)
RUN_MIGRATIONS="${RUN_MIGRATIONS:-1}"
if [ "$RUN_MIGRATIONS" = "1" ] && [ -n "$DB_HOST" ]; then
  echo ">> Running migrations ..."
  if ! php artisan migrate --force; then
    echo "!! Migrations failed (continuing so you can inspect logs)."
  fi
fi

# 9) Optional seeders (RUN_SEEDERS=1, SEED_CLASS=DatabaseSeeder by default)
RUN_SEEDERS="${RUN_SEEDERS:-0}"
SEED_CLASS="${SEED_CLASS:-Database\\Seeders\\DatabaseSeeder}"
if [ "$RUN_SEEDERS" = "1" ]; then
  echo ">> Seeding with ${SEED_CLASS} ..."
  php artisan db:seed --class="${SEED_CLASS}" --force || echo "!! Seeding failed."
fi

echo ">> Ready. Launching Laravel server ..."
exec "$@"
