<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| These routes are stateless API endpoints. For SPA cookie auth with Sanctum:
| 1) Frontend first calls:   GET  /sanctum/csrf-cookie   (provided by Sanctum)
| 2) Then login:             POST /api/auth/login        { email, password }
| 3) Use cookies on further requests; protected routes use auth:sanctum.
*/

Route::get('/healthz', function () {
    return response()->json(['ok' => true, 'time' => now()]);
});

// --- Auth (session-based with Sanctum) ---
Route::prefix('auth')->group(function () {
    Route::post('/login',  [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/me',      [AuthController::class, 'me'])->middleware('auth:sanctum');
});
