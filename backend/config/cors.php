<?php

return [

    // Allow API routes + Sanctum's CSRF endpoint
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Accept multiple origins from a CSV env var
    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS')),

    // Keep patterns empty unless you need wildcards
    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Required for cookie-based auth (Sanctum SPA)
    'supports_credentials' => true,
];
