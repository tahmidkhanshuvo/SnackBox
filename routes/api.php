<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\CustomerDashboardController;
use App\Http\Controllers\StaffDashboardController;
use App\Http\Controllers\SuggestionController;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/suggestions', [SuggestionController::class, 'getSuggestions']);

    Route::middleware('role:admin')->get('/admin/dashboard', [AdminDashboardController::class, 'index']);
    Route::middleware('role:staff')->get('/staff/dashboard', [StaffDashboardController::class, 'index']);
    Route::middleware('role:customer')->get('/customer/dashboard', [CustomerDashboardController::class, 'index']);
});
