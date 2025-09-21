# syntax=docker/dockerfile:1

############################
# 1) Composer (build deps) #
############################
FROM composer:2 AS vendor
WORKDIR /app

# Copy only composer files first to leverage cache
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

##########################################
# 2) Runtime image (PHP CLI, Alpine base) #
##########################################
FROM php:8.3-cli-alpine AS app
WORKDIR /var/www/html

# System + PHP extensions for Laravel + MySQL
RUN apk add --no-cache \
      bash icu-dev oniguruma-dev libzip-dev $PHPIZE_DEPS \
  && docker-php-ext-configure intl \
  && docker-php-ext-install -j$(nproc) \
      pdo_mysql intl mbstring zip bcmath exif opcache \
  && rm -rf /var/cache/apk/*

# Copy application source
COPY . .

# Bring in vendor from the builder
COPY --from=vendor /app/vendor ./vendor

# Permissions for storage and cache
RUN addgroup -g 1000 laravel && adduser -u 1000 -G laravel -D laravel \
  && mkdir -p storage/logs bootstrap/cache \
  && touch storage/logs/laravel.log \
  && chown -R laravel:laravel storage bootstrap/cache \
  && chmod -R ug+rw storage bootstrap/cache

# Small warm-up to avoid noisy first boot (ignore failures in CI)
RUN php artisan package:discover --ansi || true

# Render provides $PORT; default to 8080 for local `docker run`
ENV PORT=8080 \
    APP_ENV=production \
    APP_DEBUG=false \
    PHP_OPCACHE_VALIDATE_TIMESTAMPS=0

EXPOSE 8080
USER laravel

# --- Startup sequence ---
# 1) Ensure .env exists (Render env vars still override .env values)
# 2) Generate APP_KEY if missing
# 3) Cache config/routes/views for performance
# 4) (Optional) Run migrations; ignore failure so the app still boots
# 5) Serve Laravel on $PORT
CMD ["/bin/sh","-lc", "\
    [ -f .env ] || cp .env.example .env; \
    if ! grep -q '^APP_KEY=base64' .env; then php artisan key:generate --force --ansi; fi; \
    php artisan config:clear && php artisan config:cache && php artisan route:cache && php artisan view:cache; \
    php artisan migrate --force || true; \
    php artisan serve --host=0.0.0.0 --port=${PORT} \
"]
