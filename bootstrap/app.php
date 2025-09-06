<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        /**
         * Make /api requests from your SPA (origins listed in
         * SANCTUM_STATEFUL_DOMAINS) behave as "stateful" so cookies + CSRF
         * are honored. This enables the session-based Sanctum flow from React.
         */
        $middleware->appendToGroup('api', [
            EnsureFrontendRequestsAreStateful::class,
        ]);

        // No other changes needed; the default "web" group already has
        // sessions, cookies, and CSRF, which you’re using on your auth routes.
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->create();
