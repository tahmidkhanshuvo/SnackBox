<?php

return [

    // Allow API routes + Sanctum's CSRF endpoint
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Your Vite dev server
    'allowed_origins' => [env('FRONTEND_URL', 'http://snackbox.test:5173')],

    // keep patterns empty unless you need wildcards
    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Required for cookie-based auth (Sanctum SPA)
    'supports_credentials' => true,
];
