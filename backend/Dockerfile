# syntax=docker/dockerfile:1

# Use the same PHP version and extensions for dependency resolution and runtime.
FROM php:8.3-cli-alpine AS runtime
WORKDIR /var/www/html
RUN apk add --no-cache bash icu-dev oniguruma-dev libzip-dev postgresql-dev $PHPIZE_DEPS \
  && docker-php-ext-configure intl \
  && docker-php-ext-install -j"$(nproc)" pdo_mysql pdo_pgsql intl mbstring zip bcmath exif opcache \
  && rm -rf /var/cache/apk/*

FROM runtime AS vendor
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
RUN apk add --no-cache unzip git
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

FROM runtime AS app
COPY . .
COPY --from=vendor /var/www/html/vendor ./vendor
RUN addgroup -g 1000 laravel && adduser -u 1000 -G laravel -D laravel \
  && mkdir -p storage/logs bootstrap/cache \
  && mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views \
  && touch storage/logs/laravel.log \
  && chown -R laravel:laravel storage bootstrap/cache public \
  && chmod -R ug+rw storage bootstrap/cache
RUN php artisan package:discover --ansi
RUN [ -L public/storage ] || ln -s ../storage/app/public public/storage
ENV PORT=10000 \
    APP_ENV=production \
    APP_DEBUG=false \
    PHP_OPCACHE_VALIDATE_TIMESTAMPS=0
EXPOSE 10000
USER laravel
CMD ["/bin/sh", "docker-entrypoint.sh"]
