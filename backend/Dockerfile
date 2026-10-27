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

RUN apk add --no-cache bash icu-dev oniguruma-dev libzip-dev postgresql-dev $PHPIZE_DEPS \
  && docker-php-ext-configure intl \
  && docker-php-ext-install -j"$(nproc)" pdo_mysql pdo_pgsql intl mbstring zip bcmath exif opcache \
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
RUN [ -L public/storage ] || ln -s ../storage/app/public public/storage

ENV PORT=10000 \
    APP_ENV=production \
    APP_DEBUG=false \
    PHP_OPCACHE_VALIDATE_TIMESTAMPS=0

EXPOSE 10000
USER laravel

CMD ["/bin/sh", "docker-entrypoint.sh"]
