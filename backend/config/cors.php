<?php

return [

    // Allow API routes + Sanctum's CSRF endpoint
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Accept multiple origins from a CSV env var
    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'http://snackbox.test:5173,http://localhost:5173,http://127.0.0.1:5173')),

    // Keep patterns empty unless you need wildcards
    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Required for cookie-based auth (Sanctum SPA)
    'supports_credentials' => true,
];
