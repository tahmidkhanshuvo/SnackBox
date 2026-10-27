#!/bin/sh
set -eu

if [ -z "${APP_KEY:-}" ]; then
  echo "APP_KEY must be set to a persistent Laravel application key." >&2
  exit 1
fi

php artisan config:clear
php artisan route:clear
php artisan config:cache
php artisan route:cache

# Additive migrations only. Never reset or reseed customer data at startup.
attempt=1
until php artisan migrate --force --no-interaction; do
  if [ "$attempt" -ge 10 ]; then
    echo "Database unavailable; stopping instead of serving a broken application." >&2
    exit 1
  fi
  attempt=$((attempt + 1))
  sleep 3
done

php artisan storage:link --no-interaction || true
exec php artisan serve --host=0.0.0.0 --port="${PORT:-10000}"
