<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class StaffOnly
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        abort_unless($user && ($user->isAdmin() || $user->isStaffApproved()), 403, 'Staff access required.');
        return $next($request);
    }
}
