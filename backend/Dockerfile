# syntax=docker/dockerfile:1

############################
# 1) Composer deps (cached)
############################
FROM composer:2 AS vendor
WORKDIR /app

# Only copy composer files first to leverage cache
COPY composer.json composer.lock ./
# IMPORTANT: do not run composer scripts here (artisan not present yet)
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

##########################################
# 2) Runtime image (PHP 8.3 CLI, Alpine)
##########################################
FROM php:8.3-cli-alpine AS app
WORKDIR /var/www/html

# System pkgs + PHP extensions needed by Laravel
RUN apk add --no-cache bash icu-dev oniguruma-dev libzip-dev $PHPIZE_DEPS \
  && docker-php-ext-configure intl \
  && docker-php-ext-install -j$(nproc) pdo_mysql intl mbstring zip bcmath exif opcache \
  && rm -rf /var/cache/apk/*

# Copy full application
COPY . .

# Bring vendor deps from builder
COPY --from=vendor /app/vendor ./vendor

# Permissions for logs/cache
RUN addgroup -g 1000 laravel && adduser -u 1000 -G laravel -D laravel \
  && mkdir -p storage/logs bootstrap/cache \
  && touch storage/logs/laravel.log \
  && chown -R laravel:laravel storage bootstrap/cache \
  && chmod -R ug+rw storage bootstrap/cache

# Optional: discover packages (ignore failure if not needed)
RUN php artisan package:discover --ansi || true

# Render exposes $PORT
ENV PORT=10000 \
    APP_ENV=production \
    APP_DEBUG=false \
    PHP_OPCACHE_VALIDATE_TIMESTAMPS=0

EXPOSE 10000
USER laravel

# ---- Startup (API-only safe) ----
#  - Ensure .env exists or use Render env vars
#  - Generate APP_KEY if missing
#  - Cache config + routes (no view commands)
#  - Try migrations (ignore failure so app still boots)
#  - Serve on $PORT
CMD ["/bin/sh","-lc", "\
  [ -f .env ] || cp .env.example .env; \
  grep -q '^APP_KEY=base64' .env || php artisan key:generate --force --ansi; \
  php artisan config:clear || true; \
  php artisan route:clear || true; \
  php artisan config:cache && php artisan route:cache; \
  php artisan migrate --force || true; \
  php artisan serve --host=0.0.0.0 --port=${PORT} \
"]