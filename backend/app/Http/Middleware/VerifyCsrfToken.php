<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * URIs that should be excluded from CSRF verification.
     * Keep this EMPTY for Sanctum SPA — your API needs CSRF protection.
     *
     * @var array<int, string>
     */
    protected $except = [
        // e.g. 'webhook/*' (NOT your /api/*)
    ];
}
