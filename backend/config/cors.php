<?php

// Build allowed origins list from CSV env (e.g. CORS_ALLOWED_ORIGINS="https://snackbox-frontend.onrender.com,http://localhost:5173")
$origins = array_values(array_filter(array_map(
    'trim',
    explode(',', (string) env('CORS_ALLOWED_ORIGINS', ''))
)));

// Safe fallback in production if env not set
if (empty($origins) && env('APP_ENV') === 'production') {
    $origins = ['https://snackbox-frontend.onrender.com'];
}

return [

    // Apply CORS to API + Sanctum + web auth endpoints used by the SPA
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'login', 'logout', 'register',
        'admin/login',
        // Optional, but helpful:
        'broadcasting/auth',
        'healthz',
    ],

    'allowed_methods' => ['*'],
    'allowed_origins' => $origins,
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    // cache preflight responses for 1 hour
    'max_age' => 3600,

    // Required for Sanctum cookie-based SPA auth
    'supports_credentials' => true,
];
