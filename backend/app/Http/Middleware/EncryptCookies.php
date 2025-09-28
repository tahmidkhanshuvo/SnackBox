<?php

namespace App\Http\Middleware;

use Illuminate\Cookie\Middleware\EncryptCookies as Middleware;

class EncryptCookies extends Middleware
{
    protected $except = [
        'XSRF-TOKEN', // let axios read it for X-XSRF-TOKEN header
    ];
}
