# ---- PHP 8.3 + needed extensions ----
FROM php:8.3-cli

# Allow Composer as root inside container
ENV COMPOSER_ALLOW_SUPERUSER=1

# System deps & PHP extensions (zip needed by many libs)
RUN apt-get update && apt-get install -y \
    unzip git curl libpng-dev libonig-dev libxml2-dev zip libzip-dev mariadb-client \
 && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
 && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# 1) Install vendors without scripts (artisan not here yet)
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-scripts

# 2) Copy app code
COPY . .

# 3) Refresh autoloads (still skip scripts; we’ll run artisan at runtime)
RUN composer dump-autoload -o --no-interaction --no-scripts

# 4) Writable dirs
RUN mkdir -p storage/framework/{cache,sessions,views} \
 && chmod -R 777 storage bootstrap/cache

# 5) Entrypoint
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 10000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=10000"]
