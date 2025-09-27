<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| Web Routes (session + CSRF)
|--------------------------------------------------------------------------
| These run through the "web" middleware.
*/

Route::view('/', 'welcome');

// Health check that never touches the DB
Route::get('/healthz', function () {
    return response('OK', 200)->header('Content-Type', 'text/plain');
});

// TEMP: check the resolved DB config at runtime (remove after debugging)
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

Route::post('/admin/login', [AuthController::class, 'adminLogin'])->name('admin.login');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
