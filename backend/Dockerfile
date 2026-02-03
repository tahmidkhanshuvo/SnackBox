# syntax=docker/dockerfile:1

############################
# 1) Composer deps (cached)
############################
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

##########################################
# 2) Runtime image (PHP 8.3 CLI, Alpine)
##########################################
FROM php:8.3-cli-alpine AS app
WORKDIR /var/www/html

RUN apk add --no-cache bash icu-dev oniguruma-dev libzip-dev $PHPIZE_DEPS \
  && docker-php-ext-configure intl \
  && docker-php-ext-install -j"$(nproc)" pdo_mysql intl mbstring zip bcmath exif opcache \
  && rm -rf /var/cache/apk/*

# App code + vendor
COPY . .
COPY --from=vendor /app/vendor ./vendor

# Runtime user + permissions (include public + storage/framework/*)
RUN addgroup -g 1000 laravel && adduser -u 1000 -G laravel -D laravel \
  && mkdir -p storage/logs bootstrap/cache \
  && mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views \
  && touch storage/logs/laravel.log \
  && chown -R laravel:laravel storage bootstrap/cache public \
  && chmod -R ug+rw storage bootstrap/cache

# Safe: don't fail the build if no providers
RUN php artisan package:discover --ansi || true

# Create public/storage symlink at build time
RUN [ -L public/storage ] || ln -s storage/app/public public/storage || true

ENV PORT=10000 \
    APP_ENV=production \
    APP_DEBUG=false \
    PHP_OPCACHE_VALIDATE_TIMESTAMPS=0 \
    RESET_DB=0 \
    SEED=0

EXPOSE 10000
USER laravel

# ---- Startup ----
CMD ["/bin/sh","-lc", "\
  [ -f .env ] || cp .env.example .env; \
  grep -q '^APP_KEY=base64' .env || php artisan key:generate --force --ansi; \
  php artisan optimize:clear || true; \
  php artisan config:clear   || true; \
  php artisan route:clear    || true; \
  php artisan cache:clear    || true; \
  php artisan config:cache   || true; \
  php artisan route:cache    || true; \
  if [ ! -L public/storage ]; then rm -rf public/storage 2>/dev/null || true; ln -s storage/app/public public/storage || true; fi; \
  for i in $(seq 1 30); do php artisan migrate:status --no-ansi >/dev/null 2>&1 && break; echo \"Waiting for DB ($i/30)...\"; sleep 2; done; \
  if [ \"${RESET_DB}\" = \"1\" ]; then \
    echo 'RESET_DB=1 → php artisan migrate:fresh --seed --force'; \
    php artisan migrate:fresh --seed --force; \
  else \
    php artisan migrate --force; \
    if [ \"${SEED}\" = \"1\" ]; then php artisan db:seed --force; fi; \
  fi; \
  php artisan serve --host=0.0.0.0 --port=${PORT} \
"]
