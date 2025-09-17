# ---- Base image with PHP 8.3 and required extensions ----
FROM php:8.3-cli

# Install system dependencies & PHP extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    git unzip curl zip libzip-dev mariadb-client \
    libpng-dev libjpeg62-turbo-dev libfreetype6-dev \
    libonig-dev libxml2-dev \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install -j$(nproc) pdo_mysql mbstring exif pcntl bcmath gd zip opcache \
 && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Set working dir
WORKDIR /var/www/html

# Copy composer files and install dependencies
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction

# Copy application code
COPY . .

# Ensure writable dirs
RUN mkdir -p storage bootstrap/cache \
 && chown -R www-data:www-data storage bootstrap/cache \
 && chmod -R 775 storage bootstrap/cache

# Add entrypoint
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# OPcache production settings
RUN echo 'opcache.enable=1'                 >  /usr/local/etc/php/conf.d/opcache.ini \
 && echo 'opcache.enable_cli=1'             >> /usr/local/etc/php/conf.d/opcache.ini \
 && echo 'opcache.validate_timestamps=0'    >> /usr/local/etc/php/conf.d/opcache.ini \
 && echo 'opcache.jit_buffer_size=64M'      >> /usr/local/etc/php/conf.d/opcache.ini \
 && echo 'opcache.memory_consumption=256'   >> /usr/local/etc/php/conf.d/opcache.ini

# Expose (Render ignores EXPOSE but it's fine)
EXPOSE 8080

# Use entrypoint; bind to $PORT from Render
ENTRYPOINT ["/entrypoint.sh"]
CMD ["sh","-lc","php artisan serve --host=0.0.0.0 --port=${PORT:-8080}"]
