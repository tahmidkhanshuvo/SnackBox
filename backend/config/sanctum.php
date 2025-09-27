<?php

return [

    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS',
        'localhost,localhost:3000,localhost:5173,127.0.0.1,127.0.0.1:8000,::1,snackbox-frontend.onrender.com'
    )),

    'guard' => ['web'],

    'expiration' => null,

    'middleware' => [
        'authenticate_session'    => \Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        // use our app middleware so XSRF-TOKEN is NOT encrypted
        'encrypt_cookies'         => \App\Http\Middleware\EncryptCookies::class,
        'add_cookies_to_response' => \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
    ],
];
