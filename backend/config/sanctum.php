<?php

return [

    // Domains treated as "stateful" → send/receive cookies to API
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS',
        'localhost,localhost:3000,localhost:5173,127.0.0.1,127.0.0.1:8000,::1,snackbox-frontend.onrender.com'
    )),

    // Use the web guard for session-based auth
    'guard' => ['web'],

    // Null = no expiration for session-based Sanctum
    'expiration' => null,

    // Ensure cookies are handled correctly and XSRF-TOKEN stays readable
    'middleware' => [
        'authenticate_session'    => \Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies'         => \App\Http\Middleware\EncryptCookies::class,
        'add_cookies_to_response' => \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
    ],
];
