<?php

use Illuminate\Support\Str;

$inProd = env('APP_ENV') === 'production';
$secureDefault = $inProd ? true : false;
$sameSite = env('SESSION_SAME_SITE', $inProd ? 'none' : 'lax');

return [

    // Use cookie driver for SPA auth
    'driver' => env('SESSION_DRIVER', 'cookie'),

    'lifetime' => (int) env('SESSION_LIFETIME', 120),
    'expire_on_close' => (bool) env('SESSION_EXPIRE_ON_CLOSE', false),

    // Encrypt session payloads when using the cookie driver (recommended in prod)
    'encrypt' => (bool) env('SESSION_ENCRYPT', $inProd ? true : false),

    // Not used for cookie driver but kept for flexibility
    'files' => storage_path('framework/sessions'),
    'connection' => env('SESSION_CONNECTION'),
    'table' => env('SESSION_TABLE', 'sessions'),
    'store' => env('SESSION_STORE'),
    'lottery' => [2, 100],

    // One consistent cookie name
    'cookie' => env('SESSION_COOKIE', 'snackbox_session'),

    // Scope & domain
    'path' => env('SESSION_PATH', '/'),
    'domain' => env('SESSION_DOMAIN', null), // e.g. .onrender.com in prod

    // Cookies must be Secure when SameSite=None
    'secure' => filter_var(env('SESSION_SECURE_COOKIE', $secureDefault), FILTER_VALIDATE_BOOL),

    'http_only' => (bool) env('SESSION_HTTP_ONLY', true),

    // Cross-site SPA needs 'none' in prod, 'lax' is fine locally
    'same_site' => $sameSite,

    // Modern browsers prefer partitioned cookies for cross-site use
    'partitioned' => filter_var(
        env('SESSION_PARTITIONED_COOKIE', $sameSite === 'none'),
        FILTER_VALIDATE_BOOL
    ),
];
