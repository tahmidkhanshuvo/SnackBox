<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    protected $except = [
        'api/*',

        // SPA auth via web routes (temporary, can tighten later)
        'login',
        'logout',
        'register',
        'admin/login',

        // Make token endpoints immune to CSRF entirely
        'api/token-login',
        'api/token-logout',
        'api/token-register',
    ];
}
