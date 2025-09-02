<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\InventoryMovementController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\SalaryController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\OrderController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| SPA cookie auth with Sanctum:
| 1) GET  /sanctum/csrf-cookie
| 2) POST /api/auth/login
*/

Route::get('/healthz', fn () => response()->json(['ok' => true, 'time' => now()]));

// --- Auth (session-based with Sanctum) ---
Route::prefix('auth')->group(function () {
    Route::post('/login',  [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/me',      [AuthController::class, 'me'])->middleware('auth:sanctum');
});

/*
|--------------------------------------------------------------------------
| Public endpoints (no auth)
|--------------------------------------------------------------------------
*/
Route::get('/menu-items',               [MenuItemController::class, 'index']);
Route::get('/menu-items/{menuItem}',    [MenuItemController::class, 'show']);
// Stock viewing can be public if you like:
Route::get('/menu-items/{menuItem}/stock', [InventoryMovementController::class, 'stock']);

/*
|--------------------------------------------------------------------------
| Protected endpoints
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Menu Items + Image upload
    Route::post('/menu-items',                        [MenuItemController::class, 'store']);
    Route::post('/menu-items/{menuItem}/image',       [MenuItemController::class, 'uploadImage']); // multipart/form-data
    Route::put('/menu-items/{menuItem}',              [MenuItemController::class, 'update']);
    Route::delete('/menu-items/{menuItem}',           [MenuItemController::class, 'destroy']);

    // Inventory movements (auditable stock)
    Route::post('/menu-items/{menuItem}/inventory/move', [InventoryMovementController::class, 'store']);
    Route::get('/menu-items/{menuItem}/movements',       [InventoryMovementController::class, 'index']);

    // Staff
    Route::get('/staff',             [StaffController::class, 'index']);
    Route::post('/staff',            [StaffController::class, 'store']);
    Route::get('/staff/{staff}',     [StaffController::class, 'show']);
    Route::put('/staff/{staff}',     [StaffController::class, 'update']);
    Route::patch('/staff/{staff}/toggle', [StaffController::class, 'toggleActive']);

    // Salaries
    Route::get('/salaries',               [SalaryController::class, 'index']);
    Route::post('/salaries',              [SalaryController::class, 'store']);
    Route::patch('/salaries/{salary}/mark-paid', [SalaryController::class, 'markPaid']);

    // Complaints
    Route::post('/complaints',                 [ComplaintController::class, 'store']);   // users create
    Route::get('/complaints',                  [ComplaintController::class, 'index']);   // staff/admin list
    Route::patch('/complaints/{complaint}',    [ComplaintController::class, 'update']);  // respond/change status
    Route::patch('/complaints/{complaint}/assign/{staff}', [ComplaintController::class, 'assign']);
    Route::patch('/complaints/{complaint}/resolve',        [ComplaintController::class, 'resolve']);

     // Orders
    Route::get('/orders',                         [OrderController::class, 'index']);
    Route::post('/orders',                        [OrderController::class, 'store']);
    Route::get('/orders/{order}',                 [OrderController::class, 'show']);
    Route::post('/orders/{order}/items',          [OrderController::class, 'addItem']);
    Route::delete('/orders/{order}/items/{orderItem}', [OrderController::class, 'removeItem']);
    Route::patch('/orders/{order}/status',        [OrderController::class, 'updateStatus']);
});
