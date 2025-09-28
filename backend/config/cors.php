<?php

// IMPORTANT: when supports_credentials=true you CANNOT use "*" in allowed_origins.
// Put exact origins (scheme + host) separated with commas in CORS_ALLOWED_ORIGINS.

$origins = trim(env('CORS_ALLOWED_ORIGINS', ''));
if ($origins === '') {
    // Sensible fallback if you forgot to set it
    $fallbacks = array_filter([env('FRONTEND_URL'), env('APP_URL')]);
    $origins = implode(',', $fallbacks);
}

return [

    /*
    |--------------------------------------------------------------------------
    | Paths
    |--------------------------------------------------------------------------
    | Apply CORS to ALL endpoints so even errors/edge routes carry headers.
    | (You can scope this to ['api/*','sanctum/csrf-cookie','login','logout','register','admin/login']
    |  if you prefer to be strict.)
    */
    'paths' => ['*'],

    'allowed_methods' => ['*'],

    /*
    |--------------------------------------------------------------------------
    | Allowed Origins
    |--------------------------------------------------------------------------
    | Example env:
    | CORS_ALLOWED_ORIGINS=https://snackbox-frontend.onrender.com,http://localhost:5173
    */
    'allowed_origins' => array_values(array_filter(array_map('trim', explode(',', $origins)))),

    'allowed_origins_patterns' => [],

    // Accept any incoming headers from the browser
    'allowed_headers' => ['*'],

    // Expose nothing special (add e.g. Content-Disposition if you stream files)
    'exposed_headers' => [],

    // Cache preflights for an hour
    'max_age' => 3600,

    // We’re sending cookies / Authorization → must be true
    'supports_credentials' => true,
];
