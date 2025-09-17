# ---- Base image with PHP 8.3 and needed extensions ----
FROM php:8.3-cli

# Let Composer run as root in containers
ENV COMPOSER_ALLOW_SUPERUSER=1

# System deps & PHP extensions
RUN apt-get update && apt-get install -y \
    unzip git curl libpng-dev libonig-dev libxml2-dev zip libzip-dev \
    mariadb-client \
 && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
 && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# 1) Copy lockfiles first for layer caching
COPY composer.json composer.lock ./

# 2) Install vendors but SKIP scripts (artisan not here yet)
RUN composer install --no-dev --prefer-dist --no-interaction --no-scripts

# 3) Now copy the rest of the app (this brings artisan)
COPY . .

# 4) Optional: refresh autoload (still skipping scripts; entrypoint will handle caches)
RUN composer dump-autoload -o --no-interaction --no-scripts

# Writable dirs
RUN mkdir -p storage/framework/{cache,sessions,views} \
 && chmod -R 777 storage bootstrap/cache

# Entrypoint (from our previous message)
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 10000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=10000"]
