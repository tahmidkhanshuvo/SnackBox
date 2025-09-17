# ---- Base image with PHP 8.3 and needed extensions ----
FROM php:8.3-cli

# Install system deps & PHP extensions (incl. zip for openspout/filament)
RUN apt-get update && apt-get install -y \
    unzip git curl libpng-dev libonig-dev libxml2-dev zip libzip-dev \
    mariadb-client \
 && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
 && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# App directory
WORKDIR /var/www/html

# Copy composer files first for better Docker layer caching
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction

# Copy the rest of the app
COPY . .

# Make storage & cache writable
RUN mkdir -p storage/framework/{cache,sessions,views} \
 && chmod -R 777 storage bootstrap/cache

# Copy entrypoint and make it executable
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose the port Render expects
EXPOSE 10000

# Default envs Render/you can set:
# APP_ENV=production
# APP_DEBUG=false
# APP_URL=https://your-domain
# DB_* as appropriate
# CORS_ALLOWED_ORIGINS=https://your-frontend.example.com,https://another.example.com

# Start the app
ENTRYPOINT ["/entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=10000"]
