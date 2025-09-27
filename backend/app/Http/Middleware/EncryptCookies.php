<?php

namespace App\Http\Middleware;

use Illuminate\Cookie\Middleware\EncryptCookies as Middleware;

class EncryptCookies extends Middleware
{
    /**
     * The names of the cookies that should not be encrypted.
     *
     * XSRF-TOKEN must stay readable by JS so axios can mirror it into
     * the X-XSRF-TOKEN header for CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        'XSRF-TOKEN',
    ];
}
