<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| Web Routes (session + CSRF)
|--------------------------------------------------------------------------
| These run through the "web" middleware and use cookies.
*/

Route::view('/', 'welcome');

// Health check (no DB)
Route::get('/healthz', fn () =>
    response('OK', 200)->header('Content-Type', 'text/plain')
);

// TEMP: check resolved DB config at runtime (remove after debugging)
Route::get('/env-check', function () {
    $conn = config('database.default');
    $cfg  = config("database.connections.$conn") ?? [];
    return response()->json([
        'connection' => $conn,
        'host'       => $cfg['host'] ?? null,
        'port'       => $cfg['port'] ?? null,
        'database'   => $cfg['database'] ?? null,
        'username'   => $cfg['username'] ?? null,
    ]);
});

// === Sanctum SPA auth endpoints (CSRF-protected; session cookies) ===
Route::post('/login',    [AuthController::class, 'login'])->middleware('throttle:6,1')->name('login');
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:6,1')->name('register');
Route::post('/logout',   [AuthController::class, 'logout'])->name('logout');

// Optional: admin login via session (kept for your admin-only routes)
Route::post('/admin/login', [AuthController::class, 'adminLogin'])
    ->middleware('throttle:6,1')
    ->name('admin.login');
