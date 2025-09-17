<?php

// Build origins list safely from CSV env; ignore null/empties/extra spaces.
$origins = array_values(array_filter(array_map(
    'trim',
    explode(',', env('CORS_ALLOWED_ORIGINS', ''))
)));

// Fallback for production if no env is provided
if (empty($origins) && env('APP_ENV') === 'production') {
    $origins = ['https://snackbox-frontend.onrender.com'];
}

return [

    // Allow API routes + Sanctum endpoints used by SPA auth
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'],

    'allowed_methods' => ['*'],

    // Use our computed list (env or fallback)
    'allowed_origins' => $origins,

    // Leave patterns empty unless you truly need wildcards/regex
    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,

    // Required for cookie-based auth (Sanctum SPA)
    'supports_credentials' => true,
];
