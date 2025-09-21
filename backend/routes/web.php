<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| Web Routes (session + CSRF)
|--------------------------------------------------------------------------
| These run through the "web" middleware and are allowed to set/read
| the session cookie. Our SPA calls these from http://localhost:5173.
*/

Route::view('/', 'welcome');

// Admin cookie-based login/logout (Sanctum SPA)
Route::post('/admin/login', [AuthController::class, 'adminLogin'])->name('admin.login');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
