<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $role
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $role)
    {
        if (!Auth::check() || !$request->user()->hasRole($role)) {
            // Redirect or abort if the user doesn't have the required role
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}
