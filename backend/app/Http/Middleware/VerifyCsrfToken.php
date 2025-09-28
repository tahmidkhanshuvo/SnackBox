<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    protected $except = [
        'api/*',

        // TEMPORARY to unblock SPA auth in production:
        'login',
        'logout',
        'register',
        'admin/login',
    ];
}
