# syntax=docker/dockerfile:1

############################
# 1) Composer deps (cached)
############################
FROM composer:2 AS vendor
WORKDIR /app

# Leverage Docker cache for deps
COPY composer.json composer.lock ./
# IMPORTANT: no scripts here (artisan not present yet)
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

##########################################
# 2) Runtime image (PHP 8.3 CLI, Alpine)
##########################################
FROM php:8.3-cli-alpine AS app
WORKDIR /var/www/html

# System + PHP extensions
RUN apk add --no-cache bash icu-dev oniguruma-dev libzip-dev $PHPIZE_DEPS \
  && docker-php-ext-configure intl \
  && docker-php-ext-install -j$(nproc) pdo_mysql intl mbstring zip bcmath exif opcache \
  && rm -rf /var/cache/apk/*

# App source
COPY . .

# Vendor from builder
COPY --from=vendor /app/vendor ./vendor

# Permissions
RUN addgroup -g 1000 laravel && adduser -u 1000 -G laravel -D laravel \
  && mkdir -p storage/logs bootstrap/cache \
  && touch storage/logs/laravel.log \
  && chown -R laravel:laravel storage bootstrap/cache \
  && chmod -R ug+rw storage bootstrap/cache

# Pre-discovery (ignore failures)
RUN php artisan package:discover --ansi || true

# Render uses $PORT
ENV PORT=8080 \
    APP_ENV=production \
    APP_DEBUG=false \
    PHP_OPCACHE_VALIDATE_TIMESTAMPS=0

EXPOSE 8080
USER laravel

# Start: keygen (if needed), cache, migrate, serve
CMD ["/bin/sh","-lc", "\
  [ -f .env ] || cp .env.example .env; \
  grep -q '^APP_KEY=base64' .env || php artisan key:generate --force --ansi; \
  php artisan config:clear && php artisan config:cache && php artisan route:cache && php artisan view:cache; \
  php artisan migrate --force || true; \
  php artisan serve --host=0.0.0.0 --port=${PORT} \
"]